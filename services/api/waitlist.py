import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

WAITLIST_FILE = Path(os.environ.get("WAITLIST_FILE", Path(__file__).resolve().parents[2] / "data" / "waitlist.json"))
_lock = threading.Lock()


def _read() -> list[dict]:
    if not WAITLIST_FILE.exists():
        return []
    return json.loads(WAITLIST_FILE.read_text(encoding="utf-8"))


def _write(records: list[dict]) -> None:
    WAITLIST_FILE.parent.mkdir(parents=True, exist_ok=True)
    WAITLIST_FILE.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")


def add_entry(data: dict) -> dict:
    record = {"id": uuid4().hex, "createdAt": datetime.now(timezone.utc).isoformat(timespec="seconds"), **data}
    with _lock:
        records = _read()
        records.append(record)
        _write(records)
    return record


def list_entries(service: str = "", region: str = "") -> list[dict]:
    with _lock:
        records = _read()
    matches = [
        r
        for r in records
        if (not service or r["serviceType"] == service) and (not region or r["clinicRegion"] == region)
    ]
    return sorted(matches, key=lambda r: r["createdAt"])


def next_candidate(service: str, region: str) -> dict | None:
    entries = list_entries(service, region)
    return entries[0] if entries else None


def remove_entry(entry_id: str) -> bool:
    with _lock:
        records = _read()
        remaining = [r for r in records if r["id"] != entry_id]
        if len(remaining) == len(records):
            return False
        _write(remaining)
    return True
