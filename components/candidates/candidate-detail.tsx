"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { getCandidate, updateCandidateProgress } from "../../services/candidates";
import { stageLabels, statusLabels, type Candidate, type CandidateStage, type CandidateStatus } from "../../types/candidate";
import NotesSection from "../notes/notes-section";

type DetailState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "success"; candidate: Candidate };

const inProgressStages: CandidateStage[] = ["review", "personal_interview", "technical_interview"];

function safeLink(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

export default function CandidateDetail({ id }: { id: string }) {
  const [state, setState] = useState<DetailState>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<CandidateStatus | "">("");
  const [stage, setStage] = useState<CandidateStage | "">("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setState({ kind: "loading" });
      try {
        const candidate = await getCandidate(id, controller.signal);
        if (!controller.signal.aborted) {
          setState({ kind: "success", candidate });
          setStatus(candidate.status);
          setStage(candidate.stage);
        }
      } catch (error) {
        if (!controller.signal.aborted) setState({ kind: "error", message: error instanceof Error ? error.message : "Error desconocido." });
      }
    }
    void load();
    return () => controller.abort();
  }, [id, attempt]);

  useEffect(() => {
    if (state.kind !== "success" || message?.kind !== "success") return;
    const timer = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [message, state.kind]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const result = url.searchParams.get("result");
    if (result === "created" || result === "updated") {
      setMessage({ kind: "success", text: result === "created" ? "Candidatura creada correctamente." : "Candidatura actualizada correctamente." });
      url.searchParams.delete("result");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  function changeStatus(value: CandidateStatus) {
    setStatus(value);
    if (value === "received") setStage("pending");
    else if (value === "selected") setStage("offer_presented");
    else if (value === "in_progress") setStage("");
  }

  async function saveProgress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind !== "success" || saving) return;
    if (!status || (status === "in_progress" && (!stage || !inProgressStages.includes(stage)))) {
      setMessage({ kind: "error", text: "Selecciona una etapa para la candidatura en proceso." });
      return;
    }
    const previous = state.candidate;
    const nextStage = status === "discarded" ? previous.stage : stage;
    if (!nextStage) {
      setMessage({ kind: "error", text: "Selecciona una etapa para la candidatura." });
      return;
    }
    setState({ kind: "success", candidate: { ...previous, status, stage: nextStage } });
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateCandidateProgress(id, status === "discarded" ? { status } : { status, stage: nextStage });
      setState({ kind: "success", candidate: updated });
      setStatus(updated.status);
      setStage(updated.stage);
      setMessage({ kind: "success", text: "Candidatura actualizada correctamente." });
    } catch (error) {
      try {
        const current = await getCandidate(id);
        setState({ kind: "success", candidate: current });
        setStatus(current.status);
        setStage(current.stage);
        setMessage({ kind: "error", text: `No se pudo confirmar el cambio. Se muestran los datos actuales. ${error instanceof Error ? error.message : "Error desconocido."}` });
      } catch {
        setMessage(null);
        setState({ kind: "error", message: "No se pudo confirmar el cambio ni consultar la candidatura. Reintenta para comprobar su estado." });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 sm:px-10">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-lg font-semibold text-teal-700">HealthCore</p>
        <Link href="/" className="mt-3 inline-block text-sm font-medium text-teal-800 underline-offset-4 hover:underline">← Volver a candidaturas</Link>
      </header>
      {state.kind === "loading" && <div role="status" className="space-y-3 py-8"><p>Cargando candidatura...</p>{[1, 2, 3].map((row) => <div key={row} className="h-16 animate-pulse rounded bg-slate-200" />)}</div>}
      {state.kind === "error" && <div role="alert" className="mt-8 border-l-4 border-red-600 bg-red-50 p-4 text-red-900"><p className="font-semibold">No se pudo cargar la candidatura.</p><p className="mt-1 text-sm">{state.message}</p><button onClick={() => setAttempt((value) => value + 1)} className="mt-3 rounded border border-red-700 px-3 py-1.5 text-sm font-semibold">Reintentar</button></div>}
      {state.kind === "success" && (() => {
        const candidate = state.candidate;
        const linkedin = safeLink(candidate.linkedin_url);
        const cv = safeLink(candidate.cv_url);
        const appliedDate = new Date(candidate.applied_at);
        const fields = [
          ["Correo electrónico", candidate.email],
          ["Teléfono", candidate.phone || "No indicado"],
          ["Puesto", candidate.position],
          ["Experiencia", `${candidate.experience_years} años`],
          ["Fecha de aplicación", Number.isNaN(appliedDate.getTime()) ? candidate.applied_at : new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(appliedDate)],
        ];
        return <div className="py-8">
          <p className="text-xs font-semibold uppercase text-teal-700">People & Talent</p>
          <h1 className="mt-1 break-words text-2xl font-semibold text-slate-900">{candidate.full_name}</h1>
          <p className="mt-2 text-sm text-slate-600">{statusLabels[candidate.status] ?? candidate.status} · {candidate.status === "discarded" ? "Sin etapa" : (stageLabels[candidate.stage] ?? candidate.stage)}</p>
          <Link href={`/candidates/${encodeURIComponent(id)}/edit`} className="mt-4 inline-block rounded border border-teal-800 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50">Editar candidatura</Link>
          <section aria-labelledby="details-title" className="mt-8 border-t border-slate-200 pt-6">
            <h2 id="details-title" className="text-lg font-semibold">Datos de la candidatura</h2>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              {fields.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm text-slate-900">{value}</dd></div>)}
              <div><dt className="text-sm text-slate-500">LinkedIn</dt><dd className="mt-1 break-all text-sm">{linkedin ? <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-teal-800 underline">Abrir perfil</a> : "No disponible"}</dd></div>
              <div><dt className="text-sm text-slate-500">Currículum</dt><dd className="mt-1 break-all text-sm">{cv ? <a href={cv} target="_blank" rel="noopener noreferrer" className="text-teal-800 underline">Abrir currículum</a> : "No disponible"}</dd></div>
            </dl>
          </section>
          <section aria-labelledby="progress-title" className="mt-8 border-t border-slate-200 pt-6">
            <h2 id="progress-title" className="text-lg font-semibold">Estado y etapa</h2>
            {message && <p role={message.kind === "error" ? "alert" : "status"} className={`mt-4 rounded p-3 text-sm ${message.kind === "error" ? "bg-red-50 text-red-900" : "bg-emerald-50 text-emerald-900"}`}>{message.text}</p>}
            <form onSubmit={saveProgress} className="mt-4 flex flex-wrap items-end gap-4">
              <label className="grid min-w-48 gap-1 text-sm font-medium">Estado<select value={status} onChange={(event) => changeStatus(event.target.value as CandidateStatus)} disabled={saving} className="rounded border border-slate-300 bg-white px-3 py-2"><option value="" disabled>Selecciona un estado</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              {status !== "discarded" && <label className="grid min-w-48 gap-1 text-sm font-medium">Etapa<select value={stage} onChange={(event) => setStage(event.target.value as CandidateStage)} disabled={saving || status !== "in_progress"} required className="rounded border border-slate-300 bg-white px-3 py-2"><option value="" disabled>Selecciona una etapa</option>{(status === "in_progress" ? inProgressStages : status === "received" ? ["pending" as const] : status === "selected" ? ["offer_presented" as const] : []).map((value) => <option key={value} value={value}>{stageLabels[value]}</option>)}</select></label>}
              <button type="submit" disabled={saving} className="rounded bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60">{saving ? "Guardando..." : "Guardar cambios"}</button>
            </form>
          </section>
          <NotesSection candidateId={id} />
        </div>;
      })()}
    </main>
  );
}