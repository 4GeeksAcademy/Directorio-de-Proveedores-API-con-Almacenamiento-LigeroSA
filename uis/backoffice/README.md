# Backoffice de HealthCore

Interfaz local HTML/CSS/JavaScript, con iconos Lucide instalados localmente. Conserva la identidad HealthCore con las fuentes de Google Fonts usadas en `index.html`, sin analítica, imágenes ni scripts remotos. La vista **Análisis de Incidencias** es accesible desde el menú principal.

La API sirve esta interfaz en http://127.0.0.1:8765; no debe abrirse directamente como fichero HTML. Instrucciones de ejecución en [services/api/README.md](../../services/api/README.md).

Incluye selector y arrastre de fichero, estados de carga/error, totales, desglose por estado, satisfacción media, problemas por tipo, detalle paginado y descarga CSV. Obtiene estados, etiquetas, escala y límites desde `/api/incidents/schema`, que lee las reglas ejecutables de `healthcore.md`. Si falla la conexión inicial, desactiva la carga y ofrece reintentar. Una carga fallida conserva el último análisis correcto; una sesión caducada desactiva la descarga y borra el resumen. No existe categoría por decisión funcional. Los datos personales no se muestran ni se guardan en localStorage.

## Prueba de navegador

Con el servidor iniciado:

```sh
npm --prefix uis/backoffice ci
cd uis/backoffice
npx playwright install chromium
npm test
```

Se prueban anchos de 1440, 390 y 320 px con datos ficticios: selector, arrastre, métricas, rechazo de fichero incorrecto/vacío, conservación del análisis anterior, detalle de errores, paginación, descarga, sesión caducada, ausencia de datos personales, desbordamientos y ausencia de peticiones externas. Se prueba también el fallo y reintento de carga del contrato. Capturas en `/tmp/healthcore-1440.png`, `/tmp/healthcore-390.png` y `/tmp/healthcore-320.png`. `BASE_URL` permite cambiar la dirección del servidor de pruebas.