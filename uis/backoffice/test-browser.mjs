import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:8765";
const browser = await chromium.launch({ headless: true });
const header = "Fecha,nombre del usuario,documento de identidad,locación,estado,satisfaccion\n";
const fixture = header + '2026-10-07,"Paciente ""ficticio"", ejemplo",TEST-001,Austin,cumplido,8\n' + "2026-10-07,Paciente ficticio,TEST-002,Austin,cumplido,\n" + "2026-10-07,Paciente ficticio,TEST-003,Austin,cancelado,\n";
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
    const context = await browser.newContext({ viewport, acceptDownloads: true });
    const page = await context.newPage();
    const errors = [];
    const external = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      const allowed = [baseURL, "blob:", "https://fonts.googleapis.com", "https://fonts.gstatic.com"];
      if (!allowed.some((prefix) => request.url().startsWith(prefix))) external.push(request.url());
    });
    await page.goto(baseURL);
    await page.waitForSelector(".brand svg");
    await page.waitForSelector("#csv-file:not(:disabled)");
    assert.equal(await page.locator("#export").isDisabled(), true);
    await page.locator("#csv-file").setInputFiles({ name: "synthetic.csv", mimeType: "text/csv", buffer: Buffer.from(fixture) });
    await page.locator("#analyze").click();
    await page.waitForFunction(() => document.getElementById("total").textContent === "3");
    assert.equal(await page.locator("#valid").textContent(), "2");
    assert.equal(await page.locator("#invalid").textContent(), "1");
    assert.equal(await page.locator("#mean").textContent(), "8,00 / 10");
    assert.equal(await page.locator("#error-rows tr").count(), 1);
    assert.equal(await page.locator("body").textContent().then((text) => text.includes("TEST-001")), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const overflow = await page.evaluate(() => [...document.querySelectorAll("h1,h2,button,td,dt,dd")].filter((node) => node.offsetWidth > 0 && node.scrollWidth > node.clientWidth + 1).map((node) => node.textContent));
    assert.deepEqual(overflow, []);
    await page.screenshot({ path: `/tmp/healthcore-${viewport.width}.png`, fullPage: true });
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#export").click();
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), "results.csv");
    const stream = await download.createReadStream();
    let output = "";
    for await (const chunk of stream) output += chunk.toString();
    assert.match(output, /invalidos,1/);
    assert.doesNotMatch(output, /TEST-001/);
    const manyInvalid = header + Array.from({ length: 25 }, () => "2026-10-07,Paciente ficticio,TEST-001,Austin,cumplido,").join("\n");
    await page.locator("#csv-file").setInputFiles({ name: "synthetic.csv", mimeType: "text/csv", buffer: Buffer.from(manyInvalid) });
    await page.locator("#analyze").click();
    await page.waitForFunction(() => document.getElementById("total").textContent === "25");
    assert.equal(await page.locator("#error-rows tr").count(), 20);
    await page.locator("#next").click();
    assert.equal(await page.locator("#error-rows tr").count(), 5);
    await page.locator("#csv-file").setInputFiles({ name: "broken.csv", mimeType: "text/csv", buffer: Buffer.from("bad,data\n1,2") });
    await page.locator("#analyze").click();
    await page.waitForSelector("#message.error");
    assert.equal(await page.locator("#export").isEnabled(), true);
    assert.equal(await page.locator("#total").textContent(), "25");
    assert.equal(await page.locator("#analyze").isDisabled(), false);
    await page.locator("#csv-file").setInputFiles({ name: "empty.csv", mimeType: "text/csv", buffer: Buffer.alloc(0) });
    await page.locator("#analyze").click();
    await page.waitForFunction(() => document.getElementById("message").textContent.includes("debe contener datos"));
    await page.evaluate((csv) => {
      const transfer = new DataTransfer();
      transfer.items.add(new File([csv], "dropped.csv", { type: "text/csv" }));
      document.getElementById("drop-zone").dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }));
    }, fixture);
    await page.locator("#analyze").click();
    await page.waitForFunction(() => document.getElementById("total").textContent === "3");
    assert.equal(await page.locator("#export").isEnabled(), true);
    await page.route("**/api/incidents/results/export", (route) => route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ detail: "No hay un análisis disponible en esta sesión." }),
    }));
    await page.locator("#export").click();
    await page.waitForFunction(() => document.getElementById("message").textContent.includes("No hay un análisis"));
    assert.equal(await page.locator("#export").isDisabled(), true);
    await page.unroute("**/api/incidents/results/export");
    if (viewport.width === 1440) {
      await page.route("**/api/incidents/schema", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ detail: "Servicio no disponible." }) }));
      await page.reload();
      await page.waitForSelector("#retry-rules:not([hidden])");
      assert.equal(await page.locator("#analyze").isDisabled(), true);
      assert.equal(await page.locator("#csv-file").isDisabled(), true);
      await page.unroute("**/api/incidents/schema");
      await page.locator("#retry-rules").click();
      await page.waitForSelector("#csv-file:not(:disabled)");
      assert.equal(await page.locator("#states .state-row").count(), 4);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    await context.close();
    console.log(`OK: ${viewport.width}px, selector, arrastre, métricas, errores, paginación, descarga, sesión caducada y cero peticiones externas.`);
  }
} finally {
  await browser.close();
}