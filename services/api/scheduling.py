import csv
import io
import threading
from datetime import date, datetime, timedelta

from services.api import applications, catalog, providers

BOOKED_STATES = ("reservada", "coordinado", "cumplido", "no concurrencia")
OFFER_DEADLINE = timedelta(hours=2)
CSV_HEADERS = ["Fecha", "Horario", "Nombre", "Documento de identidad", "Prestador", "Locación"]
_booking_lock = threading.Lock()


class BookingError(Exception):
    def __init__(self, status: int, detail: str):
        super().__init__(detail)
        self.status = status
        self.detail = detail


def _minutes(clock: str) -> int:
    hours, minutes = clock.split(":")
    return int(hours) * 60 + int(minutes)


def _booked_intervals(provider_id: str, records: list[dict], exclude_id: str | None = None) -> list[tuple[datetime, datetime]]:
    intervals = []
    for record in records:
        if record.get("providerId") != provider_id or not record.get("appointmentAt"):
            continue
        if record["estadoCita"] not in BOOKED_STATES or record["id"] == exclude_id:
            continue
        start = datetime.fromisoformat(record["appointmentAt"])
        duration = record.get("durationMinutes") or catalog.duration_minutes(record["serviceType"])
        intervals.append((start, start + timedelta(minutes=duration)))
    return intervals


def free_slots(provider: dict, day: date, duration: int, records: list[dict], now: datetime) -> list[str]:
    # Weekday numbers follow Python: 0 = Monday, 6 = Sunday.
    if day.weekday() not in provider["days"]:
        return []
    busy = _booked_intervals(provider["id"], records)
    midnight = datetime.combine(day, datetime.min.time())
    current = midnight + timedelta(minutes=_minutes(provider["startTime"]))
    closing = midnight + timedelta(minutes=_minutes(provider["endTime"]))
    slots = []
    while current + timedelta(minutes=duration) <= closing:
        end = current + timedelta(minutes=duration)
        overlaps = any(current < busy_end and busy_start < end for busy_start, busy_end in busy)
        if current > now and not overlaps:
            slots.append(current.isoformat(timespec="minutes"))
        current = end
    return slots


def search_availability(service: str, region: str, day: date, now: datetime) -> list[dict]:
    records = applications.list_applications()
    duration = catalog.duration_minutes(service)
    results = []
    for provider in providers.list_providers(service, region):
        name = f"{provider['firstName']} {provider['lastName']}"
        for slot in free_slots(provider, day, duration, records, now):
            results.append({"providerId": provider["id"], "providerName": name, "appointmentAt": slot, "durationMinutes": duration})
    return sorted(results, key=lambda item: (item["appointmentAt"], item["providerName"]))


def search_range(service: str, region: str, start: date, days: int, now: datetime) -> list[dict]:
    records = applications.list_applications()
    duration = catalog.duration_minutes(service)
    provs = providers.list_providers(service, region)
    grouped = []
    for offset in range(days):
        day = start + timedelta(days=offset)
        slots = []
        for provider in provs:
            name = f"{provider['firstName']} {provider['lastName']}"
            for slot in free_slots(provider, day, duration, records, now):
                slots.append({"providerId": provider["id"], "providerName": name, "appointmentAt": slot, "durationMinutes": duration})
        if slots:
            grouped.append({"date": day.isoformat(), "slots": sorted(slots, key=lambda item: (item["appointmentAt"], item["providerName"]))})
    return grouped


def offer_slot(application_id: str, provider_id: str, appointment_at: str, now: datetime) -> dict:
    try:
        start = datetime.fromisoformat(appointment_at)
    except ValueError:
        raise BookingError(422, "Hora de cita inválida.") from None
    with _booking_lock:
        record = applications.get_application(application_id)
        if record is None:
            raise BookingError(404, "Solicitud no encontrada.")
        if record["estadoCita"] != "reservada" or record["appointmentAt"]:
            raise BookingError(409, "Solo se pueden asignar horarios a solicitudes pendientes sin cita.")
        provider = providers.get_provider(provider_id)
        if provider is None or provider["clinicRegion"] != record["clinicRegion"] or provider["serviceType"] != record["serviceType"]:
            raise BookingError(422, "El prestador no atiende esa región o servicio.")
        if start - now < OFFER_DEADLINE:
            raise BookingError(409, "La oferta ya no puede aceptarse: faltan menos de 2 horas para el turno.")
        duration = catalog.duration_minutes(record["serviceType"])
        if appointment_at not in free_slots(provider, start.date(), duration, applications.list_applications(), now):
            raise BookingError(409, "El horario ya no está disponible.")
        changes = {
            "providerId": provider_id,
            "appointmentAt": appointment_at,
            "durationMinutes": duration,
            "estadoCita": "coordinado",
        }
        return applications.update_application(application_id, changes)


def suggest_pending(freed: dict, limit: int = 5) -> list[dict]:
    pending = [
        r
        for r in applications.list_applications()
        if r["estadoCita"] == "reservada"
        and not r["appointmentAt"]
        and r["serviceType"] == freed["serviceType"]
        and r["clinicRegion"] == freed["clinicRegion"]
    ]
    pending.sort(key=lambda r: r["createdAt"])
    fields = ("id", "firstName", "lastName", "preferredDate", "contactMethod", "phone", "email", "createdAt")
    return [{field: r[field] for field in fields} for r in pending[:limit]]


CANCELLED_STATES = ("cancelado", "cancelacion tardia")


def list_freed_slots() -> list[dict]:
    records = applications.list_applications()
    booked = {(r.get("providerId"), r["appointmentAt"]) for r in records if r["estadoCita"] in BOOKED_STATES and r.get("appointmentAt")}
    freed = [
        r
        for r in records
        if r["estadoCita"] in CANCELLED_STATES
        and not (r.get("appointmentAt") and r.get("providerId") and (r["providerId"], r["appointmentAt"]) in booked)
    ]
    return sorted(freed, key=lambda r: (not r.get("appointmentAt"), r.get("appointmentAt") or "", r.get("cancelledAt") or ""))


def _safe_cell(value: str) -> str:
    return "'" + value if value.startswith(("=", "+", "-", "@")) else value


def agenda_csv(day: str = "") -> str:
    booked = [
        r
        for r in applications.list_applications()
        if r.get("appointmentAt") and r["estadoCita"] in BOOKED_STATES and (not day or r["appointmentAt"][:10] == day)
    ]
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(CSV_HEADERS)
    for r in sorted(booked, key=lambda r: r["appointmentAt"]):
        provider = providers.get_provider(r["providerId"])
        provider_name = f"{provider['firstName']} {provider['lastName']}" if provider else (catalog.provider(r["providerId"]) or {}).get("name", r["providerId"])
        writer.writerow([
            _safe_cell(r["appointmentAt"][:10]),
            _safe_cell(r["appointmentAt"][11:]),
            _safe_cell(f"{r['firstName']} {r['lastName']}"),
            _safe_cell(r["identityDocument"]),
            _safe_cell(provider_name),
            _safe_cell(r["clinicRegion"]),
        ])
    return "\ufeff" + buffer.getvalue()
