import csv
import io
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from packages.incidents.analysis import CSVInputError, CSVResourceLimitError, HEADERS, analyze_csv, results_csv
from packages.incidents.rules import RULES, RULES_BLOCK, RULES_PATH, RulesConfigError, load_rules


def csv_bytes(rows, delimiter=","):
    stream = io.StringIO()
    writer = csv.writer(stream, delimiter=delimiter)
    writer.writerow(HEADERS)
    writer.writerows(rows)
    return stream.getvalue().encode("utf-8")


def record(state="cumplido", score="8"):
    return ["2026-10-07", "Paciente ficticio", "TEST-001", "Austin", state, score]


class AnalysisTests(unittest.TestCase):
    def test_mixed_records_exclude_invalid_and_report_all_errors(self):
        missing_name = record("otro", "11")
        missing_name[1] = ""
        result = analyze_csv(csv_bytes([
            record(score="8"), record(score="10"), record("cancelado", ""),
            record(score=""), missing_name,
        ]))
        self.assertEqual((result.total, result.valid, result.invalid), (5, 3, 2))
        self.assertEqual(result.by_state["cumplido"], 2)
        self.assertEqual(result.satisfaction_mean, 9)
        self.assertEqual(result.errors_by_type, {"missing_field": 2, "invalid_state": 1, "invalid_score": 1})
        self.assertEqual(len(result.errors), 4)
        self.assertNotIn("TEST-001", str(result.to_dict()))
        self.assertNotIn("Paciente ficticio", results_csv(result))

    def test_all_states_and_optional_non_completed_scores(self):
        result = analyze_csv(csv_bytes([record("cancelado", "10"), record("cancelacion tardia", ""), record("no concurrencia", "")]))
        self.assertEqual(result.valid, 3)
        self.assertIsNone(result.satisfaction_mean)
        self.assertEqual(result.satisfaction_count, 0)

    def test_scores_range_finite_and_numeric(self):
        for score in ["0", "11", "NaN", "Infinity", "-Infinity", "texto"]:
            with self.subTest(score=score):
                result = analyze_csv(csv_bytes([record(score=score)]))
                self.assertEqual(result.errors_by_type, {"invalid_score": 1})
                self.assertEqual(result.valid, 0)
        self.assertEqual(analyze_csv(csv_bytes([record(score="1"), record(score="10")])).satisfaction_mean, 5.5)

    def test_mean_rounds_decimal_before_converting_to_float(self):
        for score, expected in [("8.005", 8.00), ("8.015", 8.02), ("9.995", 10.00)]:
            with self.subTest(score=score):
                self.assertEqual(analyze_csv(csv_bytes([record(score=score)])).satisfaction_mean, expected)
        result = analyze_csv(csv_bytes([record(score="8.00"), record(score="8.01")]))
        self.assertEqual(result.satisfaction_mean, 8.00)

    def test_missing_fields_and_column_count(self):
        result = analyze_csv(csv_bytes([["", "", "", "", "cumplido", ""], record() + ["extra"], record()[:-1]]))
        self.assertEqual(result.invalid, 3)
        self.assertEqual(result.errors_by_type["missing_field"], 2)
        self.assertEqual(result.errors_by_type["invalid_columns"], 2)

    def test_input_errors(self):
        for content in [b"", b" \n", csv_bytes([]), b"foo,bar\n1,2", b"\xff", b"\x00", csv_bytes([record()]) + b'"unterminated']:
            with self.subTest(content=content):
                with self.assertRaises(CSVInputError):
                    analyze_csv(content)

    def test_bom_separators_and_multiline_records(self):
        row = record(score="7.5")
        row[1] = "Paciente\nficticio"
        for delimiter in [",", ";", "\t"]:
            with self.subTest(delimiter=delimiter):
                result = analyze_csv(b"\xef\xbb\xbf" + csv_bytes([row], delimiter))
                self.assertEqual(result.valid, 1)
                self.assertEqual(result.satisfaction_mean, 7.5)

    def test_quoted_delimiters_and_escaped_quotes_are_valid(self):
        row = record()
        row[1] = 'Paciente "ficticio", ejemplo;\t\notro dato ficticio'
        for separator in [",", ";", "\t"]:
            with self.subTest(separator=separator):
                result = analyze_csv(csv_bytes([row], separator))
                self.assertEqual((result.total, result.valid, result.invalid), (1, 1, 0))
                self.assertEqual(result.satisfaction_mean, 8)

    def test_empty_lines_are_not_records_but_empty_fields_are_invalid(self):
        result = analyze_csv(csv_bytes([record(), [], [], [""] * 6, record(score="")]))
        self.assertEqual((result.total, result.valid, result.invalid), (3, 1, 2))
        self.assertEqual({error.line for error in result.errors}, {5, 6})
        with self.assertRaises(CSVInputError):
            analyze_csv(csv_bytes([[], []]))

    def test_resource_limits_reject_whole_analysis_at_threshold(self):
        with patch("packages.incidents.analysis.MAX_RECORDS", 2):
            self.assertEqual(analyze_csv(csv_bytes([record()] * 2)).valid, 2)
            with self.assertRaisesRegex(CSVResourceLimitError, "no se publica un análisis parcial"):
                analyze_csv(csv_bytes([record()] * 3))
        with patch("packages.incidents.analysis.MAX_ERROR_DETAILS", 2):
            self.assertEqual(analyze_csv(csv_bytes([record(score="")] * 2)).invalid, 2)
            with self.assertRaisesRegex(CSVResourceLimitError, "no se omiten errores"):
                analyze_csv(csv_bytes([record(score="")] * 3))
        with patch("packages.incidents.analysis.MAX_FILE_BYTES", 1):
            with self.assertRaises(CSVResourceLimitError):
                analyze_csv(csv_bytes([record()]))

    def test_rules_are_loaded_from_healthcore_not_hardcoded(self):
        document = RULES_PATH.read_text(encoding="utf-8")
        self.assertEqual(load_rules().headers, HEADERS)
        data = json.loads(RULES_BLOCK.findall(document)[0])
        data["states"].append("pendiente")
        data["limits"]["max_records"] = 7
        changed = "<!-- healthcore-incidents-rules -->\n```json\n" + json.dumps(data) + "\n```"
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "healthcore.md"
            source.write_text(changed, encoding="utf-8")
            loaded = load_rules(source)
            self.assertIn("pendiente", loaded.states)
            self.assertEqual(loaded.max_records, 7)
            with patch("packages.incidents.analysis.STATES", loaded.states):
                self.assertEqual(analyze_csv(csv_bytes([record("pendiente", "")])).valid, 1)
            for invalid in ["", changed + changed, changed.replace('"max_records": 7', '"max_records": 0')]:
                source.write_text(invalid, encoding="utf-8")
                with self.assertRaises(RulesConfigError):
                    load_rules(source)
        self.assertEqual(RULES.public_dict()["limits"]["max_error_details"], 10000)

    def test_export_one_row_per_metric(self):
        result = analyze_csv(csv_bytes([record()]))
        rows = list(csv.DictReader(io.StringIO(results_csv(result))))
        self.assertEqual(len(rows), 13)
        self.assertEqual(len({row["metrica"] for row in rows}), len(rows))

    def test_cli_interactive_export_and_no_export(self):
        script = Path(__file__).resolve().parents[2] / "scripts" / "analyze.py"
        for answer in ["s\n", "n\n", "otra\ns\n", ""]:
            with self.subTest(answer=answer), tempfile.TemporaryDirectory() as directory:
                source = Path(directory) / "synthetic.csv"
                source.write_bytes(csv_bytes([record(), record(score="")]))
                process = subprocess.run([sys.executable, str(script), str(source)], input=answer, text=True, capture_output=True, cwd=directory, timeout=10)
                self.assertEqual(process.returncode, 0, process.stderr)
                self.assertIn("¿Deseas exportar los resultados a CSV? [s / n]", process.stdout)
                self.assertIn("Fila 3: satisfaccion", process.stdout)
                exported = Path(directory) / "results.csv"
                self.assertEqual(exported.exists(), "s\n" in answer)
                if exported.exists():
                    self.assertEqual(exported.read_text(), results_csv(analyze_csv(source.read_bytes())).replace("\r\n", "\n"))

    def test_cli_bad_path_returns_error(self):
        script = Path(__file__).resolve().parents[2] / "scripts" / "analyze.py"
        process = subprocess.run([sys.executable, str(script), "/nonexistent/synthetic.csv"], text=True, capture_output=True, timeout=10)
        self.assertEqual(process.returncode, 1)
        self.assertIn("Error:", process.stderr)


if __name__ == "__main__":
    unittest.main()