import argparse
import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from packages.incidents.analysis import CSVInputError, ERROR_LABELS, MAX_FILE_BYTES, analyze_csv, results_csv
from packages.incidents.rules import RULES


def main() -> int:
    parser = argparse.ArgumentParser(description="Análisis local de incidencias de HealthCore.")
    parser.add_argument("csv_path", type=Path, help="Ruta al fichero CSV UTF-8")
    args = parser.parse_args()
    try:
        with args.csv_path.open("rb") as source:
            result = analyze_csv(source.read(MAX_FILE_BYTES + 1))
    except (OSError, CSVInputError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1

    print("\n" + "=" * 60)
    print("HEALTHCORE | ANÁLISIS DE INCIDENCIAS")
    print("=" * 60)
    for label, value in [("Procesados", result.total), ("Válidos", result.valid), ("Inválidos", result.invalid)]:
        print(f"{label:<42} {value:>16}")
    print("-" * 60)
    for state, count in result.by_state.items():
        print(f"{state:<42} {count:>16}")
    mean = "No disponible" if result.satisfaction_mean is None else f"{result.satisfaction_mean:.2f} / {RULES.score_maximum}"
    score_label = f"Satisfacción media ({RULES.completed_state})"
    print(f"{score_label:<42} {mean:>16}")
    print(f"{'Casos con puntuación':<42} {result.satisfaction_count:>16}")
    print("-" * 60)
    for code, count in result.errors_by_type.items():
        print(f"{ERROR_LABELS[code]:<42} {count:>16}")
    for error in result.errors:
        print(f"Fila {error.line}: {error.field} | {ERROR_LABELS[error.code]}")
    print("=" * 60)
    try:
        while True:
            answer = input("¿Deseas exportar los resultados a CSV? [s / n] ").strip().lower()
            if answer in {"s", "n"}:
                break
            print("Responde s o n.")
    except (EOFError, KeyboardInterrupt):
        print("\nExportación cancelada.")
        return 0
    if answer == "s":
        try:
            Path("results.csv").write_text(results_csv(result), encoding="utf-8", newline="")
        except OSError as error:
            print(f"No se pudo exportar: {error}", file=sys.stderr)
            return 1
        print("Resultados exportados a results.csv.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())