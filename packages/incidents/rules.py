import json
import re
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path


RULES_PATH = Path(__file__).resolve().parents[2] / "healthcore.md"
RULES_BLOCK = re.compile(r"<!-- healthcore-incidents-rules -->\s*```json\s*(.*?)\s*```", re.DOTALL)
FIELD_ROLES = ("date", "name", "identity", "location", "state", "satisfaction")
ERROR_CODES = ("missing_field", "invalid_state", "invalid_score", "invalid_columns")


class RulesConfigError(ValueError):
    pass


@dataclass(frozen=True)
class BusinessRules:
    fields: dict[str, str]
    required_fields: tuple[str, ...]
    states: tuple[str, ...]
    completed_state: str
    score_minimum: Decimal
    score_maximum: Decimal
    score_required: bool
    max_file_bytes: int
    max_records: int
    max_error_details: int
    error_labels: dict[str, str]

    @property
    def headers(self) -> tuple[str, ...]:
        return tuple(self.fields[role] for role in FIELD_ROLES)

    def public_dict(self) -> dict:
        return {
            "headers": list(self.headers),
            "required_fields": list(self.required_fields),
            "states": list(self.states),
            "completed_state": self.completed_state,
            "satisfaction": {
                "minimum": float(self.score_minimum), "maximum": float(self.score_maximum),
                "required_for_completed": self.score_required,
            },
            "limits": {
                "max_file_bytes": self.max_file_bytes, "max_records": self.max_records,
                "max_error_details": self.max_error_details,
            },
            "error_labels": dict(self.error_labels),
        }


def unique_object(pairs: list[tuple[str, object]]) -> dict:
    result = {}
    for key, value in pairs:
        if key in result:
            raise RulesConfigError("Las reglas JSON contienen claves duplicadas.")
        result[key] = value
    return result


def load_rules(path: Path = RULES_PATH) -> BusinessRules:
    try:
        blocks = RULES_BLOCK.findall(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError):
        raise RulesConfigError("No se pudo leer healthcore.md para cargar las reglas.") from None
    if len(blocks) != 1:
        raise RulesConfigError("healthcore.md debe contener un único bloque healthcore-incidents-rules.")
    try:
        data = json.loads(blocks[0], object_pairs_hook=unique_object)
    except json.JSONDecodeError:
        raise RulesConfigError("El bloque de reglas de healthcore.md no es JSON válido.") from None
    try:
        fields = data["fields"]
        required = data["required_fields"]
        states = data["states"]
        satisfaction = data["satisfaction"]
        limits = data["limits"]
        labels = data["error_labels"]
        if set(data) != {"fields", "required_fields", "states", "completed_state", "satisfaction", "limits", "error_labels"}:
            raise ValueError
        if set(fields) != set(FIELD_ROLES) or any(not isinstance(value, str) or not value.strip() or value != value.strip() for value in fields.values()):
            raise ValueError
        if len(set(fields.values())) != len(FIELD_ROLES):
            raise ValueError
        if not isinstance(required, list) or len(required) != 5 or set(required) != {fields[role] for role in FIELD_ROLES[:-1]}:
            raise ValueError
        if not isinstance(states, list) or not states or any(not isinstance(state, str) or not state.strip() or state != state.strip() for state in states):
            raise ValueError
        if len(set(states)) != len(states) or data["completed_state"] not in states:
            raise ValueError
        if set(satisfaction) != {"minimum", "maximum", "required_for_completed"}:
            raise ValueError
        if any(type(satisfaction[key]) not in {int, float} for key in ("minimum", "maximum")):
            raise ValueError
        minimum, maximum = (Decimal(str(satisfaction[key])) for key in ("minimum", "maximum"))
        if not minimum.is_finite() or not maximum.is_finite() or minimum > maximum or type(satisfaction["required_for_completed"]) is not bool:
            raise ValueError
        if set(limits) != {"max_file_bytes", "max_records", "max_error_details"} or any(type(value) is not int or value <= 0 for value in limits.values()):
            raise ValueError
        if set(labels) != set(ERROR_CODES) or any(not isinstance(value, str) or not value.strip() for value in labels.values()):
            raise ValueError
        return BusinessRules(dict(fields), tuple(required), tuple(states), data["completed_state"], minimum, maximum,
                             satisfaction["required_for_completed"], limits["max_file_bytes"], limits["max_records"],
                             limits["max_error_details"], dict(labels))
    except (KeyError, TypeError, ValueError, AttributeError):
        raise RulesConfigError("Las reglas de healthcore.md tienen campos, estados, escala o límites incorrectos.") from None


RULES = load_rules()