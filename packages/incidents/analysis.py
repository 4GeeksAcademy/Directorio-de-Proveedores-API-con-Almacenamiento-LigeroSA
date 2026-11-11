import csv
import io
from collections import Counter
from dataclasses import asdict, dataclass, field, replace
from decimal import Decimal, InvalidOperation, ROUND_HALF_EVEN

from packages.incidents.rules import RULES


MAX_FILE_BYTES = RULES.max_file_bytes
MAX_RECORDS = RULES.max_records
MAX_ERROR_DETAILS = RULES.max_error_details
REQUIRED_FIELDS = RULES.required_fields
HEADERS = RULES.headers
STATES = RULES.states
ERROR_LABELS = RULES.error_labels
STATE_FIELD = RULES.fields["state"]
SCORE_FIELD = RULES.fields["satisfaction"]
DATE_FIELD = RULES.fields["date"]
LOCATION_FIELD = RULES.fields["location"]
IDENTITY_FIELD = RULES.fields["identity"]


class CSVInputError(ValueError):
    pass


class CSVResourceLimitError(CSVInputError):
    pass


@dataclass(frozen=True)
class RecordError:
    line: int
    field: str
    code: str


@dataclass(frozen=True)
class AnalysisResult:
    total: int
    valid: int
    invalid: int
    by_state: dict[str, int]
    satisfaction_mean: float | None
    satisfaction_count: int
    errors_by_type: dict[str, int]
    errors: list[RecordError]
    unique_patients: int = 0
    rows: tuple[dict, ...] = field(default=(), compare=False, repr=False)

    def to_dict(self) -> dict:
        return asdict(replace(self, rows=()))


def analyze_csv(content: bytes) -> AnalysisResult:
    if len(content) > MAX_FILE_BYTES:
        raise CSVResourceLimitError(f"El fichero supera el límite de {MAX_FILE_BYTES} bytes; no se publica un análisis parcial.")
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise CSVInputError("El CSV debe estar codificado en UTF-8.") from None
    if not text.strip():
        raise CSVInputError("El fichero está vacío.")
    if "\x00" in text:
        raise CSVInputError("El fichero contiene datos binarios, no un CSV de texto.")
    try:
        source = io.StringIO(text, newline="")
        dialect = csv.Sniffer().sniff(source.readline(), delimiters=",;\t")
        source.seek(0)
        reader = csv.reader(source, dialect, strict=True, doublequote=True)
        headers = [field.strip() for field in next(reader)]
    except (csv.Error, StopIteration):
        raise CSVInputError("No se reconoce una cabecera CSV válida.") from None
    if len(headers) != len(HEADERS) or set(headers) != set(HEADERS):
        raise CSVInputError("La cabecera debe contener exactamente: " + ", ".join(HEADERS))

    total = valid = 0
    states = dict.fromkeys(STATES, 0)
    score_total = Decimal(0)
    score_count = 0
    errors: list[RecordError] = []
    counts: Counter[str] = Counter()
    identities: set[str] = set()
    kept: list[dict] = []
    try:
        for values in reader:
            if not values:
                continue
            total += 1
            if total > MAX_RECORDS:
                raise CSVResourceLimitError(f"El CSV supera el límite de {MAX_RECORDS} registros; no se publica un análisis parcial.")
            row_errors: list[RecordError] = []
            if len(values) != len(headers):
                row_errors.append(RecordError(reader.line_num, "fila", "invalid_columns"))
            row = dict(zip(headers, (value.strip() for value in values)))
            for field in REQUIRED_FIELDS:
                if not row.get(field):
                    row_errors.append(RecordError(reader.line_num, field, "missing_field"))
            state = row.get(STATE_FIELD, "")
            if state and state not in STATES:
                row_errors.append(RecordError(reader.line_num, STATE_FIELD, "invalid_state"))
            score_text = row.get(SCORE_FIELD, "")
            score = None
            if state == RULES.completed_state and RULES.score_required and not score_text:
                row_errors.append(RecordError(reader.line_num, SCORE_FIELD, "missing_field"))
            if score_text:
                try:
                    score = Decimal(score_text)
                    if not score.is_finite() or not RULES.score_minimum <= score <= RULES.score_maximum:
                        raise InvalidOperation
                except InvalidOperation:
                    row_errors.append(RecordError(reader.line_num, SCORE_FIELD, "invalid_score"))
            if row_errors:
                if len(errors) + len(row_errors) > MAX_ERROR_DETAILS:
                    raise CSVResourceLimitError(f"El CSV supera el límite de {MAX_ERROR_DETAILS} detalles de error; no se omiten errores ni se publica un análisis parcial.")
                errors.extend(row_errors)
                counts.update({error.code for error in row_errors})
                continue
            valid += 1
            states[state] += 1
            identities.add(row[IDENTITY_FIELD])
            kept_score = float(score) if state == RULES.completed_state and score is not None else None
            if kept_score is not None:
                score_total += score
                score_count += 1
            kept.append({"date": row[DATE_FIELD], "location": row[LOCATION_FIELD], "state": state, "score": kept_score})
    except csv.Error:
        raise CSVInputError("El CSV tiene una estructura incorrecta; revisa las comillas y columnas.") from None
    if total == 0:
        raise CSVInputError("El CSV contiene cabeceras, pero no registros.")
    mean = float((score_total / score_count).quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)) if score_count else None
    return AnalysisResult(total, valid, total - valid, states, mean, score_count, dict(counts), errors, len(identities), tuple(kept))


def results_csv(result: AnalysisResult) -> str:
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(["metrica", "valor"])
    writer.writerows([
        ("total_procesados", result.total), ("validos", result.valid),
        ("invalidos", result.invalid),
        *[(f"estado:{state}", count) for state, count in result.by_state.items()],
        ("satisfaccion_media", "" if result.satisfaction_mean is None else f"{result.satisfaction_mean:.2f}"),
        ("satisfaccion_casos", result.satisfaction_count),
        *[(f"error:{code}", result.errors_by_type.get(code, 0)) for code in ERROR_LABELS],
    ])
    return output.getvalue()