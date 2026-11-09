"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCandidates } from "../../services/candidates";
import { stageLabels, statusLabels, type Candidate } from "../../types/candidate";

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "success"; candidates: Candidate[] };

export function CandidateListSkeleton() {
  return (
    <div role="status" aria-label="Cargando candidaturas" className="space-y-3 py-6">
      <p className="text-sm text-slate-600">Cargando candidaturas...</p>
      {[1, 2, 3, 4].map((row) => (
        <div key={row} className="h-16 animate-pulse rounded bg-slate-200" />
      ))}
    </div>
  );
}

export default function CandidateList() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setState({ kind: "loading" });
      try {
        const candidates = await getCandidates(controller.signal);
        if (!controller.signal.aborted) setState({ kind: "success", candidates });
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({ kind: "error", message: error instanceof Error ? error.message : "Error desconocido." });
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const stage = searchParams.get("stage") ?? "";

  function updateFilter(name: string, value: string) {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(name, value);
    else params.delete(name);
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filtered = state.kind === "success" ? state.candidates.filter((candidate) => {
    const matchesText = `${candidate.full_name} ${candidate.email}`.toLocaleLowerCase().includes(normalizedSearch);
    return matchesText && (!status || candidate.status === status) &&
      (!stage || (candidate.status !== "discarded" && candidate.stage === stage));
  }) : [];

  return (
    <section className="py-8" aria-labelledby="candidates-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-teal-700">People & Talent</p>
          <h1 id="candidates-title" className="mt-1 text-2xl font-semibold text-slate-900">Candidaturas</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {state.kind === "success" && <p className="text-sm text-slate-600" role="status">{filtered.length} de {state.candidates.length} candidaturas</p>}
          <Link href="/candidates/new" className="rounded bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900">Nueva candidatura</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          <span>Buscar por nombre o correo</span>
          <input type="search" value={search} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Nombre o correo" className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" />
        </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          <span>Estado</span>
          <select value={status} onChange={(event) => updateFilter("status", event.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100">
            <option value="">Todos los estados</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          <span>Etapa</span>
          <select value={stage} onChange={(event) => updateFilter("stage", event.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100">
            <option value="">Todas las etapas</option>
            {Object.entries(stageLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>

      {state.kind === "loading" && <CandidateListSkeleton />}
      {state.kind === "error" && (
        <div role="alert" className="mt-6 border-l-4 border-red-600 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-semibold">No se pudieron cargar las candidaturas.</p>
          <p className="mt-1">{state.message}</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-3 rounded border border-red-700 px-3 py-1.5 font-semibold hover:bg-red-100">Reintentar</button>
        </div>
      )}
      {state.kind === "success" && (filtered.length === 0 ? (
        <p className="py-10 text-sm text-slate-600">No hay candidaturas que coincidan con los filtros.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[20%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr><th scope="col" className="py-4 pr-4 font-semibold">Candidato/a</th><th scope="col" className="py-4 pr-4 font-semibold">Puesto</th><th scope="col" className="py-4 pr-4 font-semibold">Estado</th><th scope="col" className="py-4 pr-4 font-semibold">Etapa</th><th scope="col" className="py-4 font-semibold">Acciones</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((candidate) => (
                <tr key={candidate.id}>
                  <td className="break-words py-4 pr-4"><Link href={`/candidates/${encodeURIComponent(candidate.id)}`} className="font-semibold text-teal-800 underline-offset-4 hover:underline">{candidate.full_name}</Link><div className="mt-1 break-all text-slate-500">{candidate.email}</div></td>
                  <td className="break-words py-4 pr-4 text-slate-700">{candidate.position}</td>
                  <td className="py-4 pr-4 text-slate-700">{statusLabels[candidate.status] ?? candidate.status}</td>
                  <td className="py-4 pr-4 text-slate-700">{candidate.status === "discarded" ? "Sin etapa" : (stageLabels[candidate.stage] ?? candidate.stage)}</td>
                  <td className="py-4"><Link href={`/candidates/${encodeURIComponent(candidate.id)}`} aria-label={`Gestionar candidatura de ${candidate.full_name}`} className="inline-block rounded border border-teal-800 px-3 py-1.5 font-semibold text-teal-800 hover:bg-teal-50">Gestionar</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}