# Directorio de proveedores de HealthCore

El módulo vive en `uis/application/app/suppliers/`. La aplicación Next.js existente arranca desde la raíz; `app/suppliers/page.tsx` expone el módulo en `/suppliers` sin duplicar la aplicación ni sus dependencias. El menú principal permite acceder desde candidaturas.

## Ejecución

Desde la raíz, arrancar primero la API según [services/api/README.md](../../services/api/README.md). En otra terminal:

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Abrir http://127.0.0.1:3000/suppliers. `HEALTHCORE_API_ORIGIN` configura el destino del proxy del servidor Next.js (por defecto `http://127.0.0.1:8765`). Si se cambia, reiniciar Next.js. Si cambia el origen del navegador, configurar `HEALTHCORE_UI_ORIGIN` en FastAPI y reiniciarlo. No se expone el destino de la API al cliente.

Los filtros de país y categoría se aplican instantáneamente a la lista descargada. La API ofrece también filtros equivalentes para otros consumidores. El formulario envía únicamente los campos de creación; las respuestas `422` se presentan en español. Tarifa y estado solo se confirman visualmente después de recibir la respuesta del servidor; los controles se deshabilitan durante la escritura. Eliminar requiere confirmación. La tabla tiene desplazamiento horizontal en pantallas estrechas; la página no desborda.

## Verificación

```sh
npm run typecheck:app
npm run build
npx playwright install --with-deps chromium
npm run test:suppliers
```

La prueba Playwright requiere ambos servicios activos. `BASE_URL` permite cambiar el origen de Next.js. Recorre menú, filtros, tarifa cero, errores API `422`, creación, actualización de tarifa/estado, persistencia tras recargar y eliminación, a 1440, 390 y 320 px. Usa proveedores ficticios identificables y los elimina al finalizar. Guarda capturas en `/tmp/healthcore-suppliers-{ancho}.png`.

Uso local y un único proceso escritor de TinyDB. No almacenar información de pacientes ni exponer este servicio sin autenticación, autorización, TLS y revisión legal. Las tarifas del seed son ejemplos sin moneda asignada, no acuerdos comerciales reales.