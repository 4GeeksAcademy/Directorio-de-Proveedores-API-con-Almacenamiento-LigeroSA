import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

STORE_FILE = Path(os.environ.get("APPLICATIONS_FILE", Path(__file__).resolve().parents[2] / "data" / "applications.json"))
_lock = threading.Lock()


LEGACY_ESTADOS = {
    "completada": "cumplido",
    "no_asistio": "no concurrencia",
    "cancelada_a_tiempo": "cancelado",
    "cancelada_tardia": "cancelacion tardia",
}


def _read() -> list[dict]:
    if not STORE_FILE.exists():
        return []
    records = json.loads(STORE_FILE.read_text(encoding="utf-8"))
    for record in records:
        record.setdefault("estadoCita", "reservada")
        record["estadoCita"] = LEGACY_ESTADOS.get(record["estadoCita"], record["estadoCita"])
        record.setdefault("penaltyApplied", False)
        record.setdefault("appointmentAt", None)
        record.setdefault("durationMinutes", None)
        record.setdefault("cancelledAt", None)
        record.setdefault("billedAt", None)
    return records


def add_application(data: dict) -> dict:
    record = {
        "id": uuid4().hex,
        "createdAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "estadoCita": "reservada",
        "penaltyApplied": False,
        "cancelledAt": None,
        "billedAt": None,
        **data,
    }
    with _lock:
        records = _read()
        records.append(record)
        STORE_FILE.parent.mkdir(parents=True, exist_ok=True)
        STORE_FILE.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    return record


def list_applications(country: str = "", region: str = "", service: str = "", date: str = "") -> list[dict]:
    with _lock:
        records = _read()
    matches = [
        r
        for r in records
        if (not country or r["country"] == country)
        and (not region or r["clinicRegion"] == region)
        and (not service or r["serviceType"] == service)
        and (not date or r["preferredDate"] == date)
    ]
    return sorted(matches, key=lambda r: (r["preferredDate"], r["createdAt"]))


def get_application(application_id: str) -> dict | None:
    with _lock:
        return next((r for r in _read() if r["id"] == application_id), None)


def update_application(application_id: str, changes: dict) -> dict | None:
    with _lock:
        records = _read()
        record = next((r for r in records if r["id"] == application_id), None)
        if record is None:
            return None
        record.update(changes)
        STORE_FILE.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
        return record


def list_pending_penalties() -> list[dict]:
    with _lock:
        records = _read()
    pending = [r for r in records if r["penaltyApplied"] and r["billedAt"] is None]
    return sorted(pending, key=lambda r: r["cancelledAt"] or "")


BILLABLE_STATES = ("cumplido", "no concurrencia", "cancelacion tardia")


def list_billable_services() -> list[dict]:
    with _lock:
        records = _read()
    billable = [r for r in records if r["estadoCita"] in BILLABLE_STATES]
    return sorted(billable, key=lambda r: r["appointmentAt"] or r["preferredDate"] or "")
