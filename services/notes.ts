import type { Note } from "../types/note";
import { apiUrl } from "./candidates";
import { apiFetch } from "./api-client";

function notesPath(candidateId: string): string {
  return `/records/${encodeURIComponent(candidateId)}/notes`;
}

function checkResponse(response: Response): void {
  if (!response.ok) throw new Error(`La API respondió con el código ${response.status}.`);
}

export async function getNotes(candidateId: string, signal?: AbortSignal): Promise<Note[]> {
  const response = await apiFetch(apiUrl(notesPath(candidateId)), { signal });
  checkResponse(response);
  const result: { data: Note[] } = await response.json();
  if (!Array.isArray(result.data)) throw new Error("La API devolvió una respuesta inesperada.");
  return result.data;
}

export async function createNote(candidateId: string, content: string): Promise<void> {
  const response = await apiFetch(apiUrl(notesPath(candidateId)), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  checkResponse(response);
}

export async function deleteNote(candidateId: string, noteId: string): Promise<void> {
  const response = await apiFetch(apiUrl(`${notesPath(candidateId)}/${encodeURIComponent(noteId)}`), {
    method: "DELETE",
  });
  checkResponse(response);
}