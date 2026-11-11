import json
import os
from pathlib import Path

CATALOG_FILE = Path(os.environ.get("CATALOG_FILE", Path(__file__).resolve().parent / "catalog.json"))
CATALOG = json.loads(CATALOG_FILE.read_text(encoding="utf-8"))


def provider(provider_id: str) -> dict | None:
    return next((p for p in CATALOG["providers"] if p["id"] == provider_id), None)


def provider_supports(provider_id: str, region: str, service: str) -> bool:
    current = provider(provider_id)
    return current is not None and region in current["regions"] and service in current["specialties"]


def duration_minutes(service: str) -> int:
    return CATALOG["specialties"][service]["durationMinutes"]


def fee(service: str, country: str) -> float:
    return CATALOG["specialties"][service]["fee"][country]
