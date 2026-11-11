const SECTIONS = ["agendas", "facturacion", "analisis"];
const userEmail = document.getElementById("userEmail");

function showSection() {
  const requested = location.hash.slice(1);
  const active = SECTIONS.includes(requested) ? requested : SECTIONS[0];

  SECTIONS.forEach((id) => {
    document.getElementById(id).classList.toggle("hidden", id !== active);
  });
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    if (link.getAttribute("href") === `#${active}`) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

async function loadSession() {
  const response = await fetch("/api/staff/session");
  if (!response.ok) {
    location.replace("/staff/login");
    return;
  }
  const session = await response.json();
  userEmail.textContent = session.email;
}

async function redirectIfSessionLost() {
  const response = await fetch("/api/staff/session");
  if (!response.ok) location.replace("/staff/login");
}

document.getElementById("logout").addEventListener("click", async () => {
  await fetch("/api/staff/logout", { method: "POST" });
  location.replace("/");
});

const COUNTRY_LABELS = { US: "Estados Unidos", UK: "Reino Unido" };
const REGION_LABELS = { Texas: "Texas", Florida: "Florida", Georgia: "Georgia", London: "Londres", Manchester: "Manchester" };
const SERVICE_LABELS = { "primary-care": "Atención primaria", specialist: "Consulta con especialista" };
const PAYER_LABELS = { "private-insurance": "Seguro privado", "medicare-medicaid": "Medicare / Medicaid", nhs: "NHS", "self-pay": "Pago directo" };
const CONTACT_LABELS = { phone: "Llamada telefónica", email: "Email", sms: "SMS" };
const BEST_TIME_LABELS = { morning: "Mañana", afternoon: "Tarde", evening: "Noche" };
const agendaRows = document.getElementById("agendaRows");
const agendaStatus = document.getElementById("agendaStatus");
const agendaFilters = ["filterCountry", "filterRegion", "filterService", "filterDate"].map((id) => document.getElementById(id));

function cell(text) {
  const td = document.createElement("td");
  td.className = "td";
  td.title = text ?? "";
  td.textContent = text;
  return td;
}

const LANGUAGE_LABELS = { en: "Inglés", es: "Español" };
const fichaPanel = document.getElementById("fichaPanel");

const ESTADO_LABELS = {
  reservada: "Gestionar",
  coordinado: "Coordinado",
  cumplido: "Cumplido",
  "no concurrencia": "No concurrencia",
  cancelado: "Cancelado",
  "cancelacion tardia": "Cancelacion tardia"
};
const ESTADO_OPTIONS = [
  { value: "reservada", label: "Gestionar" },
  { value: "coordinado", label: "Coordinado" },
  { value: "cumplido", label: "Cumplido" },
  { value: "no concurrencia", label: "No concurrencia" }
];
const CANCEL_OPTIONS = [
  { value: "cancelar", label: "Cancelado" },
  { value: "cancelar_tardia", label: "Cancelacion tardia" }
];
const CANCEL_ACTION = { path: "cancel", confirm: "¿Cancelar esta cita?" };
const clientFilters = ["filterProvider", "filterStatus", "filterSearch"].map((id) => document.getElementById(id));
const viewButtons = { list: document.getElementById("viewList"), day: document.getElementById("viewDay"), week: document.getElementById("viewWeek") };
let agendaData = [];
let agendaView = "list";

function appointmentLabel(item) {
  return item.appointmentAt ? item.appointmentAt.replace("T", " ") : "Sin hora exacta";
}

function dayOf(item) {
  return (item.appointmentAt || item.preferredDate).slice(0, 10);
}

function weekStartOf(isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

function groupOf(item) {
  return agendaView === "week" ? weekStartOf(dayOf(item)) : dayOf(item);
}

function matchesClientFilters(item) {
  const provider = document.getElementById("filterProvider").value;
  const status = document.getElementById("filterStatus").value;
  const search = document.getElementById("filterSearch").value.trim().toLowerCase();
  if (provider && item.providerId !== provider) return false;
  if (status && item.estadoCita !== status) return false;
  if (search) {
    const haystack = `${item.firstName} ${item.lastName} ${item.identityDocument}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }
  return true;
}

async function runStatusAction(item, action) {
  if (action.confirm && !window.confirm(action.confirm)) {
    await loadApplications();
    return;
  }
  const options = { method: "POST" };
  if (action.body) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(action.body);
  }
  const response = await fetch(`/api/staff/applications/${encodeURIComponent(item.id)}/${action.path}`, options);
  let message = "";
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    message = detail.detail || "No se pudo actualizar la cita.";
  } else if (action.path === "cancel") {
    const result = await response.json();
    const suggestions = result.suggestedApplications || [];
    const next = suggestions.length
      ? ` Contactar para ofrecer el cupo: ${suggestions.map((s) => `${s.firstName} ${s.lastName}`).join(", ")}.`
      : " Sin solicitudes pendientes para este cupo.";
    message = (result.penaltyApplied ? "Cancelación tardía: aplica penalización del 50%." : "Cancelación a tiempo.") + next;
  }
  await loadApplications();
  await loadBilling();
  await loadFreedSlots();
  if (message) agendaStatus.textContent = message;
}

function changeEstado(item, value) {
  if (CANCEL_OPTIONS.some((option) => option.value === value)) return runStatusAction(item, CANCEL_ACTION);
  if (value === item.estadoCita) return;
  if (value === "cumplido") {
    if (!window.confirm("¿Enviar la encuesta de satisfacción al paciente? (Aceptar = Sí, Cancelar = No)")) {
      agendaStatus.textContent = "La cita no se marcó como cumplida.";
      return loadApplications();
    }
  }
  return runStatusAction(item, { path: "status", body: { estadoCita: value } });
}

const ESTADO_BADGE = {
  reservada: "bg-amber-100 text-amber-900 ring-amber-300",
  coordinado: "bg-sky-100 text-sky-900 ring-sky-300",
  cumplido: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  "no concurrencia": "bg-orange-100 text-orange-900 ring-orange-300",
  cancelado: "bg-slate-200 text-slate-700 ring-slate-300",
  "cancelacion tardia": "bg-rose-100 text-rose-900 ring-rose-300"
};

function estadoCell(item) {
  const td = document.createElement("td");
  td.className = "border-b border-navy/10 px-3 py-3 align-middle whitespace-nowrap";
  const select = document.createElement("select");
  select.className = `h-9 w-36 shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:cursor-not-allowed disabled:opacity-70 ${ESTADO_BADGE[item.estadoCita] ?? ""}`;
  select.setAttribute("aria-label", "Estado de la cita");
  const locked = ["cancelado", "cancelacion tardia"].includes(item.estadoCita);
  const cancellable = ["reservada", "coordinado"].includes(item.estadoCita);
  const allOptions = locked ? [] : [...ESTADO_OPTIONS, ...CANCEL_OPTIONS];
  if (locked) allOptions.push({ value: item.estadoCita, label: ESTADO_LABELS[item.estadoCita] });
  allOptions.forEach(({ value, label }) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    option.disabled = CANCEL_OPTIONS.some((cancel) => cancel.value === value) && !cancellable;
    select.append(option);
  });
  select.value = item.estadoCita;
  select.disabled = locked;
  select.addEventListener("change", () => changeEstado(item, select.value));
  td.append(select);
  return td;
}

function renderRow(item) {
  const tr = document.createElement("tr");
  const values = [
    formatDate(item.preferredDate),
    item.appointmentAt ? appointmentLabel(item) : "-",
    COUNTRY_LABELS[item.country],
    REGION_LABELS[item.clinicRegion],
    `${item.firstName} ${item.lastName}`,
    SERVICE_LABELS[item.serviceType]
  ];
  values.forEach((value, index) => {
    const td = cell(value);
    if (index <= 3) td.classList.add("whitespace-nowrap");
    tr.append(td);
  });
  tr.append(estadoCell(item));
  const actions = document.createElement("td");
  actions.className = "border-b border-navy/10 px-3 py-3 align-middle whitespace-nowrap";
  const wrap = document.createElement("div");
  wrap.className = "flex items-center gap-2";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "row-btn";
  button.textContent = "Ver ficha";
  button.addEventListener("click", () => showFicha(item));
  wrap.append(button);
  if (item.estadoCita === "reservada" && !item.appointmentAt) {
    const offer = document.createElement("button");
    offer.type = "button";
    offer.className = "row-btn";
    offer.textContent = "Ofrecer horario";
    offer.addEventListener("click", () => startOffer(item));
    wrap.append(offer);
  }
  actions.append(wrap);
  tr.append(actions);
  return tr;
}

const EMPTY_TEXT = "No aplica";
let fichaOpener = null;

function capitalizeWords(text) {
  return text.trim().toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, sep, letter) => sep + letter.toUpperCase());
}

function capitalizeFirst(text) {
  const clean = text.trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("es", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function actionLink(text, href) {
  const link = document.createElement("a");
  link.className = "ficha-action";
  link.href = href;
  link.textContent = text;
  return link;
}

function copyButton(text) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ficha-action";
  button.textContent = "Copiar";
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copiado";
    } catch {
      button.textContent = "No se pudo copiar";
    }
  });
  return button;
}

function fichaSection(title, rows) {
  const section = document.createElement("section");
  section.className = "mt-6 border-t border-navy/10 pt-5";
  const heading = document.createElement("h4");
  heading.className = "mb-3 text-[0.6875rem] font-bold tracking-widest text-navy/60 uppercase";
  heading.textContent = title;
  const dl = document.createElement("dl");
  dl.className = "m-0 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-center";
  rows.forEach(([label, value, actions = []]) => {
    const dt = document.createElement("dt");
    dt.className = "text-[0.8125rem] font-medium text-slate-500";
    dt.textContent = label;
    const dd = document.createElement("dd");
    if (value) {
      dd.className = "m-0 flex min-w-0 flex-wrap items-center gap-2 text-sm font-semibold leading-snug break-words text-navy";
      dd.textContent = value;
    } else {
      dd.className = "m-0 flex min-w-0 flex-wrap items-center gap-2 text-sm font-normal text-slate-400 italic";
      dd.textContent = EMPTY_TEXT;
    }
    dd.append(...actions);
    dl.append(dt, dd);
  });
  section.append(heading, dl);
  return section;
}

function closeFicha() {
  fichaPanel.classList.add("hidden");
  if (fichaOpener) fichaOpener.focus();
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !fichaPanel.classList.contains("hidden")) closeFicha();
  if (event.key === "Escape" && !offerModal.classList.contains("hidden")) closeOffer();
});

function showFicha(item) {
  fichaOpener = document.activeElement;
  const name = capitalizeWords(`${item.firstName} ${item.lastName}`);
  const title = document.createElement("h3");
  title.id = "fichaTitle";
  title.className = "mb-1 text-xl font-bold tracking-tight text-navy";
  title.textContent = name;

  const close = document.createElement("button");
  close.type = "button";
  close.className = "chip px-4 py-2 text-sm font-semibold";
  close.textContent = "Cerrar";
  close.addEventListener("click", closeFicha);
  const footer = document.createElement("div");
  footer.className = "mt-6 flex justify-end gap-2.5 border-t border-navy/10 pt-5";
  footer.append(close);

  fichaPanel.replaceChildren(
    title,
    fichaSection("Información personal", [
      ["Nombre", name],
      ["Email", item.email, [actionLink("Escribir", `mailto:${encodeURIComponent(item.email)}`), copyButton(item.email)]],
      ["Teléfono", item.phone, [actionLink("Llamar", `tel:${item.phone.replace(/[^\d+]/g, "")}`), copyButton(item.phone)]],
      ["Fecha de nacimiento", formatDate(item.birthDate)],
      ["Idioma preferido", LANGUAGE_LABELS[item.preferredLanguage]]
    ]),
    fichaSection("Ubicación", [
      ["País", COUNTRY_LABELS[item.country]],
      ["Región", REGION_LABELS[item.clinicRegion]]
    ]),
    fichaSection("Detalles de la cita", [
      ["Servicio", SERVICE_LABELS[item.serviceType]],
      ["Fecha deseada", formatDate(item.preferredDate)],
      ["Canal de contacto", CONTACT_LABELS[item.contactMethod]],
      ["Mejor horario", BEST_TIME_LABELS[item.bestTime]],
      ["Recibida", new Date(item.createdAt).toLocaleString("es")]
    ]),
    fichaSection("Cobertura médica", [
      ["Tipo de cobertura", PAYER_LABELS[item.payerType]],
      ["Aseguradora", item.insuranceProvider],
      ["Número de póliza", item.policyNumber],
      ["Condiciones de salud", capitalizeFirst(item.healthNotes)]
    ]),
    footer
  );
  fichaPanel.classList.remove("hidden");
  close.focus();
}

async function loadApplications() {
  const params = new URLSearchParams({
    country: document.getElementById("filterCountry").value,
    clinicRegion: document.getElementById("filterRegion").value,
    serviceType: document.getElementById("filterService").value,
    preferredDate: document.getElementById("filterDate").value
  });
  const response = await fetch(`/api/staff/applications?${params}`);
  if (response.status === 401) return redirectIfSessionLost();
  if (!response.ok) {
    agendaStatus.textContent = "No se pudo cargar la agenda.";
    return;
  }
  agendaData = await response.json();
  renderAgenda();
}

function renderAgenda() {
  const rows = agendaData
    .filter(matchesClientFilters)
    .sort((a, b) => (a.appointmentAt || a.preferredDate).localeCompare(b.appointmentAt || b.preferredDate));
  const nodes = [];
  let currentDay = null;
  rows.forEach((item) => {
    if (agendaView !== "list" && groupOf(item) !== currentDay) {
      currentDay = groupOf(item);
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.className = "px-3 pt-5 pb-2 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase";
      th.colSpan = 8;
      th.scope = "colgroup";
      th.textContent = agendaView === "week" ? `Semana del ${formatDate(currentDay)}` : formatDate(currentDay);
      tr.append(th);
      nodes.push(tr);
    }
    nodes.push(renderRow(item));
  });
  agendaRows.replaceChildren(...nodes);
  agendaStatus.textContent = `${rows.length} solicitud(es). Se actualiza automáticamente.`;
}

function setAgendaView(view) {
  agendaView = view;
  Object.entries(viewButtons).forEach(([name, button]) => button.setAttribute("aria-pressed", String(name === view)));
  renderAgenda();
}

function syncRegionOptions(countryId, regionId) {
  const country = document.getElementById(countryId).value;
  const region = document.getElementById(regionId);
  Array.from(region.options).forEach((option) => {
    if (!option.value) return;
    const available = !country || option.dataset.country === country;
    option.hidden = !available;
    option.disabled = !available;
  });
  if (region.selectedOptions[0]?.disabled) region.value = "";
}

document.getElementById("filterCountry").addEventListener("change", () => syncRegionOptions("filterCountry", "filterRegion"));
syncRegionOptions("filterCountry", "filterRegion");
agendaFilters.forEach((filter) => filter.addEventListener("change", loadApplications));
clientFilters.forEach((filter) => filter.addEventListener("input", renderAgenda));
viewButtons.list.addEventListener("click", () => setAgendaView("list"));
viewButtons.day.addEventListener("click", () => setAgendaView("day"));
viewButtons.week.addEventListener("click", () => setAgendaView("week"));
const filterProviderSelect = document.getElementById("filterProvider");
const providerForm = document.getElementById("providerForm");
const providerStatus = document.getElementById("providerStatus");
const providerRows = document.getElementById("providerRows");
const offerDate = document.getElementById("offerDate");
const offerTarget = document.getElementById("offerTarget");
const offerStatus = document.getElementById("offerStatus");
const offerSlots = document.getElementById("offerSlots");
const offerModal = document.getElementById("offerModal");
const offerOverlay = document.getElementById("offerOverlay");
const offerClose = document.getElementById("offerClose");
const exportCsv = document.getElementById("exportCsv");
const freedRows = document.getElementById("freedRows");
const freedStatus = document.getElementById("freedStatus");
const freedSuggestions = new Map();
const DAY_LABELS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
let offerApplication = null;

function errorText(detail, fallback) {
  return typeof detail === "string" ? detail : fallback;
}

async function loadProviders() {
  const response = await fetch("/api/staff/providers");
  if (!response.ok) {
    providerStatus.textContent = "No se pudieron cargar los prestadores.";
    return;
  }
  const providers = await response.json();
  const current = filterProviderSelect.value;
  const options = [new Option("Todos", "")];
  providers.forEach((provider) => options.push(new Option(`${provider.firstName} ${provider.lastName}`, provider.id)));
  filterProviderSelect.replaceChildren(...options);
  filterProviderSelect.value = current;
  providerRows.replaceChildren(...providers.map((provider) => {
    const tr = document.createElement("tr");
    tr.append(
      cell(`${provider.firstName} ${provider.lastName}`),
      cell(SERVICE_LABELS[provider.serviceType] || provider.serviceType),
      cell(REGION_LABELS[provider.clinicRegion] || provider.clinicRegion),
      cell(provider.days.map((day) => DAY_LABELS[day]).join(", ")),
      cell(`${provider.startTime} - ${provider.endTime}`)
    );
    return tr;
  }));
}

providerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const days = [...providerForm.querySelectorAll('input[name="providerDay"]:checked')].map((input) => Number(input.value));
  if (!days.length) {
    providerStatus.textContent = "Seleccione al menos un día de consulta.";
    return;
  }
  const body = {
    firstName: document.getElementById("providerFirstName").value.trim(),
    lastName: document.getElementById("providerLastName").value.trim(),
    serviceType: document.getElementById("providerService").value,
    clinicRegion: document.getElementById("providerRegion").value,
    days,
    startTime: document.getElementById("providerStart").value,
    endTime: document.getElementById("providerEnd").value
  };
  const response = await fetch("/api/staff/providers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    providerStatus.textContent = errorText(detail.detail, "Revise los datos del prestador.");
    return;
  }
  providerForm.reset();
  providerStatus.textContent = "Prestador guardado.";
  await loadProviders();
});

function closeOffer() {
  offerModal.classList.add("hidden");
  offerOverlay.classList.add("hidden");
  offerApplication = null;
  offerSlots.replaceChildren();
  offerStatus.textContent = "";
}

function startOffer(item) {
  offerApplication = item;
  offerDate.min = new Date().toLocaleDateString("en-CA");
  offerDate.value = item.preferredDate;
  offerTarget.textContent = `Ofrecer horario a ${capitalizeWords(`${item.firstName} ${item.lastName}`)} · ${SERVICE_LABELS[item.serviceType]} · ${REGION_LABELS[item.clinicRegion]} · fecha deseada ${formatDate(item.preferredDate)}`;
  offerModal.classList.remove("hidden");
  offerOverlay.classList.remove("hidden");
  offerClose.focus();
  return searchOffers();
}

offerClose.addEventListener("click", closeOffer);
offerOverlay.addEventListener("click", closeOffer);

async function searchOffers() {
  offerSlots.replaceChildren();
  offerStatus.textContent = "";
  if (!offerApplication) {
    offerStatus.textContent = "Seleccione una solicitud pendiente con \"Ofrecer horario\".";
    return;
  }
  if (!offerDate.value) return;
  const params = new URLSearchParams({
    serviceType: offerApplication.serviceType,
    clinicRegion: offerApplication.clinicRegion,
    from: offerDate.value,
    days: "30"
  });
  const response = await fetch(`/api/staff/availability-range?${params}`);
  if (!response.ok) {
    offerStatus.textContent = "No se pudo consultar la disponibilidad.";
    return;
  }
  const days = await response.json();
  if (!days.length) {
    offerStatus.textContent = "No hay horarios libres en los próximos 30 días desde la fecha elegida.";
    return;
  }
  const total = days.reduce((count, day) => count + day.slots.length, 0);
  offerStatus.textContent = `${total} horario(s) libre(s) en ${days.length} día(s). Seleccione uno para ofrecerlo.`;
  offerSlots.replaceChildren(...days.map((day) => {
    const section = document.createElement("div");
    section.className = "w-full";
    const heading = document.createElement("p");
    heading.className = "mt-2 font-semibold text-navy";
    heading.textContent = `${DAY_LABELS[(new Date(`${day.date}T00:00`).getDay() + 6) % 7]} ${formatDate(day.date)} · ${day.slots[0].durationMinutes} min`;
    const chips = document.createElement("div");
    chips.className = "mt-1 flex flex-wrap gap-2";
    chips.append(...day.slots.map((slot) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.textContent = `${slot.appointmentAt.slice(11)} · ${slot.providerName}`;
      button.addEventListener("click", () => confirmOffer(slot));
      return button;
    }));
    section.append(heading, chips);
    return section;
  }));
}

async function loadFreedSlots() {
  const response = await fetch("/api/staff/freed-slots");
  if (!response.ok) {
    freedRows.replaceChildren();
    freedStatus.textContent = "No se pudieron cargar los servicios cancelados.";
    return;
  }
  const items = await response.json();
  if (!items.length) {
    const tr = document.createElement("tr");
    const empty = cell("No hay servicios cancelados con horario liberado.");
    empty.colSpan = 6;
    tr.append(empty);
    freedRows.replaceChildren(tr);
    return;
  }
  freedRows.replaceChildren(...items.map(renderFreedRow));
}

function renderFreedRow(item) {
  const tr = document.createElement("tr");
  const actions = cell("");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "chip";
  button.textContent = "Buscar destinatario con IA";
  button.disabled = !item.appointmentAt || !item.providerId;
  button.title = button.disabled ? "Requiere horario y prestador asignados" : "";
  button.addEventListener("click", () => suggestRecipients(item));
  actions.append(button);
  (freedSuggestions.get(item.id) || []).forEach((suggestion) => {
    const wrapper = document.createElement("div");
    wrapper.className = "mt-2 flex flex-col gap-1";
    const offer = document.createElement("button");
    offer.type = "button";
    offer.className = "chip";
    offer.textContent = `Ofrecer a ${capitalizeWords(`${suggestion.firstName} ${suggestion.lastName}`)} · fecha deseada ${formatDate(suggestion.preferredDate)}`;
    offer.addEventListener("click", () => offerFreedSlot(item, suggestion));
    const reason = document.createElement("span");
    reason.className = "text-sm text-slate-500";
    reason.textContent = suggestion.reason;
    wrapper.append(offer, reason);
    actions.append(wrapper);
  });
  tr.append(
    cell(appointmentLabel(item)),
    cell(capitalizeWords(`${item.firstName} ${item.lastName}`)),
    cell(item.providerName || EMPTY_TEXT),
    cell(SERVICE_LABELS[item.serviceType] || item.serviceType),
    cell(ESTADO_LABELS[item.estadoCita] ?? item.estadoCita),
    actions
  );
  return tr;
}

async function suggestRecipients(item) {
  freedStatus.textContent = "Consultando al asistente...";
  const response = await fetch(`/api/staff/freed-slots/${encodeURIComponent(item.id)}/ai-recipients`, { method: "POST" });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    freedStatus.textContent = errorText(detail.detail, "No se pudieron obtener sugerencias.");
    return;
  }
  const suggestions = await response.json();
  freedSuggestions.set(item.id, suggestions);
  await loadFreedSlots();
  freedStatus.textContent = suggestions.length
    ? "Sugerencias del asistente. Usted confirma cada oferta."
    : "El asistente no encontró destinatarios adecuados.";
}

async function offerFreedSlot(item, suggestion) {
  const when = item.appointmentAt.replace("T", " ");
  const name = capitalizeWords(`${suggestion.firstName} ${suggestion.lastName}`);
  if (!window.confirm(`¿Ofrecer el horario ${when} con ${item.providerName} a ${name}?`)) return;
  const response = await fetch(`/api/staff/applications/${encodeURIComponent(suggestion.id)}/offer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ providerId: item.providerId, appointmentAt: item.appointmentAt })
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    freedStatus.textContent = errorText(detail.detail, "No se pudo ofrecer el horario.");
    await loadFreedSlots();
    return;
  }
  freedSuggestions.delete(item.id);
  await loadFreedSlots();
  freedStatus.textContent = `Horario ${when} ofrecido a ${name}. La solicitud pasa a coordinado.`;
  await loadApplications();
}

async function confirmOffer(slot) {
  const when = slot.appointmentAt.replace("T", " ");
  if (!window.confirm(`¿Ofrecer el horario ${when} con ${slot.providerName}?`)) return;
  const response = await fetch(`/api/staff/applications/${encodeURIComponent(offerApplication.id)}/offer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ providerId: slot.providerId, appointmentAt: slot.appointmentAt })
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    await searchOffers();
    offerStatus.textContent = errorText(detail.detail, "No se pudo ofrecer el horario.");
    return;
  }
  offerApplication = null;
  offerSlots.replaceChildren();
  offerStatus.textContent = `Horario ${when} asignado. La solicitud pasa a coordinado.`;
  await loadApplications();
}

function updateExportLink() {
  const date = document.getElementById("filterDate").value;
  exportCsv.href = `/api/staff/agenda/export.csv${date ? `?${new URLSearchParams({ date })}` : ""}`;
}

document.getElementById("filterDate").addEventListener("change", updateExportLink);
offerDate.addEventListener("change", searchOffers);
updateExportLink();
loadProviders();

setInterval(loadApplications, 10000);
setInterval(loadFreedSlots, 10000);
loadFreedSlots();

window.addEventListener("hashchange", showSection);
showSection();
loadSession();
loadApplications();
const analysisStatus = document.getElementById("analysisStatus");
const csvForm = document.getElementById("csvForm");
const csvFile = document.getElementById("csvFile");
const csvStatus = document.getElementById("csvStatus");

const formatCount = (value) => (value ?? 0).toLocaleString("es");

function renderBars(container, rows, total) {
  const items = rows.map(({ label, value }) => {
    const row = document.createElement("div");
    row.className = "mb-2 grid grid-cols-[8rem_1fr_3rem] items-center gap-3 sm:grid-cols-[10rem_1fr_3rem]";
    const name = document.createElement("span");
    name.className = "truncate text-sm";
    name.textContent = label;
    const track = document.createElement("div");
    track.className = "h-2.5 overflow-hidden rounded-full bg-navy/10";
    const bar = document.createElement("div");
    bar.className = "h-full rounded-full bg-teal transition-all duration-200";
    bar.style.width = `${total ? (value / total) * 100 : 0}%`;
    track.append(bar);
    const amount = document.createElement("strong");
    amount.className = "text-right text-sm";
    amount.textContent = formatCount(value);
    row.append(name, track, amount);
    return row;
  });
  container.replaceChildren(...items);
}

function renderAgendaAnalysis(result) {
  const byState = result.agenda_by_state ?? {};
  const total = result.agenda_total ?? 0;
  const pending = (byState.reservada ?? 0) + (byState.coordinado ?? 0);
  document.getElementById("agendaTotal").textContent = formatCount(total);
  document.getElementById("agendaPending").textContent = formatCount(pending);
  document.getElementById("agendaDone").textContent = formatCount(byState.cumplido);
  const mean = result.satisfaction_mean;
  document.getElementById("kpiMean").textContent = mean == null ? "N/D" : mean.toFixed(2);
  const rows = Object.entries(byState).map(([state, value]) => ({ label: ESTADO_LABELS[state] ?? state, value }));
  renderBars(document.getElementById("analysisStates"), rows, total);
  renderStateDonut(byState);
}

const DONUT_STATES = ["cumplido", "no concurrencia", "cancelado", "cancelacion tardia"];

function renderStateDonut(byState) {
  const parts = DONUT_STATES.map((state, i) => ({ label: ESTADO_LABELS[state], value: byState[state] ?? 0, color: CHART_PALETTE[i] }));
  donutChart(document.getElementById("agendaStateDonut"), parts, parts.reduce((sum, p) => sum + p.value, 0));
  chartLegend(document.getElementById("agendaStateLegend"), parts.map(({ label, value, color }) => ({ label: `${label}: ${formatCount(value)}`, color })));
}

function renderCsv(result) {
  document.getElementById("csvTotal").textContent = formatCount(result.total);
  document.getElementById("csvValid").textContent = formatCount(result.valid);
  document.getElementById("csvInvalid").textContent = formatCount(result.invalid);
  const mean = result.satisfaction_mean;
  document.getElementById("csvMean").textContent = mean == null ? "N/D" : mean.toFixed(2);
}

async function loadAnalysis() {
  try {
    const response = await fetch("/api/staff/analysis");
    if (response.status === 401) return redirectIfSessionLost();
    if (!response.ok) throw new Error(`Error HTTP ${response.status}.`);
    const result = await response.json();
    renderAgendaAnalysis(result);
    analysisStatus.textContent = `${formatCount(result.agenda_total)} cita(s) en agenda. Se actualiza automáticamente.`;
  } catch (error) {
    analysisStatus.textContent = `No se pudo cargar el análisis: ${error.message}`;
  }
}

csvForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = csvFile.files[0];
  if (!file) {
    csvStatus.textContent = "Selecciona un archivo CSV.";
    return;
  }
  const body = new FormData();
  body.append("file", file);
  csvStatus.textContent = "Analizando archivo...";
  try {
    const response = await fetch("/api/incidents/analyze", { method: "POST", body });
    if (response.status === 401) return location.replace("/staff/login");
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof result.detail === "string" ? result.detail : `Error HTTP ${response.status}.`);
    renderCsv(result);
    await loadCsvCharts(result);
    csvStatus.textContent = `Archivo "${file.name}" analizado.`;
  } catch (error) {
    csvStatus.textContent = `No se pudo analizar el archivo: ${error.message}`;
  }
});

const CHART_NS = "http://www.w3.org/2000/svg";
const CHART_PALETTE = ["#00a7a0", "#0b1f3a", "#f59e0b", "#6d5ce7", "#ef4444", "#94a3b8"];

function chartEl(tag, attrs = {}, text) {
  const node = document.createElementNS(CHART_NS, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  if (text != null) node.textContent = text;
  return node;
}

function chartLegend(list, items) {
  list.replaceChildren(...items.map(({ label, color }) => {
    const li = document.createElement("li");
    const swatch = document.createElement("span");
    swatch.className = "chart-swatch";
    swatch.style.background = color;
    li.append(swatch, label);
    return li;
  }));
}

function donutChart(svg, parts, total) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const group = chartEl("g", { transform: "rotate(-90 100 100)" });
  let offset = 0;
  for (const { value, color } of parts) {
    if (!total || value <= 0) continue;
    const length = (value / total) * circumference;
    group.append(chartEl("circle", {
      cx: 100, cy: 100, r: radius, class: "chart-donut-segment", stroke: color,
      "stroke-dasharray": `${length} ${circumference - length}`, "stroke-dashoffset": -offset
    }));
    offset += length;
  }
  svg.replaceChildren(
    chartEl("circle", { cx: 100, cy: 100, r: radius, class: "chart-donut-track" }),
    group,
    chartEl("text", { x: 100, y: 108, class: "chart-value" }, formatCount(total))
  );
}

function gaugeChart(svg, fraction, text) {
  const clamped = Math.min(Math.max(fraction, 0), 1);
  const arc = "M 20 110 A 80 80 0 0 1 180 110";
  svg.replaceChildren(
    chartEl("path", { d: arc, class: "chart-track", pathLength: 1 }),
    chartEl("path", { d: arc, class: "chart-fill", pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1 - clamped }),
    chartEl("text", { x: 100, y: 100, class: "chart-value" }, text)
  );
}

function stackedLocationChart(container, rows, stateColor) {
  const counts = {};
  for (const { location, state } of rows) {
    counts[location] ??= {};
    counts[location][state] = (counts[location][state] ?? 0) + 1;
  }
  const locations = Object.keys(counts).sort();
  const totals = locations.map((loc) => Object.values(counts[loc]).reduce((sum, n) => sum + n, 0));
  const maxTotal = Math.max(...totals, 1);
  const columns = locations.map((loc, i) => {
    const col = document.createElement("div");
    col.className = "chart-col";
    const track = document.createElement("div");
    track.className = "chart-stack-track";
    for (const state of stateColor.keys()) {
      const value = counts[loc][state];
      if (!value) continue;
      const segment = document.createElement("div");
      segment.className = "chart-segment";
      segment.style.height = `${(value / maxTotal) * 100}%`;
      segment.style.background = stateColor.get(state);
      segment.title = `${ESTADO_LABELS[state] ?? state}: ${value}`;
      segment.textContent = value / maxTotal >= 0.08 ? formatCount(value) : "";
      track.append(segment);
    }
    const label = document.createElement("span");
    label.className = "chart-stack-label";
    label.textContent = `${loc} (${formatCount(totals[i])})`;
    col.append(track, label);
    return col;
  });
  container.replaceChildren(...columns);
}

function trendChart(svg, empty, rows) {
  const byDate = {};
  for (const { date, score } of rows) {
    if (typeof score !== "number") continue;
    byDate[date] ??= { sum: 0, count: 0 };
    byDate[date].sum += score;
    byDate[date].count += 1;
  }
  const points = Object.keys(byDate).sort().map((date) => ({ date, mean: byDate[date].sum / byDate[date].count }));
  svg.classList.toggle("hidden", points.length === 0);
  empty.classList.toggle("hidden", points.length > 0);
  if (!points.length) return;

  const left = 50;
  const right = 580;
  const y = (score) => 200 - (score / 10) * 180;
  const x = (i) => (points.length === 1 ? 315 : left + (i * (right - left)) / (points.length - 1));
  const nodes = [0, 5, 10].flatMap((v) => [
    chartEl("line", { x1: left, x2: right, y1: y(v), y2: y(v), class: "chart-grid-line" }),
    chartEl("text", { x: 30, y: y(v) + 4, class: "chart-label" }, String(v))
  ]);
  const path = points.map((p, i) => `${i ? "L" : "M"} ${x(i)} ${y(p.mean)}`).join(" ");
  nodes.push(chartEl("path", { d: path, class: "chart-line" }));
  points.forEach((p, i) => {
    nodes.push(chartEl("circle", { cx: x(i), cy: y(p.mean), r: 4, class: "chart-dot" }));
    nodes.push(chartEl("text", { x: x(i), y: y(p.mean) - 10, class: "chart-label" }, p.mean.toFixed(2)));
    if (points.length <= 10 || i === 0 || i === points.length - 1) {
      nodes.push(chartEl("text", { x: x(i), y: 226, class: "chart-label" }, p.date));
    }
  });
  svg.replaceChildren(...nodes);
}

function renderCsvCharts(rows, result) {
  const agendaStates = Object.keys(ESTADO_LABELS);
  const stateColor = new Map(agendaStates.map((state, i) => [state, CHART_PALETTE[i]]));
  const legendItems = agendaStates.map((state) => ({ label: ESTADO_LABELS[state], color: stateColor.get(state) }));

  const scores = rows.map((r) => r.score).filter((n) => typeof n === "number");
  const mean = result?.satisfaction_mean ?? (scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null);
  gaugeChart(document.getElementById("csvMeanGauge"), mean == null ? 0 : mean / 10, mean == null ? "N/D" : `${mean.toFixed(2)} / 10`);

  stackedLocationChart(document.getElementById("csvLocationChart"), rows, stateColor);
  chartLegend(document.getElementById("csvLocationLegend"), legendItems);

  trendChart(document.getElementById("csvTrend"), document.getElementById("csvTrendEmpty"), rows);
}

async function loadCsvCharts(result = null) {
  const charts = document.getElementById("csvCharts");
  try {
    const response = await fetch("/api/incidents/results/rows");
    if (!response.ok) return charts.classList.add("hidden");
    const { rows = [] } = await response.json();
    if (!rows.length) return charts.classList.add("hidden");
    charts.classList.remove("hidden");
    renderCsvCharts(rows, result);
  } catch {
    charts.classList.add("hidden");
  }
}

loadAnalysis();
setInterval(loadAnalysis, 10000);
loadCsvCharts();

const billingRows = document.getElementById("billingRows");
const billingStatus = document.getElementById("billingStatus");

const billingFilterPayment = document.getElementById("filterPayment");
let billingData = [];
let billingActionError = "";

function paymentStatusOf(item) {
  return item.paidAt ? "abonado" : "pendiente";
}

async function loadBilling() {
  const response = await fetch("/api/staff/billing/services");
  if (response.status === 401) return redirectIfSessionLost();
  if (!response.ok) {
    billingStatus.textContent = "No se pudo cargar la facturación.";
    return;
  }
  billingData = await response.json();
  renderBilling();
}

function renderBilling() {
  const filter = billingFilterPayment.value;
  const country = document.getElementById("filterBillingCountry").value;
  const region = document.getElementById("filterBillingRegion").value;
  const search = document.getElementById("filterBillingSearch").value.trim().toLowerCase();
  const items = billingData.filter((item) => {
    if (filter && paymentStatusOf(item) !== filter) return false;
    if (country && item.country !== country) return false;
    if (region && item.clinicRegion !== region) return false;
    if (search && !`${item.firstName} ${item.lastName} ${item.identityDocument}`.toLowerCase().includes(search)) return false;
    return true;
  });
  billingRows.replaceChildren(...items.map(renderBillingRow));
  const summary = `${items.length} servicio(s) facturable(s). Se actualiza automáticamente.`;
  billingStatus.textContent = billingActionError ? `${billingActionError} ${summary}` : summary;
}

async function billingAction(item, path) {
  const response = await fetch(`/api/staff/billing/${encodeURIComponent(item.id)}/${path}`, { method: "POST" });
  if (response.ok) {
    billingActionError = "";
  } else {
    const detail = await response.json().catch(() => ({}));
    billingActionError = detail.detail || "No se pudo actualizar la facturación.";
  }
  await loadBilling();
}

function billingActionCell(item) {
  const td = document.createElement("td");
  const invoice = document.createElement("button");
  invoice.type = "button";
  invoice.className = "chip";
  invoice.textContent = "Enviar factura";
  invoice.addEventListener("click", () => billingAction(item, "invoice"));
  const paid = document.createElement("button");
  paid.type = "button";
  paid.className = "chip";
  paid.textContent = item.paidAt ? "Desmarcar abonado" : "Marcar abonado";
  paid.disabled = !item.billedAt && !item.paidAt;
  paid.addEventListener("click", () => billingAction(item, item.paidAt ? "unpaid" : "paid"));
  td.className = "border-b border-navy/10 px-3 py-2.5 align-middle whitespace-nowrap";
  td.append(invoice, " ", paid);
  return td;
}

function renderBillingRow(item) {
  const tr = document.createElement("tr");
  tr.append(
    cell(appointmentLabel(item)),
    cell(ESTADO_LABELS[item.estadoCita]),
    cell(`${item.firstName} ${item.lastName}`),
    cell(item.identityDocument),
    cell(REGION_LABELS[item.clinicRegion] || item.clinicRegion),
    cell(SERVICE_LABELS[item.serviceType] || item.serviceType),
    cell(item.amountDue.toFixed(2)),
    billingActionCell(item)
  );
  return tr;
}

billingFilterPayment.addEventListener("change", renderBilling);
document.getElementById("filterBillingCountry").addEventListener("change", () => {
  syncRegionOptions("filterBillingCountry", "filterBillingRegion");
  renderBilling();
});
document.getElementById("filterBillingRegion").addEventListener("change", renderBilling);
document.getElementById("filterBillingSearch").addEventListener("input", renderBilling);
syncRegionOptions("filterBillingCountry", "filterBillingRegion");
loadBilling();
setInterval(loadBilling, 10000);

