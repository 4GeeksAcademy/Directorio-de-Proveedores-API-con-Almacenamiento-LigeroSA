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

Las pruebas de proveedores requieren `HEALTHCORE_TEST_EMAIL` y
`HEALTHCORE_TEST_PASSWORD` con las credenciales de un usuario existente.

```sh
npm run typecheck:app
npm run build
npx playwright install --with-deps chromium
npm run test:suppliers
```

La prueba Playwright requiere ambos servicios activos. `BASE_URL` permite cambiar el origen de Next.js. Recorre menú, filtros, tarifa cero, errores API `422`, creación, actualización de tarifa/estado, persistencia tras recargar y eliminación, a 1440, 390 y 320 px. Usa proveedores ficticios identificables y los elimina al finalizar. Guarda capturas en `/tmp/healthcore-suppliers-{ancho}.png`.

Uso local y un único proceso escritor de TinyDB. No almacenar información de pacientes ni exponer este servicio sin autenticación, autorización, TLS y revisión legal. Las tarifas del seed son ejemplos sin moneda asignada, no acuerdos comerciales reales.

## AUTH-02: sesiones y cuenta

`/login` y `/register` son las rutas publicas de Next.js. El registro envia
email, password y los campos opcionales name, phone y address a `POST /users`,
inicia sesion con `POST /auth/login` y lleva a `/suppliers`. Si el usuario se
crea pero el login falla, el siguiente intento solo repite el login.

`AuthProvider` mantiene los estados loading, anonymous, authenticated y error.
`AuthGuard` protege por defecto todas las demas rutas de Next.js: `/`
(candidaturas), `/candidates/new`, `/candidates/[id]`,
`/candidates/[id]/edit`, `/suppliers` y `/account/profile`. No monta el contenido
privado hasta validar el JWT mediante `GET /auth/me`; leer `exp` localmente
solo detecta expiracion, nunca sustituye la validacion de firma del backend.
No se usa middleware para leer almacenamiento del navegador.

`services/api-client.ts` centraliza las solicitudes; `useApiClient` lo expone a
los componentes. El token se guarda exclusivamente en localStorage bajo
`healthcore_access_token`. Cada solicitud privada vuelve a leerlo y sobrescribe
la cabecera Authorization con Bearer. Los 401 privados, los tokens malformados,
la expiracion y el logout lo eliminan y redirigen a `/login`. Los 401 de login
se muestran en el formulario. Los fallos temporales de verificacion conservan
el token y permiten reintentar sin mostrar contenido privado. Los eventos de
storage sincronizan la sesion entre pestanas. No se renueva un JWT sin un
endpoint de refresh: al caducar se requiere iniciar sesion de nuevo.

`/account/profile` muestra email de solo lectura y los datos de `/auth/me`.
Guarda nombre, telefono y direccion mediante `PUT /profiles/me`; los errores
422 de FastAPI se asocian al campo y un email duplicado se muestra en email.
Las solicitudes de cuenta y proveedores usan el proxy `/api` de Next.js;
`HEALTHCORE_API_ORIGIN` configura su destino sin habilitar CORS abierto.
Candidaturas y notas mantienen su API independiente con `NEXT_PUBLIC_API_URL`;
esa API debe aceptar Bearer y permitir el origen del frontend si es distinto.

Los documentos publicos `index.html` y `application.html` no se modifican.
El backoffice HTML de incidencias (`uis/backoffice`) se sirve desde FastAPI,
no desde Next.js, y conserva su sesion local de analisis. **No queda protegido
por este guard JWT**: para incluirlo se debe migrar al mismo origen y adaptar
sus endpoints a JWT, o implementar una autenticacion independiente. Tampoco se
comparte localStorage entre origenes distintos.

El guard es una barrera de interfaz, no de autorizacion: cada backend debe
validar firma, expiracion y permisos. localStorage es un requisito de este
ticket, pero permite robo de tokens ante XSS; usar HTTPS, CSP en produccion,
evitar HTML no confiable y no registrar tokens. Los Server Components no deben
obtener ni incluir datos sensibles antes del guard; los modulos actuales los
solicitan desde el cliente. No se almacenan contrasenas ni perfiles.

Con ambos servidores activos y una base de datos de prueba aislada:

```sh
npm run typecheck:app
npm run test:auth
```

La prueba usa JWT reales y crea/elimina sus propias cuentas. Verifica rutas
privadas, login fallido, registro con perfil, errores de campo, persistencia,
edicion, Bearer, logout, 401, token malformado y firma invalida, reintento tras
503 y cierre de sesion entre pestanas a 1440, 390 y 320 px. Las capturas quedan
en `/tmp/healthcore-auth-profile-{ancho}.png`. `BASE_URL` cambia el origen.