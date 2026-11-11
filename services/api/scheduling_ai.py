import json
import os
from datetime import datetime

import httpx

from services.api import applications, scheduling

LLM_BASE_URL = os.environ.get("LLM_BASE_URL", "https://llm.4geeks.ai/v1").rstrip("/")
LLM_MODEL = os.environ.get("LLM_MODEL", "online/openrouter/deepseek/deepseek-v4-flash")
MAX_CANDIDATES = 20
MAX_SUGGESTIONS = 3
INVALID_RESPONSE = "Respuesta inválida del asistente."

SYSTEM_PROMPT = (
    "Un horario de cita quedó libre por una cancelación. Elige hasta 3 solicitudes de la lista a las que "
    "conviene ofrecer ese horario, respetando el orden de la lista, que es por antigüedad de la solicitud. "
    "Usa solo los ids de la lista. Responde solo JSON con la forma "
    '{"suggestions": [{"id": "0", "reason": "motivo breve"}]}.'
)


class AIUnavailable(Exception):
    pass


def _ask_model(api_key: str, payload_data: dict) -> list[dict]:
    payload = {
        "model": LLM_MODEL,
        "temperature": 0,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(payload_data, ensure_ascii=False)},
        ],
    }
    try:
        response = httpx.post(
            f"{LLM_BASE_URL}/chat/completions",
            json=payload,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=30,
        )
    except httpx.HTTPError:
        raise AIUnavailable("No se pudo contactar al asistente.") from None
    if response.status_code != 200:
        raise AIUnavailable("El asistente respondió con error.")
    try:
        content = response.json()["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError, ValueError):
        raise AIUnavailable(INVALID_RESPONSE) from None
    start, end = content.find("{"), content.rfind("}")
    if start == -1 or end == -1:
        raise AIUnavailable(INVALID_RESPONSE)
    try:
        data = json.loads(content[start : end + 1])
    except json.JSONDecodeError:
        raise AIUnavailable(INVALID_RESPONSE) from None
    items = data.get("suggestions") if isinstance(data, dict) else None
    if not isinstance(items, list):
        raise AIUnavailable(INVALID_RESPONSE)
    return items


def suggest_recipients(freed_id: str) -> list[dict]:
    api_key = os.environ.get("LLM_API_KEY", "")
    if not api_key:
        raise AIUnavailable("LLM_API_KEY no configurada en el servidor.")
    freed = applications.get_application(freed_id)
    if freed is None:
        raise scheduling.BookingError(404, "Cita cancelada no encontrada.")
    if freed["estadoCita"] not in scheduling.CANCELLED_STATES or not freed.get("appointmentAt"):
        raise scheduling.BookingError(409, "La solicitud no corresponde a un horario liberado.")
    candidates = scheduling.suggest_pending(freed, limit=MAX_CANDIDATES)
    if not candidates:
        return []
    by_key = {str(index): candidate for index, candidate in enumerate(candidates)}
    options = [
        {"id": key, "fechaPreferida": c["preferredDate"], "solicitadoEn": c["createdAt"]}
        for key, c in by_key.items()
    ]
    payload_data = {
        "horarioLiberado": freed["appointmentAt"],
        "servicio": freed["serviceType"],
        "region": freed["clinicRegion"],
        "solicitudes": options,
    }
    items = _ask_model(api_key, payload_data)
    result: list[dict] = []
    seen: set[str] = set()
    for item in items:
        if not isinstance(item, dict):
            continue
        key = str(item.get("id", ""))
        if key not in by_key or key in seen:
            continue
        seen.add(key)
        result.append({**by_key[key], "reason": str(item.get("reason", ""))[:200]})
        if len(result) == MAX_SUGGESTIONS:
            break
    return result
