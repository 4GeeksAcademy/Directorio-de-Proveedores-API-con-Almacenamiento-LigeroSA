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

element("retry-rules").addEventListener("click", initialize);
render(null);
window.lucide.createIcons();
initialize();