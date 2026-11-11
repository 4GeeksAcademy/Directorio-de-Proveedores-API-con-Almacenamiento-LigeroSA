import asyncio
import os
import time
from contextlib import asynccontextmanager
from datetime import date, datetime
from pathlib import Path
from typing import Literal
from uuid import uuid4
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool
from starlette.datastructures import UploadFile
from starlette.formparsers import MultiPartException, MultiPartParser
from starlette.middleware.trustedhost import TrustedHostMiddleware

from packages.incidents.analysis import AnalysisResult, CSVInputError, CSVResourceLimitError, MAX_FILE_BYTES, analyze_csv, results_csv
from packages.incidents.rules import RULES
from services.api import agenda_analysis, applications, catalog, providers, scheduling, scheduling_ai, staff_auth, waitlist


FRONTEND = Path(__file__).resolve().parents[2] / "uis" / "backoffice"
SESSION_TTL = 30 * 60
MAX_SESSIONS = 32
MAX_ACTIVE_ANALYSES = 2
PURGE_INTERVAL_SECONDS = 60
COOKIE_NAME = "healthcore_analysis"
STAFF_COOKIE_NAME = "healthcore_staff"
STAFF_FRONTEND = Path(__file__).resolve().parents[2] / "uis" / "staff"
PROJECT_ROOT = Path(__file__).resolve().parents[2]
STAFF_ASSETS = {
    "staff.css": STAFF_FRONTEND / "staff.css",
    "login.js": STAFF_FRONTEND / "login.js",
    "dashboard.js": STAFF_FRONTEND / "dashboard.js",
}
ASSETS = {
    "app.js": FRONTEND / "app.js",
    "styles.css": FRONTEND / "styles.css",
    "node_modules/lucide/dist/umd/lucide.js": FRONTEND / "node_modules" / "lucide" / "dist" / "umd" / "lucide.js",
}


class UploadTooLarge(MultiPartException):
    pass


class MemoryMultipartParser(MultiPartParser):
    spool_max_size = MAX_FILE_BYTES + 65536


async def expire_sessions(stop: asyncio.Event) -> None:
    while not stop.is_set():
        try:
            await asyncio.wait_for(stop.wait(), timeout=PURGE_INTERVAL_SECONDS)
        except TimeoutError:
            purge_results()


@asynccontextmanager
async def lifespan(application: FastAPI):
    stop = asyncio.Event()
    cleanup = asyncio.create_task(expire_sessions(stop))
    try:
        yield
    finally:
        stop.set()
        await cleanup
        application.state.results.clear()


PUBLIC_SITE_ORIGIN = os.environ.get("PUBLIC_SITE_ORIGIN", "https://bookish-computing-machine-96w46rg67x73v7w-8001.app.github.dev")
REGIONS_BY_COUNTRY = {"US": {"Texas", "Florida", "Georgia"}, "UK": {"London", "Manchester"}}
CLINIC_TIMEZONE = ZoneInfo(os.environ.get("CLINIC_TIMEZONE", "UTC"))
CANCEL_PENALTY_WINDOW_HOURS = 8

app = FastAPI(title="HealthCore | Análisis local", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "[::1]", "testserver", "*.app.github.dev"],
)
app.add_middleware(CORSMiddleware, allow_origins=[PUBLIC_SITE_ORIGIN], allow_methods=["POST"], allow_headers=["Content-Type"])
app.state.results = {}
app.state.active_analyses = 0

PUBLIC_PAGE_PATHS = {"/", "/application.html"}
# Public landing uses CDN Tailwind, Leaflet and inline config scripts.
PUBLIC_PAGE_CSP = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; "
    "font-src 'self' https://fonts.gstatic.com data:; "
    "img-src 'self' data: blob: https:; media-src 'self'; connect-src 'self' https:; "
    "object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
)


@app.middleware("http")
async def local_security(request: Request, call_next):
    origin = request.headers.get("origin")
    host = request.headers.get("host", "")
    # The proxy may forward as http while the browser sends https.
    same_host_origins = {f"https://{host}", f"http://{host}"}
    from_public_form = request.url.path == "/api/applications" and origin == PUBLIC_SITE_ORIGIN
    if request.url.path.startswith("/api/") and not from_public_form and (
        request.headers.get("sec-fetch-site") == "cross-site"
        or (origin is not None and origin not in same_host_origins)
    ):
        response = JSONResponse({"detail": "Origen no permitido."}, status_code=403)
    else:
        response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    if request.url.path in PUBLIC_PAGE_PATHS or request.url.path.startswith("/Recursos Graficos/"):
        response.headers["Content-Security-Policy"] = PUBLIC_PAGE_CSP
    else:
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data:; connect-src 'self'; object-src 'none'; "
            "frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
        )
    return response


def purge_results() -> None:
    cutoff = time.monotonic() - SESSION_TTL
    for token, (created, _) in list(app.state.results.items()):
        if created < cutoff:
            del app.state.results[token]


async def read_upload(request: Request) -> bytes:
    if request.headers.get("content-type", "").split(";", 1)[0].strip().lower() != "multipart/form-data":
        raise HTTPException(415, "Se requiere multipart/form-data con un fichero CSV en el campo file.")

    async def limited_stream():
        received = 0
        async for chunk in request.stream():
            received += len(chunk)
            if received > MAX_FILE_BYTES + 65536:
                raise UploadTooLarge(f"El fichero supera el límite de {MAX_FILE_BYTES} bytes.")
            yield chunk

    parser = MemoryMultipartParser(request.headers, limited_stream(), max_files=1, max_fields=0)
    try:
        form = await parser.parse()
    except UploadTooLarge:
        raise HTTPException(413, f"El fichero supera el límite de {MAX_FILE_BYTES} bytes.") from None
    except MultiPartException:
        raise HTTPException(400, "Carga multipart incorrecta; envía un único fichero en el campo file.") from None
    try:
        upload = form.get("file")
        if not isinstance(upload, UploadFile) or len(form.multi_items()) != 1:
            raise HTTPException(400, "Envía un único fichero en el campo file.")
        if not (upload.filename or "").lower().endswith(".csv"):
            raise HTTPException(400, "El fichero debe tener extensión .csv y contenido CSV UTF-8.")
        content = await upload.read(MAX_FILE_BYTES + 1)
        if len(content) > MAX_FILE_BYTES:
            raise HTTPException(413, f"El fichero supera el límite de {MAX_FILE_BYTES} bytes.") from None
        return content
    finally:
        await form.close()


@app.post("/api/incidents/analyze")
async def analyze(request: Request, response: Response):
    if app.state.active_analyses >= MAX_ACTIVE_ANALYSES:
        raise HTTPException(429, "Hay dos análisis en curso. Inténtalo de nuevo cuando terminen.", headers={"Retry-After": "1"})
    app.state.active_analyses += 1
    try:
        content = await read_upload(request)
        try:
            result = await run_in_threadpool(analyze_csv, content)
        except CSVResourceLimitError as error:
            raise HTTPException(413, str(error)) from None
        except CSVInputError as error:
            raise HTTPException(400, str(error)) from None
        purge_results()
        previous = request.cookies.get(COOKIE_NAME)
        app.state.results.pop(previous, None)
        if len(app.state.results) >= MAX_SESSIONS:
            oldest = min(app.state.results, key=lambda token: app.state.results[token][0])
            del app.state.results[oldest]
        token = uuid4().hex
        app.state.results[token] = (time.monotonic(), result)
        response.set_cookie(COOKIE_NAME, token, httponly=True, samesite="strict", max_age=SESSION_TTL, path="/api/incidents")
        return result.to_dict()
    finally:
        app.state.active_analyses -= 1


@app.get("/api/incidents/schema")
async def schema():
    return RULES.public_dict()


@app.get("/api/incidents/results/rows")
async def result_rows(request: Request):
    purge_results()
    stored = app.state.results.get(request.cookies.get(COOKIE_NAME))
    if stored is None:
        raise HTTPException(404, "No hay un análisis disponible en esta sesión. Carga un CSV primero.")
    return {"rows": list(stored[1].rows)}


@app.get("/api/incidents/results/export")
async def export_results(request: Request):
    purge_results()
    stored = app.state.results.get(request.cookies.get(COOKIE_NAME))
    if stored is None:
        raise HTTPException(404, "No hay un análisis disponible en esta sesión. Carga un CSV primero.")
    result: AnalysisResult = stored[1]
    return Response(results_csv(result), media_type="text/csv; charset=utf-8", headers={
        "Content-Disposition": 'attachment; filename="results.csv"'
    })


class StaffLogin(BaseModel):
    email: str = Field(max_length=254)
    password: str = Field(max_length=256)


@app.post("/api/staff/login")
async def staff_login(credentials: StaffLogin, response: Response):
    email = credentials.email.strip().lower()
    if not await run_in_threadpool(staff_auth.authenticate, email, credentials.password):
        raise HTTPException(401, "Correo o contraseña incorrectos.")
    token = staff_auth.create_session(email)
    response.set_cookie(STAFF_COOKIE_NAME, token, httponly=True, samesite="lax", max_age=staff_auth.SESSION_TTL, path="/")
    return {"email": email}


@app.get("/api/staff/session")
async def staff_session(request: Request):
    email = staff_auth.get_session(request.cookies.get(STAFF_COOKIE_NAME))
    if email is None:
        raise HTTPException(401, "Sesión no iniciada.")
    return {"email": email}


@app.post("/api/staff/logout")
async def staff_logout(request: Request, response: Response):
    staff_auth.end_session(request.cookies.get(STAFF_COOKIE_NAME))
    response.delete_cookie(STAFF_COOKIE_NAME, path="/")
    return {"ok": True}


class ApplicationIn(BaseModel):
    firstName: str = Field(min_length=2, max_length=80)
    lastName: str = Field(min_length=2, max_length=80)
    email: str = Field(max_length=254)
    phone: str = Field(max_length=32)
    birthDate: str = Field(max_length=10)
    preferredLanguage: Literal["en", "es"]
    country: Literal["US", "UK"]
    clinicRegion: Literal["Texas", "Florida", "Georgia", "London", "Manchester"]
    serviceType: Literal["primary-care", "specialist"]
    preferredDate: str = Field(max_length=10)
    payerType: Literal["private-insurance", "medicare-medicaid", "nhs", "self-pay"]
    insuranceProvider: str = Field(default="", max_length=120)
    policyNumber: str = Field(default="", max_length=40)
    healthNotes: str = Field(min_length=1, max_length=2000)
    contactMethod: Literal["phone", "email", "sms"]
    bestTime: Literal["morning", "afternoon", "evening"]
    identityDocument: str = Field(default="", pattern=r"^$|^[A-Za-z0-9.\-]{5,20}$")
    providerId: str = Field(default="", max_length=20)
    appointmentAt: str = Field(default="", pattern=r"^$|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$")


@app.post("/api/applications", status_code=201)
async def create_application(application: ApplicationIn):
    if application.clinicRegion not in REGIONS_BY_COUNTRY[application.country]:
        raise HTTPException(422, "La región no corresponde al país.")
    try:
        date.fromisoformat(application.birthDate)
        date.fromisoformat(application.preferredDate)
    except ValueError:
        raise HTTPException(422, "Fecha inválida.") from None
    if application.appointmentAt:
        try:
            datetime.fromisoformat(application.appointmentAt)
        except ValueError:
            raise HTTPException(422, "Hora de cita inválida.") from None
    if application.providerId and not catalog.provider_supports(application.providerId, application.clinicRegion, application.serviceType):
        raise HTTPException(422, "El prestador no atiende esa sede o servicio.")
    data = application.model_dump() | {
        "durationMinutes": catalog.duration_minutes(application.serviceType),
        "appointmentAt": application.appointmentAt or None,
    }
    record = await run_in_threadpool(applications.add_application, data)
    return {"id": record["id"]}


@app.get("/api/staff/applications")
async def staff_applications(request: Request, country: str = "", clinicRegion: str = "", serviceType: str = "", preferredDate: str = ""):
    if staff_auth.get_session(request.cookies.get(STAFF_COOKIE_NAME)) is None:
        raise HTTPException(401, "Sesión no iniciada.")
    return await run_in_threadpool(applications.list_applications, country, clinicRegion, serviceType, preferredDate)


@app.get("/api/staff/analysis")
async def staff_analysis(request: Request):
    require_staff(request)
    records = await run_in_threadpool(applications.list_applications)
    return agenda_analysis.summarize(records)


def require_staff(request: Request) -> None:
    if staff_auth.get_session(request.cookies.get(STAFF_COOKIE_NAME)) is None:
        raise HTTPException(401, "Sesión no iniciada.")


def hours_until(appointment_at: str) -> float:
    appointment = datetime.fromisoformat(appointment_at).replace(tzinfo=CLINIC_TIMEZONE)
    return (appointment - datetime.now(CLINIC_TIMEZONE)).total_seconds() / 3600


@app.post("/api/staff/applications/{application_id}/cancel")
async def cancel_application(application_id: str, request: Request):
    require_staff(request)
    record = await run_in_threadpool(applications.get_application, application_id)
    if record is None:
        raise HTTPException(404, "Solicitud no encontrada.")
    if record["estadoCita"] not in ("reservada", "coordinado"):
        raise HTTPException(409, "Solo se pueden cancelar citas en gestión o coordinadas.")
    hours = hours_until(record["appointmentAt"]) if record["appointmentAt"] else None
    late = hours is not None and hours < CANCEL_PENALTY_WINDOW_HOURS
    changes = {
        "estadoCita": "cancelacion tardia" if late else "cancelado",
        "penaltyApplied": late,
        "cancelledAt": datetime.now(CLINIC_TIMEZONE).isoformat(timespec="minutes"),
    }
    await run_in_threadpool(applications.update_application, application_id, changes)
    suggestions = await run_in_threadpool(scheduling.suggest_pending, record)
    return {
        "estadoCita": changes["estadoCita"],
        "penaltyApplied": late,
        "hoursBeforeAppointment": round(hours, 2) if hours is not None else None,
        "suggestedApplications": suggestions,
    }


class StatusChange(BaseModel):
    estadoCita: Literal["reservada", "coordinado", "cumplido", "no concurrencia"]
    satisfaccion: float | None = Field(default=None, ge=1, le=10, allow_inf_nan=False)


@app.post("/api/staff/applications/{application_id}/status")
async def change_status(application_id: str, change: StatusChange, request: Request):
    require_staff(request)
    record = await run_in_threadpool(applications.get_application, application_id)
    if record is None:
        raise HTTPException(404, "Solicitud no encontrada.")
    if record["estadoCita"] in ("cancelado", "cancelacion tardia"):
        raise HTTPException(409, "Las citas canceladas no se pueden modificar.")
    changes = {
        "estadoCita": change.estadoCita,
        "satisfaccion": change.satisfaccion if change.estadoCita == "cumplido" else None,
    }
    await run_in_threadpool(applications.update_application, application_id, changes)
    return {"estadoCita": change.estadoCita}


class WaitlistIn(BaseModel):
    firstName: str = Field(min_length=2, max_length=80)
    lastName: str = Field(min_length=2, max_length=80)
    identityDocument: str = Field(min_length=5, max_length=20, pattern=r"^[A-Za-z0-9.\-]{5,20}$")
    email: str = Field(max_length=254)
    country: Literal["US", "UK"]
    clinicRegion: Literal["Texas", "Florida", "Georgia", "London", "Manchester"]
    serviceType: Literal["primary-care", "specialist"]


@app.post("/api/staff/waitlist", status_code=201)
async def add_waitlist(entry: WaitlistIn, request: Request):
    require_staff(request)
    if entry.clinicRegion not in REGIONS_BY_COUNTRY[entry.country]:
        raise HTTPException(422, "La región no corresponde al país.")
    record = await run_in_threadpool(waitlist.add_entry, entry.model_dump())
    return {"id": record["id"]}


@app.get("/api/staff/waitlist")
async def list_waitlist(request: Request, serviceType: str = "", clinicRegion: str = ""):
    require_staff(request)
    return await run_in_threadpool(waitlist.list_entries, serviceType, clinicRegion)


@app.delete("/api/staff/waitlist/{entry_id}")
async def remove_waitlist(entry_id: str, request: Request):
    require_staff(request)
    if not await run_in_threadpool(waitlist.remove_entry, entry_id):
        raise HTTPException(404, "Entrada no encontrada.")
    return {"ok": True}


class ProviderIn(BaseModel):
    firstName: str = Field(min_length=2, max_length=80)
    lastName: str = Field(min_length=2, max_length=80)
    serviceType: Literal["primary-care", "specialist"]
    clinicRegion: Literal["Texas", "Florida", "Georgia", "London", "Manchester"]
    days: list[int] = Field(min_length=1, max_length=7)
    startTime: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    endTime: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")


@app.post("/api/staff/providers", status_code=201)
async def create_provider(provider: ProviderIn, request: Request):
    require_staff(request)
    days = sorted(set(provider.days))
    if any(day < 0 or day > 6 for day in days):
        raise HTTPException(422, "Día de la semana inválido.")
    if provider.startTime >= provider.endTime:
        raise HTTPException(422, "La hora de inicio debe ser anterior a la de fin.")
    record = await run_in_threadpool(providers.add_provider, provider.model_dump() | {"days": days})
    return {"id": record["id"]}


@app.get("/api/staff/providers")
async def list_providers(request: Request, serviceType: str = "", clinicRegion: str = ""):
    require_staff(request)
    return await run_in_threadpool(providers.list_providers, serviceType, clinicRegion)


@app.get("/api/staff/availability")
async def staff_availability(request: Request, serviceType: Literal["primary-care", "specialist"], clinicRegion: Literal["Texas", "Florida", "Georgia", "London", "Manchester"], day_text: str = Query(alias="date")):
    require_staff(request)
    try:
        day = date.fromisoformat(day_text)
    except ValueError:
        raise HTTPException(422, "Fecha inválida.") from None
    now = datetime.now(CLINIC_TIMEZONE).replace(tzinfo=None)
    return await run_in_threadpool(scheduling.search_availability, serviceType, clinicRegion, day, now)


@app.get("/api/staff/availability-range")
async def staff_availability_range(request: Request, serviceType: Literal["primary-care", "specialist"], clinicRegion: Literal["Texas", "Florida", "Georgia", "London", "Manchester"], day_text: str = Query(alias="from"), days: int = Query(30, ge=1, le=60)):
    require_staff(request)
    try:
        start = date.fromisoformat(day_text)
    except ValueError:
        raise HTTPException(422, "Fecha inválida.") from None
    now = datetime.now(CLINIC_TIMEZONE).replace(tzinfo=None)
    return await run_in_threadpool(scheduling.search_range, serviceType, clinicRegion, start, days, now)


class OfferIn(BaseModel):
    providerId: str = Field(min_length=1, max_length=20)
    appointmentAt: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$")


@app.post("/api/staff/applications/{application_id}/offer")
async def offer_appointment(application_id: str, offer: OfferIn, request: Request):
    require_staff(request)
    now = datetime.now(CLINIC_TIMEZONE).replace(tzinfo=None)
    try:
        record = await run_in_threadpool(scheduling.offer_slot, application_id, offer.providerId, offer.appointmentAt, now)
    except scheduling.BookingError as error:
        raise HTTPException(error.status, error.detail) from None
    return {"estadoCita": record["estadoCita"], "providerId": record["providerId"], "appointmentAt": record["appointmentAt"]}


@app.get("/api/staff/freed-slots")
async def freed_slots(request: Request):
    require_staff(request)
    records = await run_in_threadpool(scheduling.list_freed_slots)
    rows = []
    for record in records:
        provider_id = record.get("providerId")
        provider = (await run_in_threadpool(providers.get_provider, provider_id) if provider_id else None) or {}
        rows.append(
            {
                "id": record["id"],
                "firstName": record.get("firstName", ""),
                "lastName": record.get("lastName", ""),
                "serviceType": record.get("serviceType", ""),
                "clinicRegion": record.get("clinicRegion", ""),
                "estadoCita": record["estadoCita"],
                "providerId": provider_id,
                "providerName": f"{provider.get('firstName', '')} {provider.get('lastName', '')}".strip(),
                "appointmentAt": record.get("appointmentAt"),
                "cancelledAt": record.get("cancelledAt"),
            }
        )
    return rows


@app.post("/api/staff/freed-slots/{application_id}/ai-recipients")
async def freed_slot_recipients(application_id: str, request: Request):
    require_staff(request)
    try:
        return await run_in_threadpool(scheduling_ai.suggest_recipients, application_id)
    except scheduling_ai.AIUnavailable as error:
        raise HTTPException(503, str(error)) from None
    except scheduling.BookingError as error:
        raise HTTPException(error.status, error.detail) from None


@app.get("/api/staff/agenda/export.csv")
async def export_agenda(request: Request, date: str = ""):
    require_staff(request)
    content = await run_in_threadpool(scheduling.agenda_csv, date)
    return Response(content, media_type="text/csv; charset=utf-8", headers={
        "Content-Disposition": 'attachment; filename="agenda.csv"'
    })


@app.get("/api/staff/billing/penalties")
async def list_penalties(request: Request):
    require_staff(request)
    pending = await run_in_threadpool(applications.list_pending_penalties)
    return [
        {
            "id": r["id"],
            "cancelledAt": r["cancelledAt"],
            "firstName": r["firstName"],
            "lastName": r["lastName"],
            "identityDocument": r["identityDocument"],
            "providerId": r["providerId"],
            "clinicRegion": r["clinicRegion"],
            "serviceType": r["serviceType"],
            "feeTotal": catalog.fee(r["serviceType"], r["country"]),
            "amountDue": round(catalog.fee(r["serviceType"], r["country"]) * 0.5, 2),
        }
        for r in pending
    ]


@app.get("/api/staff/billing/services")
async def list_billing_services(request: Request):
    require_staff(request)
    records = await run_in_threadpool(applications.list_billable_services)
    result = []
    for r in records:
        fee = catalog.fee(r["serviceType"], r["country"])
        halved = r["estadoCita"] in ("cancelacion tardia", "no concurrencia")
        result.append({
            "id": r["id"],
            "estadoCita": r["estadoCita"],
            "appointmentAt": r["appointmentAt"],
            "preferredDate": r.get("preferredDate"),
            "firstName": r.get("firstName", ""),
            "lastName": r.get("lastName", ""),
            "identityDocument": r.get("identityDocument", ""),
            "providerId": r.get("providerId"),
            "clinicRegion": r.get("clinicRegion", ""),
            "country": r.get("country", ""),
            "serviceType": r["serviceType"],
            "feeTotal": fee,
            "amountDue": round(fee * 0.5, 2) if halved else fee,
            "billedAt": r.get("billedAt"),
            "paidAt": r.get("paidAt"),
        })
    return result


@app.post("/api/staff/billing/{application_id}/billed")
async def mark_billed(application_id: str, request: Request):
    require_staff(request)
    record = await run_in_threadpool(applications.get_application, application_id)
    if record is None or not record["penaltyApplied"]:
        raise HTTPException(404, "Penalización no encontrada.")
    if record["billedAt"]:
        raise HTTPException(409, "La penalización ya fue facturada.")
    changes = {"billedAt": datetime.now(CLINIC_TIMEZONE).isoformat(timespec="minutes")}
    await run_in_threadpool(applications.update_application, application_id, changes)
    return {"ok": True}


@app.post("/api/staff/billing/{application_id}/invoice")
async def send_invoice(application_id: str, request: Request):
    require_staff(request)
    record = await run_in_threadpool(applications.get_application, application_id)
    if record is None or record["estadoCita"] not in applications.BILLABLE_STATES:
        raise HTTPException(404, "Servicio facturable no encontrado.")
    changes = {"billedAt": datetime.now(CLINIC_TIMEZONE).isoformat(timespec="minutes")}
    await run_in_threadpool(applications.update_application, application_id, changes)
    return {"ok": True}


@app.post("/api/staff/billing/{application_id}/paid")
async def mark_paid(application_id: str, request: Request):
    require_staff(request)
    record = await run_in_threadpool(applications.get_application, application_id)
    if record is None or record["estadoCita"] not in applications.BILLABLE_STATES:
        raise HTTPException(404, "Servicio facturable no encontrado.")
    if not record.get("billedAt"):
        raise HTTPException(409, "Primero debe enviarse la factura.")
    if record.get("paidAt"):
        raise HTTPException(409, "El servicio ya figura como abonado.")
    changes = {"paidAt": datetime.now(CLINIC_TIMEZONE).isoformat(timespec="minutes")}
    await run_in_threadpool(applications.update_application, application_id, changes)
    return {"ok": True}


@app.post("/api/staff/billing/{application_id}/unpaid")
async def mark_unpaid(application_id: str, request: Request):
    require_staff(request)
    record = await run_in_threadpool(applications.get_application, application_id)
    if record is None or record["estadoCita"] not in applications.BILLABLE_STATES:
        raise HTTPException(404, "Servicio facturable no encontrado.")
    await run_in_threadpool(applications.update_application, application_id, {"paidAt": None})
    return {"ok": True}


@app.get("/staff/login", include_in_schema=False)
async def staff_login_page():
    return FileResponse(STAFF_FRONTEND / "login.html")


@app.get("/staff", include_in_schema=False)
async def staff_dashboard(request: Request):
    if staff_auth.get_session(request.cookies.get(STAFF_COOKIE_NAME)) is None:
        return RedirectResponse("/staff/login", status_code=303)
    return FileResponse(STAFF_FRONTEND / "dashboard.html")


@app.get("/backoffice/analizador-incidencias.html", include_in_schema=False)
async def incidents_dashboard(request: Request):
    if staff_auth.get_session(request.cookies.get(STAFF_COOKIE_NAME)) is None:
        return RedirectResponse("/staff/login", status_code=303)
    return FileResponse(FRONTEND / "analizador-incidencias.html")


@app.get("/staff/assets/{asset_path}", include_in_schema=False)
async def staff_asset(asset_path: str):
    path = STAFF_ASSETS.get(asset_path)
    if path is None:
        raise HTTPException(404, "Recurso no disponible.")
    return FileResponse(path)


@app.get("/", include_in_schema=False)
async def landing():
    return FileResponse(PROJECT_ROOT / "index.html")


@app.get("/application.html", include_in_schema=False)
async def application_page():
    return FileResponse(PROJECT_ROOT / "application.html")


@app.get("/validation.js", include_in_schema=False)
async def application_script():
    return FileResponse(PROJECT_ROOT / "validation.js", media_type="text/javascript")


@app.get("/Recursos Graficos/{asset_path:path}", include_in_schema=False)
async def landing_media(asset_path: str):
    base = (PROJECT_ROOT / "Recursos Graficos").resolve()
    target = (base / asset_path).resolve()
    if base not in target.parents or not target.is_file():
        raise HTTPException(404, "Recurso no disponible.")
    return FileResponse(target)


@app.get("/assets/{asset_path:path}", include_in_schema=False)
async def asset(asset_path: str):
    path = ASSETS.get(asset_path)
    if path is None:
        raise HTTPException(404, "Recurso no disponible.")
    return FileResponse(path)