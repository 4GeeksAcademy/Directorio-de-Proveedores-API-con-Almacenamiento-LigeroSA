"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CandidateSaveError, getCandidate, saveCandidate, updateCandidateProgress } from "../../services/candidates";
import { stageLabels, statusLabels, type Candidate, type CandidateInput, type CandidateStage, type CandidateStatus } from "../../types/candidate";

type Fields = {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string;
  cv_url: string;
  experience_years: string;
};

const emptyFields: Fields = { full_name: "", email: "", phone: "", position: "", linkedin_url: "", cv_url: "", experience_years: "" };
const positions = ["Administrativo", "Recepcionista", "Enfermero", "Médico", "Auxiliar de servicio"];
const progressStages: CandidateStage[] = ["review", "personal_interview", "technical_interview"];
const inputClass = "mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100";

function validUrl(value: string): boolean {
  if (!value) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export default function CandidateForm({ candidateId }: { candidateId?: string }) {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [status, setStatus] = useState<CandidateStatus>("received");
  const [stage, setStage] = useState<CandidateStage | "">("pending");
  const [loading, setLoading] = useState(Boolean(candidateId));
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedCandidate, setSavedCandidate] = useState<Candidate | null>(null);
  const [creationUncertain, setCreationUncertain] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields | "stage", string>>>({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!candidateId) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const candidate = await getCandidate(candidateId!, controller.signal);
        if (controller.signal.aborted) return;
        setFields({ full_name: candidate.full_name, email: candidate.email, phone: candidate.phone, position: candidate.position, linkedin_url: candidate.linkedin_url ?? "", cv_url: candidate.cv_url ?? "", experience_years: String(candidate.experience_years) });
        setStatus(candidate.status);
        setStage(candidate.stage);
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "Error desconocido.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [candidateId, attempt]);

  function updateField(name: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function changeStatus(value: CandidateStatus) {
    setStatus(value);
    if (value === "received") setStage("pending");
    else if (value === "selected") setStage("offer_presented");
    else if (value === "in_progress") setStage("");
    setErrors((current) => ({ ...current, stage: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || creationUncertain) return;
    const nextErrors: Partial<Record<keyof Fields | "stage", string>> = {};
    if (!fields.full_name.trim()) nextErrors.full_name = "Introduce el nombre completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) nextErrors.email = "Introduce un correo válido.";
    if (!fields.phone.trim()) nextErrors.phone = "Introduce el teléfono.";
    if (!fields.position.trim()) nextErrors.position = "Selecciona un puesto.";
    if (!fields.experience_years.trim() || !Number.isFinite(Number(fields.experience_years)) || Number(fields.experience_years) <= 0) nextErrors.experience_years = "Introduce un número positivo.";
    if (!validUrl(fields.linkedin_url.trim())) nextErrors.linkedin_url = "Introduce una URL válida con http o https.";
    if (!validUrl(fields.cv_url.trim())) nextErrors.cv_url = "Introduce una URL válida con http o https.";
    if (status !== "discarded" && (!stage || (status === "in_progress" && !progressStages.includes(stage)))) nextErrors.stage = "Selecciona una etapa.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const input: CandidateInput = {
      full_name: fields.full_name.trim(), email: fields.email.trim(), phone: fields.phone.trim(), position: fields.position.trim(),
      linkedin_url: fields.linkedin_url.trim() || null, cv_url: fields.cv_url.trim() || null, experience_years: Number(fields.experience_years),
    };
    setSaving(true);
    setSubmitError("");
    let saved = savedCandidate;
    try {
      saved = saved ?? await saveCandidate(input, candidateId);
      if (!savedCandidate) setSavedCandidate(saved);
      if (saved.status !== status || (status !== "discarded" && saved.stage !== stage)) {
        if (status === "discarded") await updateCandidateProgress(saved.id, { status });
        else if (stage) await updateCandidateProgress(saved.id, { status, stage });
      }
      router.push(`/candidates/${encodeURIComponent(saved.id)}?result=${candidateId ? "updated" : "created"}`);
    } catch (error) {
      const definitelyRejected = error instanceof CandidateSaveError && error.status >= 400 && error.status < 500 && error.status !== 408;
      if (!candidateId && !saved && !definitelyRejected) {
        setCreationUncertain(true);
        setSubmitError("No se pudo confirmar si la candidatura se creó. Revisa el listado antes de volver a intentarlo para evitar duplicados.");
      } else {
        setSubmitError(`No se pudo completar el envío. ${error instanceof Error ? error.message : "Error desconocido."}`);
      }
    } finally {
      setSaving(false);
    }
  }

  const controls: { name: keyof Fields; label: string; type?: string; required?: boolean }[] = [
    { name: "full_name", label: "Nombre completo", required: true },
    { name: "email", label: "Correo electrónico", type: "email", required: true },
    { name: "phone", label: "Teléfono", type: "tel", required: true },
    { name: "experience_years", label: "Años de experiencia", type: "number", required: true },
    { name: "linkedin_url", label: "LinkedIn", type: "url" },
    { name: "cv_url", label: "Enlace al currículum", type: "url" },
  ];

  return <main className="mx-auto min-h-screen max-w-4xl px-6 py-10 sm:px-10">
    <header className="border-b border-slate-200 pb-6"><p className="text-lg font-semibold text-teal-700">HealthCore</p><Link href={candidateId ? `/candidates/${encodeURIComponent(candidateId)}` : "/"} className="mt-3 inline-block text-sm font-medium text-teal-800 underline-offset-4 hover:underline">Volver</Link></header>
    <h1 className="mt-8 text-2xl font-semibold">{candidateId ? "Editar candidatura" : "Nueva candidatura"}</h1>
    {loading && <div role="status" className="space-y-3 py-6"><p>Cargando candidatura...</p>{[1, 2, 3].map((row) => <div key={row} className="h-12 animate-pulse rounded bg-slate-200" />)}</div>}
    {loadError && <div role="alert" className="mt-5 bg-red-50 p-4 text-sm text-red-900"><p>No se pudo cargar la candidatura. {loadError}</p><button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-3 rounded border border-red-700 px-3 py-1.5">Reintentar</button></div>}
    {!loading && !loadError && <form noValidate onSubmit={handleSubmit} className="mt-6">
      {submitError && <div role="alert" className="mb-5 bg-red-50 p-4 text-sm text-red-900"><p>{submitError}</p>{savedCandidate && <p className="mt-2">Los datos ya se guardaron. Puedes reintentar el cambio de estado o <Link href={`/candidates/${encodeURIComponent(savedCandidate.id)}`} className="underline">abrir la candidatura</Link>.</p>}{creationUncertain && <div className="mt-3 flex flex-wrap gap-4"><Link href={`/?search=${encodeURIComponent(fields.email.trim())}`} className="font-semibold underline">Buscar candidatura por correo</Link><button type="button" onClick={() => { setCreationUncertain(false); setSubmitError(""); }} className="font-semibold underline">Ya revisé el listado, permitir otro intento</button></div>}</div>}
      <fieldset disabled={saving || Boolean(savedCandidate) || creationUncertain} className="grid gap-5 sm:grid-cols-2">
        {controls.map(({ name, label, type, required }) => <label key={name} className="text-sm font-medium text-slate-700">{label}{required && " *"}<input type={type ?? "text"} value={fields[name]} onChange={(event) => updateField(name, event.target.value)} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} required={required} min={type === "number" ? "0.01" : undefined} step={type === "number" ? "any" : undefined} className={inputClass} />{errors[name] && <span id={`${name}-error`} className="mt-1 block text-sm text-red-700">{errors[name]}</span>}</label>)}
        <label className="text-sm font-medium text-slate-700">Puesto *<select value={fields.position} onChange={(event) => updateField("position", event.target.value)} required aria-invalid={Boolean(errors.position)} aria-describedby={errors.position ? "position-error" : undefined} className={inputClass}><option value="">Selecciona un puesto</option>{fields.position && !positions.includes(fields.position) && <option value={fields.position}>{fields.position}</option>}{positions.map((position) => <option key={position} value={position}>{position}</option>)}</select>{errors.position && <span id="position-error" className="mt-1 block text-sm text-red-700">{errors.position}</span>}</label>
      </fieldset>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Estado *<select value={status} onChange={(event) => changeStatus(event.target.value as CandidateStatus)} disabled={saving || creationUncertain} className={inputClass}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        {status !== "discarded" && <label className="text-sm font-medium text-slate-700">Etapa *<select value={stage} onChange={(event) => setStage(event.target.value as CandidateStage)} disabled={saving || creationUncertain || status !== "in_progress"} aria-invalid={Boolean(errors.stage)} aria-describedby={errors.stage ? "stage-error" : undefined} className={inputClass}><option value="" disabled>Selecciona una etapa</option>{(status === "in_progress" ? progressStages : status === "received" ? ["pending" as const] : ["offer_presented" as const]).map((value) => <option key={value} value={value}>{stageLabels[value]}</option>)}</select>{errors.stage && <span id="stage-error" className="mt-1 block text-sm text-red-700">{errors.stage}</span>}</label>}
      </div>
      <button type="submit" disabled={saving || creationUncertain} className="mt-6 rounded bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60">{saving ? "Guardando..." : savedCandidate ? "Reintentar actualización" : "Guardar candidatura"}</button>
    </form>}
  </main>;
}