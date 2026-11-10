import asyncio
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.exception_handlers import request_validation_exception_handler
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from starlette.concurrency import run_in_threadpool
from starlette.datastructures import UploadFile
from starlette.formparsers import MultiPartException, MultiPartParser
from starlette.middleware.trustedhost import TrustedHostMiddleware

from packages.incidents.analysis import AnalysisResult, CSVInputError, CSVResourceLimitError, MAX_FILE_BYTES, analyze_csv, results_csv
from packages.incidents.rules import RULES
from services.api.routes.auth import router as auth_router
from services.api.routes.profiles import router as profiles_router
from services.api.routes.suppliers import router as suppliers_router
from services.api.routes.users import router as users_router


FRONTEND = Path(__file__).resolve().parents[2] / "uis" / "backoffice"
SESSION_TTL = 30 * 60
MAX_SESSIONS = 32
MAX_ACTIVE_ANALYSES = 2
PURGE_INTERVAL_SECONDS = 60
COOKIE_NAME = "healthcore_analysis"
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


app = FastAPI(title="HealthCore | Análisis local", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1", "[::1]", "testserver"])
app.state.results = {}
app.state.active_analyses = 0
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(suppliers_router)


@app.exception_handler(RequestValidationError)
async def supplier_validation_error(request: Request, error: RequestValidationError):
    """No refleja entradas no serializables (NaN/infinito) en el JSON de error."""
    if request.url.path == "/suppliers" or request.url.path.startswith("/suppliers/"):
        detail = [
            {key: issue[key] for key in ("loc", "msg", "type")}
            for issue in error.errors()
        ]
        return JSONResponse({"detail": detail}, status_code=422)
    return await request_validation_exception_handler(request, error)


@app.middleware("http")
async def local_security(request: Request, call_next):
    origin = request.headers.get("origin")
    expected_origin = f"{request.url.scheme}://{request.headers.get('host', '')}"
    supplier_request = request.url.path == "/suppliers" or request.url.path.startswith("/suppliers/")
    allowed_origins = {expected_origin}
    if supplier_request:
        allowed_origins.update(
            origin.strip() for origin in os.environ.get("HEALTHCORE_UI_ORIGIN", "http://127.0.0.1:3000").split(",")
        )
    if (request.url.path.startswith("/api/") or supplier_request) and (
        request.headers.get("sec-fetch-site") == "cross-site"
        or (origin is not None and origin not in allowed_origins)
    ):
        response = JSONResponse({"detail": "Origen no permitido."}, status_code=403)
    else:
        response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; style-src 'self'; "
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


@app.get("/", include_in_schema=False)
async def backoffice():
    return FileResponse(FRONTEND / "index.html")


@app.get("/assets/{asset_path:path}", include_in_schema=False)
async def asset(asset_path: str):
    path = ASSETS.get(asset_path)
    if path is None:
        raise HTTPException(404, "Recurso no disponible.")
    return FileResponse(path)