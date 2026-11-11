from decimal import ROUND_HALF_EVEN, Decimal, InvalidOperation

from packages.incidents.rules import RULES

AGENDA_STATES = ("reservada", "coordinado", "cumplido", "no concurrencia", "cancelado", "cancelacion tardia")


def score_of(value) -> Decimal | None:
    if isinstance(value, bool) or value in (None, ""):
        return None
    try:
        score = Decimal(str(value))
    except InvalidOperation:
        return None
    if not score.is_finite() or not RULES.score_minimum <= score <= RULES.score_maximum:
        return None
    return score



def summarize(records: list[dict]) -> dict:
    agenda_by_state = {state: 0 for state in AGENDA_STATES}
    for record in records:
        if record.get("estadoCita") in agenda_by_state:
            agenda_by_state[record["estadoCita"]] += 1
    by_state = {state: 0 for state in RULES.states}
    errors_by_type = {code: 0 for code in RULES.error_labels}
    errors: list[dict] = []
    total = valid = pending = 0
    scores: list[Decimal] = []

    for line, record in enumerate(records, start=1):
        state = record.get("estadoCita")
        if state not in RULES.states:
            pending += 1
            continue
        total += 1
        values = {
            "Fecha": record.get("appointmentAt") or record.get("preferredDate"),
            "nombre del usuario": f"{record.get('firstName', '')} {record.get('lastName', '')}".strip(),
            "documento de identidad": record.get("identityDocument"),
            "locación": record.get("clinicRegion"),
            "estado": state,
        }
        missing = [field for field in RULES.required_fields if not values.get(field)]
        if missing:
            errors_by_type["missing_field"] += 1
            errors.extend({"line": line, "field": field, "code": "missing_field"} for field in missing)
            continue
        if state == RULES.completed_state:
            score = score_of(record.get("satisfaccion"))
            if score is None:
                errors_by_type["invalid_score"] += 1
                errors.append({"line": line, "field": RULES.fields["satisfaction"], "code": "invalid_score"})
                continue
            scores.append(score)
        valid += 1
        by_state[state] += 1

    mean = None
    if scores:
        mean = float((sum(scores) / len(scores)).quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN))

    return {
        "total": total,
        "valid": valid,
        "invalid": total - valid,
        "pending": pending,
        "agenda_total": len(records),
        "agenda_by_state": agenda_by_state,
        "by_state": by_state,
        "satisfaction_mean": mean,
        "satisfaction_count": len(scores),
        "errors_by_type": errors_by_type,
        "errors": errors,
        "states": list(RULES.states),
        "error_labels": dict(RULES.error_labels),
    }
