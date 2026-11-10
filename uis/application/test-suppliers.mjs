import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:3000";
const email = process.env.HEALTHCORE_TEST_EMAIL;
const password = process.env.HEALTHCORE_TEST_PASSWORD;
assert.ok(email && password, "Define HEALTHCORE_TEST_EMAIL y HEALTHCORE_TEST_PASSWORD con un usuario existente.");
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    const createdIds = [];
    let token = "";
    const name = `HealthCore prueba ${width} ${Date.now()}`;
    page.on("pageerror", (error) => errors.push(error.message));
    try {
      await page.goto(baseURL);
      await page.getByRole("navigation").getByRole("link", { name: "Proveedores" }).click();
      await page.getByRole("heading", { name: "Iniciar sesión" }).waitFor();
      await page.getByLabel("Email", { exact: true }).fill(email);
      await page.getByLabel("Contraseña", { exact: true }).fill(password);
      await page.getByRole("button", { name: "Entrar", exact: true }).click();
      await page.getByRole("button", { name: "Nuevo proveedor", exact: true }).waitFor({ state: "visible" });
      token = await page.evaluate(() => sessionStorage.getItem("healthcore_access_token"));
      await page.waitForFunction(() => !document.querySelector("main button").disabled);
      await page.getByRole("button", { name: "Nuevo proveedor", exact: true }).click();
      await page.getByRole("textbox", { name: "Nombre", exact: true }).fill(name);
      const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Crear proveedor" }) });
      await form.getByLabel("País", { exact: true }).selectOption("UK");
      await form.getByLabel("Categoría", { exact: true }).selectOption("compliance_legal");
      await form.getByLabel("Tarifa por hora", { exact: true }).fill("0");
      await form.getByRole("button", { name: "Crear proveedor" }).click();
      assert.match(await form.getByRole("alert").innerText(), /mayor que cero/);
      await form.getByLabel("Tarifa por hora", { exact: true }).fill("145.5");
      await page.route("**/api/suppliers", async (route) => {
        if (route.request().method() === "POST") {
          await route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ detail: [{ loc: ["body", "rate"], type: "greater_than" }] }) });
        } else await route.continue();
      });
      const rejected = page.waitForResponse((response) => response.url().endsWith("/api/suppliers") && response.status() === 422);
      await form.getByRole("button", { name: "Crear proveedor" }).click();
      await rejected;
      assert.match(await form.getByRole("alert").innerText(), /Tarifa.*mayor que cero/);
      await page.unroute("**/api/suppliers");
      const creation = page.waitForResponse((response) => response.url().endsWith("/api/suppliers") && response.request().method() === "POST");
      await form.getByRole("button", { name: "Crear proveedor" }).click();
      const created = await creation;
      assert.equal(created.status(), 201, await created.text());
      createdIds.push((await created.json()).id);
      const row = page.getByRole("row").filter({ has: page.getByRole("rowheader", { name, exact: true }) });
      await row.waitFor();
      const filters = page.locator("main > div").filter({ has: page.getByRole("combobox", { name: "País", exact: true }) });
      await filters.getByRole("combobox", { name: "País", exact: true }).selectOption("US");
      assert.equal(await row.count(), 0);
      await filters.getByRole("combobox", { name: "País", exact: true }).selectOption("UK");
      await filters.getByRole("combobox", { name: "Categoría", exact: true }).selectOption("medical_supplies");
      assert.equal(await row.count(), 0);
      await filters.getByRole("combobox", { name: "Categoría", exact: true }).selectOption("compliance_legal");
      await row.waitFor();
      await row.getByRole("spinbutton").fill("175.25");
      const rateChange = page.waitForResponse((response) => response.url().endsWith("/rate") && response.request().method() === "PATCH");
      await row.getByRole("button", { name: `Guardar tarifa de ${name}`, exact: true }).click();
      assert.equal((await rateChange).status(), 200);
      const statusChange = page.waitForResponse((response) => response.url().endsWith("/status") && response.request().method() === "PATCH");
      await row.getByRole("switch").click();
      assert.equal((await statusChange).status(), 200);
      await row.getByText("Suspendido", { exact: true }).waitFor();
      await page.reload();
      await row.waitFor();
      assert.equal(await row.getByRole("spinbutton").inputValue(), "175.25");
      assert.equal(await row.getByRole("switch").isChecked(), false);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      const overflow = await page.locator("main").evaluate((main) => [...main.querySelectorAll("h1,h2,button,th,td,label")].filter((node) => node.clientWidth > 0 && node.scrollWidth > node.clientWidth + 1).map((node) => node.textContent));
      assert.deepEqual(overflow, []);
      await page.screenshot({ path: `/tmp/healthcore-suppliers-${width}.png`, fullPage: true });
      page.once("dialog", (dialog) => dialog.accept());
      await row.getByRole("button", { name: `Eliminar a ${name}`, exact: true }).click();
      await row.waitFor({ state: "detached" });
      assert.deepEqual(errors, []);
      console.log(`OK ${width}px: navegación, filtros, errores 422, creación, tarifa, estado, persistencia, eliminación y sin desbordamientos.`);
    } finally {
      for (const id of createdIds) await context.request.delete(`${baseURL}/api/suppliers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      await context.close();
    }
  }
} finally {
  await browser.close();
}