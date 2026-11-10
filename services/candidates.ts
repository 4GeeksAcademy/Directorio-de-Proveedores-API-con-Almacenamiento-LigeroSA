import type { Candidate, CandidateInput, CandidateRecord, CandidateStage, CandidateStatus, RecordsResponse } from "../types/candidate";
import { apiFetch } from "./api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class CandidateSaveError extends Error {
  constructor(public readonly status: number) {
    super(`La API respondió con el código ${status}.`);
    this.name = "CandidateSaveError";
  }
}

export function apiUrl(path: string): string {
  if (!API_URL) throw new Error("No está configurada la URL de la API.");
  return `${API_URL.replace(/\/$/, "")}${path}`;
}

export async function getCandidates(signal?: AbortSignal): Promise<CandidateRecord[]> {
  const candidates: CandidateRecord[] = [];
  let page = 1;
  let total = 0;

  do {
    const response = await apiFetch(apiUrl(`/records?page=${page}&limit=100`), { signal });
    if (!response.ok) {
      throw new Error(`La API respondió con el código ${response.status}.`);
    }

    const result: RecordsResponse = await response.json();
    if (!Array.isArray(result.data) || !Number.isInteger(result.total) || result.total < 0) {
      throw new Error("La API devolvió una respuesta inesperada.");
    }
    if (result.data.length === 0 && candidates.length < result.total) {
      throw new Error("No se pudieron recuperar todas las candidaturas.");
    }

    candidates.push(...result.data);
    total = result.total;
    page += 1;
  } while (candidates.length < total);

  return candidates;
}

export async function getCandidate(id: string, signal?: AbortSignal): Promise<Candidate> {
  const response = await apiFetch(apiUrl(`/records/${encodeURIComponent(id)}`), { signal });
  if (!response.ok) throw new Error(`La API respondió con el código ${response.status}.`);
  return await response.json();
}

export async function updateCandidateProgress(
  id: string,
  progress: { status: CandidateStatus; stage?: CandidateStage },
): Promise<Candidate> {
  const response = await apiFetch(apiUrl(`/records/${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(progress),
  });
  if (!response.ok) throw new Error(`La API respondió con el código ${response.status}.`);
  return await response.json();
}

export async function saveCandidate(input: CandidateInput, id?: string): Promise<Candidate> {
  const response = await apiFetch(apiUrl(id ? `/records/${encodeURIComponent(id)}` : "/records"), {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new CandidateSaveError(response.status);
  return await response.json();
}