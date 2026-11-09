# API local de HealthCore

Desde la raíz del monorepo, con Python 3.11 o superior. Versiones verificadas en Linux: 3.11, 3.12, 3.13 y 3.14.

```sh
python -m venv .venv-api
.venv-api/bin/python -m pip install --require-hashes -r services/api/requirements.lock
npm --prefix uis/backoffice ci
.venv-api/bin/python -m uvicorn services.api.main:app --host 127.0.0.1 --port 8765 --no-access-log
```

Abrir http://127.0.0.1:8765. El mismo servicio entrega el backoffice y la API; no hay CORS ni dependencias de CDN. La instalación inicial de paquetes requiere red; el análisis no.

## Endpoints

- `POST /api/incidents/analyze`: multipart con un único fichero `file`, extensión `.csv`, UTF-8. Límites: 10 MiB, 50.000 registros y 10.000 detalles de error. Devuelve `total`, `valid`, `invalid`, `by_state`, `satisfaction_mean`, `satisfaction_count`, `errors_by_type` y `errors` (fila física, campo, código, sin valores personales).
- `GET /api/incidents/results/export`: descarga `results.csv`, una fila por métrica, correspondiente al último análisis correcto de la sesión. Debe conservarse la cookie de la respuesta de análisis.
- `GET /api/incidents/schema`: devuelve el contrato ejecutable de `healthcore.md` (campos, estados, satisfacción, límites y etiquetas). El frontend no duplica estas reglas ni permite cargar ficheros si no ha obtenido el contrato.
- Errores: `400` multipart incorrecto, extensión no CSV, fichero vacío, cabecera, codificación o sintaxis incorrectas; `413` límite de bytes, registros o detalles excedido; `415` petición que no es multipart; `429` dos análisis ya en curso (incluye `Retry-After`); `404` exportación sin análisis o sesión caducada; `403` origen externo.
- Las filas inválidas generan un resultado `200` con errores explícitos, no una excepción de fichero. Las métricas excluyen esas filas. Sin cumplidos válidos, la media JSON es `null` y la celda CSV queda vacía.
- Un límite excedido rechaza el fichero completo: no trunca detalles, no publica métricas parciales y no reemplaza el último análisis correcto. La UI mantiene el resumen anterior y permite descargarlo tras una carga fallida.

## Privacidad y límites

El fichero se procesa en memoria y no se guarda en disco. Los resultados solo contienen agregados y errores sin valores originales. La cookie de sesión es aleatoria, HttpOnly y SameSite estricto. Hay un máximo de 32 sesiones; al llenarse se elimina la más antigua. Caducan a los 30 minutos, con limpieza periódica cada 60 segundos y comprobación inmediata al analizar/exportar. Reiniciar elimina todos los resultados. Se admiten dos análisis simultáneos; el tercero se rechaza antes de leer el fichero. No se envían datos a servicios externos ni se registran cuerpos de peticiones. Solo se sirven tres recursos estáticos públicos; no se expone el directorio completo del backoffice.

Servicio diseñado para un puesto local, un único proceso y un único worker. No exponerlo en red ni usar `--host 0.0.0.0`. No incorpora autenticación corporativa ni certifica cumplimiento HIPAA/GDPR. Las restricciones de acceso del sistema operativo y el navegador siguen siendo necesarias. Para varios usuarios o producción se requieren autenticación, autorización, TLS y revisión de cumplimiento.

Las reglas funcionales y la cabecera están en el bloque JSON de [healthcore.md](../../healthcore.md). [rules.py](../../packages/incidents/rules.py) lo lee y valida al iniciar; una configuración incorrecta impide arrancar, sin aplicar reglas de respaldo. Después de modificar las reglas, reiniciar el proceso. La lógica común vive en [analysis.py](../../packages/incidents/analysis.py); no se replica en controladores ni frontend. No existe categoría por decisión funcional expresa; `CONTEXT.md` conserva únicamente el contexto corporativo.

## CLI y pruebas

```sh
python scripts/analyze.py /ruta/incidents.csv
.venv-api/bin/python -m unittest packages.incidents.test_analysis services.api.test_api -v
```

El CLI pregunta `¿Deseas exportar los resultados a CSV? [s / n]`; `s` escribe o reemplaza `results.csv` en el directorio actual. Los errores de fichero devuelven código 1. EOF cancela la exportación. El CSV exportado contiene métricas y totales por error, nunca filas originales.

## Dependencias y CI

[requirements.txt](requirements.txt) declara las dependencias; [requirements.lock](requirements.lock) fija dependencias directas y transitivas con hashes. No instalar desde los rangos para una ejecución reproducible. Para actualizar intencionalmente el lock, instalar `uv` como herramienta de desarrollo y ejecutar desde la raíz:

```sh
uv pip compile services/api/requirements.txt --universal --python-version 3.11 --generate-hashes --output-file services/api/requirements.lock
```

El workflow [incidents.yml](../../.github/workflows/incidents.yml) instala desde el lock con hashes y ejecuta las pruebas Python y Playwright en una matriz 3.11-3.14, con datos ficticios. La primera instalación requiere red; el procesamiento de CSV no. El workflow está preparado, pero su ejecución en GitHub requiere publicar los cambios; no se ha abierto ningún PR desde este entorno.