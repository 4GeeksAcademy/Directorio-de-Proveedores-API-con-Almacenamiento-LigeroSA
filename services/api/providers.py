import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

PROVIDERS_FILE = Path(os.environ.get("PROVIDERS_FILE", Path(__file__).resolve().parents[2] / "data" / "providers.json"))
_lock = threading.Lock()


def _read() -> list[dict]:
    if not PROVIDERS_FILE.exists():
        return []
    return json.loads(PROVIDERS_FILE.read_text(encoding="utf-8"))


def _write(records: list[dict]) -> None:
    PROVIDERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    PROVIDERS_FILE.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")


def add_provider(data: dict) -> dict:
    record = {
        "id": f"STF-{uuid4().hex[:8].upper()}",
        "createdAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        **data,
    }
    with _lock:
        records = _read()
        records.append(record)
        _write(records)
    return record


def list_providers(serviceType: str = "", clinicRegion: str = "") -> list[dict]:
    with _lock:
        records = _read()
    return [
        r
        for r in records
        if (not serviceType or r["serviceType"] == serviceType) and (not clinicRegion or r["clinicRegion"] == clinicRegion)
    ]


def get_provider(provider_id: str) -> dict | None:
    with _lock:
        return next((r for r in _read() if r["id"] == provider_id), None)
