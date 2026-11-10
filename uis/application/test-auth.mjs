import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium } from "playwright";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:3000";
const tokenKey = "healthcore_access_token";
const browser = await chromium.launch({ headless: true });
const password = `Test-${randomUUID()}`;

try {
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    const email = `auth-${randomUUID()}@example.com`;
    let token;
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      for (const path of ["/", "/suppliers", "/candidates/new", "/candidates/example", "/candidates/example/edit", "/account/profile"]) {
        await page.goto(`${baseURL}${path}`);
        await page.waitForURL("**/login");
        assert.equal(await page.getByRole("button", { name: "Guardar cambios" }).count(), 0);
      }

      await page.getByLabel("Email", { exact: true }).fill(email);
      await page.getByLabel("Contrasena", { exact: true }).fill(password);
      await page.getByRole("button", { name: "Entrar", exact: true }).click();
      await page.locator('p[role="alert"]').waitFor();
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), tokenKey), null);

      await page.goto(`${baseURL}/register`);
      await page.getByLabel("Email", { exact: true }).fill(email);
      await page.getByLabel("Contrasena", { exact: true }).fill(password);
      await page.getByLabel("Nombre", { exact: true }).fill("Cuenta de prueba");
      await page.getByLabel("Telefono", { exact: true }).fill("5551234");
      await page.getByLabel("Direccion", { exact: true }).fill("Direccion de prueba");

      await page.route("**/api/users", (route) => route.fulfill({ status: 422, json: { detail: [{ loc: ["body", "phone"], msg: "Telefono no valido" }] } }));
      await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
      await page.locator("#phone-error").waitFor();
      assert.equal(await page.getByLabel("Telefono", { exact: true }).getAttribute("aria-invalid"), "true");
      await page.unroute("**/api/users");
      await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
      await page.waitForURL("**/suppliers");
      await page.getByRole("heading", { name: "Directorio de proveedores" }).waitFor();
      token = await page.evaluate((key) => localStorage.getItem(key), tokenKey);
      assert.ok(token);
      assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), tokenKey), null);
      await page.reload();
      await page.getByRole("heading", { name: "Directorio de proveedores" }).waitFor();

      await page.getByRole("link", { name: "Mi perfil", exact: true }).click();
      assert.equal(await page.getByLabel("Email", { exact: true }).inputValue(), email);
      assert.equal(await page.getByLabel("Nombre", { exact: true }).inputValue(), "Cuenta de prueba");
      await page.getByLabel("Nombre", { exact: true }).fill("Perfil actualizado");
      const update = page.waitForRequest((request) => request.url().endsWith("/api/profiles/me") && request.method() === "PUT");
      await page.getByRole("button", { name: "Guardar cambios" }).click();
      assert.equal((await update).headers().authorization, `Bearer ${token}`);
      await page.getByText("Perfil actualizado.", { exact: true }).waitFor();
      await page.reload();
      await page.getByRole("heading", { name: "Mi perfil" }).waitFor();
      assert.equal(await page.getByLabel("Nombre", { exact: true }).inputValue(), "Perfil actualizado");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: `/tmp/healthcore-auth-profile-${width}.png`, fullPage: true });

      await page.route("**/api/profiles/me", (route) => route.fulfill({ status: 401, json: { detail: "Token revocado" } }));
      await page.getByRole("button", { name: "Guardar cambios" }).click();
      await page.waitForURL("**/login");
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), tokenKey), null);
      await page.unroute("**/api/profiles/me");

      await page.getByLabel("Email", { exact: true }).fill(email);
      await page.getByLabel("Contrasena", { exact: true }).fill(password);
      await page.getByRole("button", { name: "Entrar", exact: true }).click();
      await page.waitForURL("**/suppliers");
      await page.getByRole("button", { name: "Cerrar sesion", exact: true }).click();
      await page.waitForURL("**/login");
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), tokenKey), null);

      await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: tokenKey, value: "malformed" });
      // The app redirects with location.replace during load, which aborts this navigation by design.
      await Promise.all([
        page.waitForURL("**/login"),
        page.goto(`${baseURL}/account/profile`).catch((error) => { if (!String(error).includes("ERR_ABORTED")) throw error; }),
      ]);
      await page.waitForFunction((key) => localStorage.getItem(key) === null, tokenKey);

      const forged = `${Buffer.from(JSON.stringify({ alg: "HS256" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: "forged", exp: Math.floor(Date.now() / 1000) + 60 })).toString("base64url")}.invalid`;
      await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: tokenKey, value: forged });
      await page.goto(`${baseURL}/account/profile`);
      await page.waitForURL("**/login");
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), tokenKey), null);

      await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: tokenKey, value: token });
      await page.route("**/api/auth/me", (route) => route.fulfill({ status: 503, json: { detail: "API no disponible" } }));
      await page.goto(`${baseURL}/account/profile`);
      await page.locator('p[role="alert"]').waitFor();
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), tokenKey), token);
      await page.unroute("**/api/auth/me");
      await page.getByRole("button", { name: "Reintentar", exact: true }).click();
      await page.getByRole("heading", { name: "Mi perfil" }).waitFor();

      const other = await context.newPage();
      await other.goto(`${baseURL}/account/profile`);
      await other.getByRole("heading", { name: "Mi perfil" }).waitFor();
      await other.getByRole("button", { name: "Cerrar sesion", exact: true }).click();
      await page.waitForURL("**/login");
      await other.close();
      assert.deepEqual(errors, []);
      console.log(`OK ${width}px: guards, login, registro real, 422, perfil, persistencia, 401, logout, token falsificado, fallo temporal y sincronizacion entre pestanas.`);
    } finally {
      if (token) {
        const response = await context.request.get(`${baseURL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok()) {
          const user = (await response.json()).find((entry) => entry.email === email);
          if (user) await context.request.delete(`${baseURL}/api/users/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
}