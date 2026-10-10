# Auditoría del análisis de incidencias

Fecha: 2026-10-07. Alcance: CLI, analizador compartido, API y backoffice.

## Dictamen y alcance

Los hallazgos técnicos de esta auditoría están corregidos y probados tras la autorización de aplicar los cambios necesarios. La solución cumple el contrato funcional acordado: fuente `healthcore.md`, sin categoría, con los cuatro estados confirmados y satisfacción obligatoria 1-10 para cumplidos. No se acredita correspondencia con imágenes no disponibles ni se reintroducen requisitos retirados por el usuario.

El usuario sustituyó expresamente `CONTEXT.md` por [healthcore.md](../healthcore.md), retiró la categoría, eligió los estados `cumplido`, `cancelado`, `cancelacion tardia`, `no concurrencia`, y exigió satisfacción 1-10 para cumplidos. No se han revertido esas decisiones para ajustar artificialmente la solución a una rúbrica diferente. `CONTEXT.md` contiene contexto corporativo, no una lista alternativa de campos o categorías. No se proporcionaron imágenes de evaluación ni se encontraron imágenes/PDF de evaluación en el repositorio.

## 1. Lista de comprobación

Resultados después de las correcciones aplicadas:

| Requisito | Resultado | Evidencia o excepción |
| --- | --- | --- |
| Lectura automática de reglas de la fuente acordada | Pasa | `rules.py` lee y valida el bloque JSON de `healthcore.md`; se expone el mismo contrato a la UI. `CONTEXT.md` no es la fuente elegida. |
| Correspondencia con campos y estados acordados | Pasa | Seis cabeceras exactas, cinco campos siempre obligatorios y satisfacción obligatoria para cumplidos. |
| Campos ausentes/vacíos y columnas incorrectas | Pasa | Errores por fila/campo, con pruebas de filas cortas/largas y campos vacíos. |
| Estados restringidos y satisfacción finita 1-10 | Pasa | Rechaza estados desconocidos, texto, NaN, infinito y puntuaciones fuera de rango. |
| Validación y totalización por categoría | No Pasa, literalmente | Excluidas por decisión expresa; no hay una categoría que validar o contar. |
| Inválidos excluidos y contabilizados por problema | Pasa | Cuenta cada tipo una vez por registro y conserva todos los errores; los totales por tipo pueden sumar más que el número de inválidos. |
| CLI acepta ruta por argumento | Pasa | `argparse`; pruebas con rutas absolutas y fichero inexistente. |
| Consola legible y alineada | Pasa | Etiquetas, columnas, separadores y detalle sin valores personales. |
| Total procesado, válidos e inválidos | Pasa | Corregido el recuento de líneas totalmente vacías. |
| Totales por estado | Pasa | Incluye los cuatro estados acordados, también con cero casos. |
| Satisfacción media solo de cumplidos válidos | Pasa | Otros estados no contribuyen; sin cumplidos válidos la media es `null`/N/D. Redondeo decimal corregido. |
| Desglose y detalle de inválidos | Pasa | CLI y JSON incluyen fila física, campo y código; UI pagina los detalles. |
| Pregunta interactiva y CSV de métricas | Pasa | Pruebas de s/n, respuesta no válida y EOF; 13 métricas únicas por exportación. |
| Lógica reutilizada en CLI y API | Pasa | Ambos importan `packages/incidents/analysis.py`. |
| POST multipart y JSON estructurado | Pasa | Pruebas de carga, rechazo de multipart incorrecto, resultados mixtos y límites con rechazo completo. |
| GET descarga de último análisis | Pasa | CSV por sesión; cookie HttpOnly/SameSite, aislamiento y caducidad probados. |
| HTTP y mensajes descriptivos | Pasa | 400 CSV vacío/incorrecto, extensión no CSV y multipart incorrecto; 413 capacidad; 415 protocolo no multipart; 429 concurrencia; 404 sin análisis; 403 origen externo. |
| Vista accesible desde menú del backoffice | Pasa | Navegación local con enlace a la vista; no implica una integración adicional en otras páginas del monorepo. |
| Selector y drag & drop | Pasa | Ambos probados en navegador. |
| Métricas y recuentos de inválidos visibles | Pasa | Pruebas de resultados, tablas, paginación y ausencia de identificadores en pantalla. |
| Descarga mediante endpoint de API | Pasa | Descarga real de `results.csv`; manejo de sesión caducada probado. |
| Procesamiento local sin persistir CSV de pacientes | Pasa en entorno probado | Carga superior a 1 MiB sin `TemporaryFile`; ninguna petición externa durante el flujo web. |
| Correspondencia con imágenes de evaluación | No Pasa la verificación | No hay imágenes disponibles; no constituye un fallo visual demostrado. |
| Capacidad acotada de detalles y sesiones | Pasa | 10 MiB, 50.000 filas, 10.000 detalles, dos análisis simultáneos y 32 sesiones; sin resultados parciales ni omisiones silenciosas. |
| Instalación Python reproducible y matriz de versiones | Pasa | Lock transitivo con hashes; 27 pruebas en cada versión 3.11, 3.12, 3.13 y 3.14. CI preparado con la misma matriz. |

## 2. Hallazgos y errores detectados

### H1. Riesgo de capacidad por amplificación de errores (prioridad alta, corregido)

Antes de la corrección, un CSV ficticio de 10.000 filas con seis campos vacíos pesaba 70.079 bytes y producía 50.000 detalles y 3.334.736 bytes de JSON. El límite de bytes no acotaba el crecimiento de detalles ni la concurrencia.

[analysis.py](../packages/incidents/analysis.py) ahora limita bytes, filas y detalles desde las reglas ejecutables. Excederlos produce `CSVResourceLimitError`: CLI informa el rechazo y API devuelve 413, sin publicar resultados parciales ni reemplazar el análisis anterior. [main.py](../services/api/main.py) limita a dos cargas/análisis concurrentes y 32 sesiones; limpia las sesiones caducadas periódicamente. Hay pruebas de umbrales exactos, preservación del resultado anterior, rechazo del tercer análisis antes de leerlo, evicción de la sesión más antigua y caducidad sin nuevas peticiones. Estos límites acotan los datos retenidos; no representan una garantía universal de RSS ni un pentest.

### H2. Trazabilidad y discrepancia con rúbrica (prioridad media, corregido en alcance acordado)

[rules.py](../packages/incidents/rules.py) carga el único bloque JSON identificado en `healthcore.md`, valida nombres, campos obligatorios, estados, escala, límites y etiquetas y falla si la configuración es incorrecta. El analizador usa esos valores; la UI obtiene el mismo contrato mediante `GET /api/incidents/schema`, sin duplicar reglas. Cambiar el bloque ejecutable y reiniciar actualiza los consumidores. Las pruebas comprueban cambios de reglas, configuración incorrecta y correspondencia entre API y fuente.

La categoría no se añadió porque fue expresamente excluida. Esto satisface el alcance acordado, pero no satisface literalmente la métrica de categoría de la rúbrica original. La excepción y la sustitución de `CONTEXT.md` deben constar en la evaluación; no se interpreta texto narrativo como configuración.

### H3. Líneas vacías inflaban totales (prioridad media, corregido)

Antes de la corrección, un registro válido seguido por dos líneas vacías producía total=3, válidos=1 e inválidos=2. Contradecía el contrato documentado. [analysis.py](../packages/incidents/analysis.py) ahora descarta solo filas que `csv.reader` devuelve como lista vacía; una fila con separadores y campos vacíos sigue siendo inválida. La prueba comprueba también los números físicos de fila y el fichero con cabecera y solo líneas vacías.

### H4. Redondeo binario de la media (prioridad baja, corregido)

La conversión previa a `float` hacía que `8.005` resultara `8.01`, pese a que el redondeo decimal al par da `8.00`. [analysis.py](../packages/incidents/analysis.py) ahora aplica `Decimal.quantize` antes de convertir a JSON. La política al par conserva el criterio de empates de `round`, y se documentó; si negocio prefiere otra política, debe definirla. Hay pruebas para 8.005, 8.015, 9.995 y una media de dos registros. La acumulación usa suma y contador, sin guardar una lista de puntuaciones.

### H5. Reproducibilidad y compatibilidad (prioridad media, corregido)

[requirements.txt](../services/api/requirements.txt) declara un mínimo explícito de Starlette con soporte de `spool_max_size`. [requirements.lock](../services/api/requirements.lock) fija las dependencias directas y transitivas con hashes para instalar reproduciblemente. Se instaló el lock con `--require-hashes` en cuatro entornos aislados; todos pasan la prueba que impide escribir CSV en disco.

Entornos finales probados: Python 3.11.17, 3.12.15, 3.13.16 y 3.14.8; FastAPI 0.142.2, Starlette 1.7.0, Uvicorn 0.54.0, python-multipart 0.0.32, httpx 0.28.1. [incidents.yml](../.github/workflows/incidents.yml) añade la matriz con instalación bloqueada, pruebas Python y Playwright. La ejecución remota de GitHub Actions está pendiente de publicar los cambios, no se afirma que ya haya ocurrido. Starlette emite una advertencia de deprecación del adaptador httpx de pruebas; no se observó fallo asociado.

### H6. Comillas escapadas y delimitadores dentro de campos (prioridad media, corregido)

Detectar el dialecto únicamente desde la cabecera dejaba `doublequote=False`; un nombre ficticio con comillas escapadas y una coma interna desplazaba columnas y se clasificaba incorrectamente como inválido. El lector ahora admite comillas duplicadas conforme al formato CSV estándar. Hay pruebas con coma, punto y coma, tabulación, saltos de línea y comillas internas, y el fixture del navegador incluye este caso.

### Límites de esta auditoría

La expiración se comprueba al acceder y mediante una tarea periódica de 60 segundos; los resultados no son descargables pasados 30 minutos y se eliminan incluso sin nuevas peticiones. El servicio es local y no tiene autenticación corporativa, TLS ni revisión formal HIPAA/GDPR: no es una solución aprobada para exposición en red. No se realizó certificación legal, un pentest, una auditoría completa de CVE de Python ni una comparación con imágenes ausentes.

## 3. Refactorización y correcciones

### Aplicadas y verificadas

- Exclusión de líneas totalmente vacías, sin ocultar filas con campos obligatorios vacíos.
- Redondeo decimal de la media antes de convertir a float y documentación de la política.
- Dos pruebas de regresión en [test_analysis.py](../packages/incidents/test_analysis.py).
- Carga validada de reglas desde `healthcore.md`; contrato público para la UI.
- Límites operativos con rechazo completo, concurrencia y número de sesiones acotados, limpieza periódica y rutas estáticas permitidas.
- Errores CSV y extensión no CSV devuelven 400; excesos devuelven 413 y concurrencia excedida 429.
- Instalación con lock y hashes, y matriz Python 3.11-3.14 en CI.
- Ampliación de [test-browser.mjs](../uis/backoffice/test-browser.mjs): arrastre real, fichero vacío, sesión caducada, contrato no disponible/reintento y conservación del último resultado correcto.

## Evidencia de ejecución

- 27 pruebas de Python por versión: analizador, CLI interactivo y API; todas pasan en cuatro entornos aislados con el lock instalado y hashes verificados (108 ejecuciones de pruebas).
- Playwright: flujo real a 1440, 390 y 320 px; selector, arrastre, métricas, invalidación, paginación, descarga, sesión caducada, ausencia de identificadores y cero peticiones externas.
- Capturas generadas en `/tmp/healthcore-1440.png`, `/tmp/healthcore-390.png`, `/tmp/healthcore-320.png`; no son imágenes de evaluación.
- Pylance: sin diagnósticos en los archivos auditados. La consulta del workspace mostró un aviso de `pandas` en otro módulo, ajeno a este alcance y no modificado.
- `npm audit --omit=dev`: cero vulnerabilidades reportadas para dependencias de ejecución del frontend; no es una auditoría de seguridad de toda la aplicación.
- `git diff --check`: correcto.
- La instrucción global de 4Geeks no pudo leerse porque la herramienta la marca como excluida; no se certifica su cumplimiento.

No se abrió PR, no se creó rama ni se hicieron commits. Queda pendiente aportar las imágenes y reflejar en la evaluación las excepciones ya acordadas (fuente `healthcore.md` y ausencia de categoría). Los hallazgos técnicos detectados están corregidos; no se afirma una certificación legal o de seguridad del 100 %.