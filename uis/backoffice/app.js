let states = [];
let errorLabels = {};
let rules = null;
const element = (id) => document.getElementById(id);
const fileInput = element("csv-file");
const exportButton = element("export");
const pageSize = 20;
let latest = null;
let page = 0;
let busy = false;
let latestRows = [];
let rowPage = 0;
const rowPageSize = 10;
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const locations = [...element("location-filter").options].map((option) => option.value).filter(Boolean);

function message(text, isError = false) {
  element("message").textContent = text;
  element("message").classList.toggle("error", isError);
}

function cell(text, className = "") {
  const node = document.createElement("td");
  node.textContent = text;
  node.className = className;
  return node;
}

function showErrorPage() {
  const errors = latest?.errors ?? [];
  element("error-detail").hidden = errors.length === 0;
  const rows = errors.slice(page * pageSize, (page + 1) * pageSize).map((error) => {
    const row = document.createElement("tr");
    row.append(cell(error.line), cell(error.field), cell(errorLabels[error.code] ?? error.code));
    return row;
  });
  element("error-rows").replaceChildren(...rows);
  element("error-page").textContent = `${page * pageSize + 1}-${Math.min((page + 1) * pageSize, errors.length)} de ${errors.length} errores`;
  element("previous").disabled = page === 0;
  element("next").disabled = (page + 1) * pageSize >= errors.length;
}

function render(result) {
  for (const name of ["total", "valid", "invalid"]) {
    element(name).textContent = (result?.[name] ?? 0).toLocaleString("es");
  }
  element("mean").textContent = result?.satisfaction_mean == null ? "N/D" : `${result.satisfaction_mean.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${rules.satisfaction.maximum}`;
  element("score-count").textContent = `${result?.satisfaction_count ?? 0} casos con puntuación`;
  element("analysis-status").textContent = result ? "Análisis completado" : "Pendiente";
  element("invalid-count").textContent = result ? `${result.invalid} registros inválidos` : "Sin análisis";
  const stateRows = states.map((state) => {
    const count = result?.by_state[state] ?? 0;
    const row = document.createElement("div");
    row.className = "state-row";
    const label = document.createElement("span");
    label.textContent = state;
    const track = document.createElement("div");
    track.className = "track";
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = `${result?.valid ? (count / result.valid) * 100 : 0}%`;
    track.append(bar);
    const value = document.createElement("strong");
    value.textContent = count;
    row.append(label, track, value);
    return row;
  });
  element("states").replaceChildren(...stateRows);
  const errorRows = Object.entries(errorLabels).map(([code, label]) => {
    const row = document.createElement("tr");
    row.append(cell(label), cell(result?.errors_by_type[code] ?? 0, "number"));
    return row;
  });
  element("error-types").replaceChildren(...errorRows);
  element("quality-status").textContent = !result ? "Sin análisis procesado." : result.invalid ? "Registros inválidos excluidos del análisis. Un registro puede presentar varios tipos de problema." : "Todos los registros son válidos.";
  showErrorPage();
  renderDashboard();
}

function setBusy(value) {
  busy = value;
  fileInput.disabled = value || !rules;
  element("analyze").disabled = value || !rules;
  element("retry-rules").disabled = value;
  exportButton.disabled = value || !latest;
  element("analyze-label").textContent = value ? "Procesando…" : "Analizar";
  element("upload-form").setAttribute("aria-busy", String(value));
}

async function requestError(response) {
  try {
    const body = await response.json();
    return typeof body.detail === "string" ? body.detail : `Error HTTP ${response.status}.`;
  } catch {
    return `Error HTTP ${response.status}.`;
  }
}

element("upload-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy || !rules) return;
  const file = fileInput.files[0];
  if (!file || !file.name.toLowerCase().endsWith(".csv")) {
    message("Selecciona un fichero con extensión .csv.", true);
    return;
  }
  if (file.size === 0 || file.size > rules.limits.max_file_bytes) {
    message(`El fichero debe contener datos y no superar ${rules.limits.max_file_bytes / 1024 / 1024} MiB.`, true);
    return;
  }
  setBusy(true);
  element("analysis-status").textContent = "Procesando";
  message("Análisis en curso.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/incidents/analyze", { method: "POST", body, signal: controller.signal });
    if (!response.ok) throw new Error(await requestError(response));
    latest = await response.json();
    await loadRows();
    page = 0;
    render(latest);
    fileInput.value = "";
    message(`Análisis completado: ${latest.valid} válidos y ${latest.invalid} inválidos.`);
  } catch (error) {
    element("analysis-status").textContent = latest ? "Último análisis válido" : "Pendiente";
    message(error.name === "AbortError" ? "El análisis excedió el tiempo de espera. Puedes volver a intentarlo." : error.message === "Failed to fetch" ? "No se pudo conectar con la API local." : error.message, true);
  } finally {
    clearTimeout(timeout);
    setBusy(false);
  }
});

exportButton.addEventListener("click", async () => {
  if (busy || !latest) return;
  setBusy(true);
  try {
    const response = await fetch("/api/incidents/results/export", { signal: AbortSignal.timeout(60000) });
    if (!response.ok) {
      if (response.status === 404) {
        latest = null;
        latestRows = [];
        page = 0;
        render(null);
      }
      throw new Error(await requestError(response));
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = "results.csv";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message("Resultados descargados.");
  } catch (error) {
    message(error.message, true);
  } finally {
    setBusy(false);
  }
});

for (const [id, delta] of [["previous", -1], ["next", 1]]) {
  element(id).addEventListener("click", () => {
    page += delta;
    showErrorPage();
  });
}
const dropZone = element("drop-zone");
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  if (!busy) dropZone.classList.add("dragging");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragging"));
dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragging");
  if (busy || !rules) return;
  if (event.dataTransfer.files.length !== 1) {
    message("Selecciona un único fichero CSV.", true);
    return;
  }
  fileInput.files = event.dataTransfer.files;
});

async function initialize() {
  if (busy) return;
  setBusy(true);
  element("retry-rules").hidden = true;
  message("Conectando con el servicio local.");
  try {
    const response = await fetch("/api/incidents/schema", { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(await requestError(response));
    rules = await response.json();
    states = rules.states;
    errorLabels = rules.error_labels;
    element("score-label").textContent = `Satisfacción · ${rules.completed_state}`;
    element("file-meta").textContent = `UTF-8 · Máximo ${rules.limits.max_file_bytes / 1024 / 1024} MiB · ${rules.limits.max_records.toLocaleString("es")} registros`;
    render(latest);
    message("Sin análisis procesado.");
  } catch {
    rules = null;
    message("No se pudo cargar el contrato del servicio local. Comprueba la conexión y vuelve a intentarlo.", true);
    element("retry-rules").hidden = false;
  } finally {
    setBusy(false);
  }
}

function formatNumber(value, digits = 0) {
  return value.toLocaleString("es", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function roundHalfEven(value, digits = 2) {
  const factor = 10 ** digits;
  const scaled = value * factor;
  const floor = Math.floor(scaled);
  if (Math.abs(scaled - floor - 0.5) < 1e-9) return (floor % 2 === 0 ? floor : floor + 1) / factor;
  return Math.round(scaled) / factor;
}

function svgNode(tag, attributes = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  return node;
}

function filteredRows() {
  const from = element("date-from").value;
  const to = element("date-to").value;
  const location = element("location-filter").value;
  const dateActive = Boolean(from || to);
  return latestRows.filter((row) => {
    if (location && row.location !== location) return false;
    if (!dateActive) return true;
    if (!isoDate.test(row.date)) return false;
    return (!from || row.date >= from) && (!to || row.date <= to);
  });
}

function setDateBounds() {
  const days = latestRows.map((row) => row.date).filter((date) => isoDate.test(date)).sort();
  const values = { "date-from": days[0] ?? "", "date-to": days.at(-1) ?? "" };
  for (const [id, value] of Object.entries(values)) {
    element(id).min = days[0] ?? "";
    element(id).max = days.at(-1) ?? "";
    element(id).value = value;
  }
}

async function loadRows() {
  latestRows = [];
  const response = await fetch("/api/incidents/results/rows", { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(await requestError(response));
  latestRows = (await response.json()).rows;
  setDateBounds();
}

function renderKpis(rows) {
  const completed = rows.filter((row) => row.state === rules.completed_state);
  const scores = completed.map((row) => row.score).filter((score) => score != null);
  const maximum = rules.satisfaction.maximum;
  const mean = scores.length ? roundHalfEven(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
  const level = mean == null ? "none" : mean >= 8 ? "high" : mean >= 6 ? "mid" : "low";
  const labels = { none: "Sin datos", high: "Alto", mid: "Medio", low: "Bajo" };
  const share = rows.length ? completed.length / rows.length : 0;
  element("kpi-completed").textContent = formatNumber(completed.length);
  element("kpi-completed-share").textContent = rows.length ? `${formatNumber(share * 100, 1)} % de ${formatNumber(rows.length)} consultas` : "Sin consultas en el filtro";
  drawGauge(element("completed-gauge"), share, `${formatNumber(share * 100, 0)} %`);
  element("mean").textContent = mean == null ? "N/D" : `${formatNumber(mean, 2)} / ${maximum}`;
  drawGauge(element("mean-gauge"), mean == null ? 0 : mean / maximum, mean == null ? "N/D" : formatNumber(mean, 2));
  element("mean-badge").dataset.level = level;
  element("mean-badge").textContent = labels[level];
  element("score-count").textContent = `${scores.length} casos con puntuación`;
  element("kpi-patients").textContent = formatNumber(latest?.unique_patients ?? 0);
}

const stateColors = { cumplido: "#6d5ce7", cancelado: "#5fd3c2", "cancelacion tardia": "#f5c542", "no concurrencia": "#3b9cf5" };
const gaugeArc = "M 20 100 A 80 80 0 0 1 180 100";
const gaugeLength = Math.PI * 80;

function drawGauge(svg, fraction, text) {
  const clamped = Math.min(1, Math.max(0, fraction));
  const label = svgNode("text", { x: 100, y: 92, "text-anchor": "middle", class: "gauge-value" });
  label.textContent = text;
  svg.replaceChildren(
    svgNode("path", { d: gaugeArc, class: "gauge-track" }),
    svgNode("path", { d: gaugeArc, class: "gauge-fill", "stroke-dasharray": gaugeLength, "stroke-dashoffset": gaugeLength * (1 - clamped) }),
    label,
  );
}

function legendItem(label, value, color) {
  const item = document.createElement("li");
  const swatch = document.createElement("span");
  swatch.className = "legend-swatch";
  swatch.style.background = color;
  item.append(swatch, value ? `${label}: ${value}` : label);
  return item;
}

function renderStateDonut(rows) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const entries = rules.states.map((state) => [state, rows.filter((row) => row.state === state).length]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const group = svgNode("g", { transform: "rotate(-90 100 100)" });
  group.append(svgNode("circle", { cx: 100, cy: 100, r: radius, class: "donut-track" }));
  let offset = 0;
  for (const [state, count] of entries) {
    if (!count) continue;
    const length = (count / total) * circumference;
    group.append(svgNode("circle", { cx: 100, cy: 100, r: radius, class: "donut-segment", stroke: stateColors[state] ?? "#999", "stroke-dasharray": `${length} ${circumference - length}`, "stroke-dashoffset": -offset }));
    offset += length;
  }
  const center = svgNode("text", { x: 100, y: 110, "text-anchor": "middle", class: "donut-value" });
  center.textContent = formatNumber(total);
  element("state-donut").replaceChildren(group, center);
  element("state-legend").replaceChildren(...entries.map(([state, count]) => legendItem(state, `${formatNumber(count)} (${formatNumber(total ? (count / total) * 100 : 0, 0)} %)`, stateColors[state] ?? "#999")));
}

function renderLocationStates(rows) {
  const columns = locations.map((location) => {
    const group = rows.filter((row) => row.location === location);
    const track = document.createElement("div");
    track.className = "stack-track";
    for (const state of rules.states) {
      const count = group.filter((row) => row.state === state).length;
      if (!count) continue;
      const share = (count / group.length) * 100;
      const segment = document.createElement("div");
      segment.className = "stack-segment";
      segment.style.height = `${share}%`;
      segment.style.background = stateColors[state] ?? "#999";
      segment.title = `${state}: ${count}`;
      segment.textContent = share >= 8 ? `${formatNumber(share, 0)} %` : "";
      track.append(segment);
    }
    const name = document.createElement("span");
    name.className = "stack-label";
    name.textContent = `${location} (${formatNumber(group.length)})`;
    const column = document.createElement("div");
    column.className = "stack-col";
    column.append(track, name);
    return column;
  });
  element("location-chart").replaceChildren(...columns);
  element("location-legend").replaceChildren(...rules.states.map((state) => legendItem(state, "", stateColors[state] ?? "#999")));
}

function renderTrend(rows) {
  const svg = element("trend-chart");
  const perDay = new Map();
  for (const row of rows) {
    if (!isoDate.test(row.date) || row.state !== rules.completed_state || row.score == null) continue;
    const entry = perDay.get(row.date) ?? { sum: 0, count: 0 };
    entry.sum += row.score;
    entry.count += 1;
    perDay.set(row.date, entry);
  }
  const days = [...perDay.keys()].sort();
  element("trend-empty").hidden = days.length > 0;
  svg.replaceChildren();
  if (!days.length) return;
  const width = 640;
  const height = 240;
  const pad = 36;
  const { minimum, maximum } = rules.satisfaction;
  const means = days.map((day) => roundHalfEven(perDay.get(day).sum / perDay.get(day).count));
  const x = (index) => (days.length === 1 ? width / 2 : pad + (index * (width - 2 * pad)) / (days.length - 1));
  const y = (value) => height - pad - ((value - minimum) / (maximum - minimum)) * (height - 2 * pad);
  for (let level = minimum; level <= maximum; level += 1) {
    svg.append(svgNode("line", { x1: pad, x2: width - pad, y1: y(level), y2: y(level), class: "trend-grid" }));
  }
  const points = means.map((mean, index) => [x(index), y(mean)]);
  svg.append(svgNode("polyline", { points: points.map(([px, py]) => `${px},${py}`).join(" "), class: "trend-line" }));
  days.forEach((day, index) => {
    const [px, py] = points[index];
    const dot = svgNode("circle", { cx: px, cy: py, r: 4, class: "trend-dot" });
    const title = svgNode("title");
    title.textContent = `${day}: ${formatNumber(means[index], 2)} de satisfacción`;
    dot.append(title);
    svg.append(dot);
    const value = svgNode("text", { x: px, y: py - 10, "text-anchor": "middle", class: "trend-value" });
    value.textContent = formatNumber(means[index], 2);
    svg.append(value);
  });
  const labelPositions = days.length > 1 ? [[0, "start"], [days.length - 1, "end"]] : [[0, "middle"]];
  for (const [index, anchor] of labelPositions) {
    const label = svgNode("text", { x: x(index), y: height - 8, "text-anchor": anchor, class: "trend-label" });
    label.textContent = days[index];
    svg.append(label);
  }
}

function stateCell(state) {
  const td = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `state-badge ${state === rules.completed_state ? "state-done" : "state-other"}`;
  badge.textContent = state;
  td.append(badge);
  return td;
}

function renderTable(rows) {
  const pages = Math.max(1, Math.ceil(rows.length / rowPageSize));
  rowPage = Math.min(rowPage, pages - 1);
  const start = rowPage * rowPageSize;
  const sorted = [...rows].sort((a, b) => b.date.localeCompare(a.date));
  const slice = sorted.slice(start, start + rowPageSize);
  element("row-rows").replaceChildren(...slice.map((row) => {
    const tr = document.createElement("tr");
    tr.append(cell(row.date), cell(row.location), stateCell(row.state), cell(row.score == null ? "—" : row.score.toLocaleString("es", { maximumFractionDigits: 2 }), "number score"));
    return tr;
  }));
  element("row-page").textContent = rows.length ? `${start + 1}-${Math.min(start + rowPageSize, rows.length)} de ${formatNumber(rows.length)} consultas` : "Sin consultas en el filtro";
  element("row-previous").disabled = rowPage === 0;
  element("row-next").disabled = start + rowPageSize >= rows.length;
}

function renderDashboard() {
  if (!rules) return;
  const rows = filteredRows();
  renderKpis(rows);
  renderStateDonut(rows);
  renderLocationStates(rows);
  renderTrend(rows);
  renderTable(rows);
  renderStatus(rows);
}

function renderStatus(rows) {
  const invalid = latest?.invalid ?? 0;
  const alert = element("invalid-alert");
  alert.hidden = invalid === 0;
  alert.textContent = `${formatNumber(invalid)} registro(s) excluido(s) del análisis por datos inválidos. Revisa el detalle de errores.`;
  const days = latestRows.map((row) => row.date).filter((date) => isoDate.test(date)).sort();
  const range = days.length ? `Datos del ${days[0]} al ${days.at(-1)}. ` : "";
  element("dashboard-status").textContent = latest ? `${range}${formatNumber(rows.length)} consultas en el filtro.` : "Carga un CSV para ver el dashboard.";
}


for (const id of ["date-from", "date-to", "location-filter"]) {
  element(id).addEventListener("change", () => {
    rowPage = 0;
    renderDashboard();
  });
}
element("clear-filters").addEventListener("click", () => {
  element("date-from").value = "";
  element("date-to").value = "";
  element("location-filter").value = "";
  rowPage = 0;
  renderDashboard();
});
for (const [id, delta] of [["row-previous", -1], ["row-next", 1]]) {
  element(id).addEventListener("click", () => {
    rowPage += delta;
    renderDashboard();
  });
}

element("retry-rules").addEventListener("click", initialize);
render(null);
window.lucide.createIcons();
initialize();