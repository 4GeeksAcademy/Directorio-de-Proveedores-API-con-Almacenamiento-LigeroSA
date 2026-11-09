"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createNote, deleteNote, getNotes } from "../../services/notes";
import type { Note } from "../../types/note";

type NotesState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "success"; notes: Note[] };

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "Error desconocido.";
}

export default function NotesSection({ candidateId }: { candidateId: string }) {
  const [state, setState] = useState<NotesState>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setState({ kind: "loading" });
      try {
        const notes = await getNotes(candidateId, controller.signal);
        if (!controller.signal.aborted) setState({ kind: "success", notes });
      } catch (error) {
        if (!controller.signal.aborted) setState({ kind: "error", message: errorText(error) });
      }
    }
    void load();
    return () => controller.abort();
  }, [candidateId, attempt]);

  useEffect(() => {
    if (message?.kind !== "success") return;
    const timer = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  async function refreshNotes() {
    setState({ kind: "loading" });
    try {
      setState({ kind: "success", notes: await getNotes(candidateId) });
    } catch (error) {
      setState({ kind: "error", message: errorText(error) });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const text = content.trim();
    if (!text) {
      setMessage({ kind: "error", text: "Escribe una nota antes de enviarla." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await createNote(candidateId, text);
      setContent("");
      setMessage({ kind: "success", text: "Nota añadida correctamente." });
      await refreshNotes();
    } catch (error) {
      setMessage({ kind: "error", text: `No se pudo añadir la nota. ${errorText(error)}` });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(noteId: string) {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    try {
      await deleteNote(candidateId, noteId);
      setConfirmId(null);
      setMessage({ kind: "success", text: "Nota eliminada correctamente." });
      await refreshNotes();
    } catch (error) {
      setMessage({ kind: "error", text: `No se pudo eliminar la nota. ${errorText(error)}` });
    } finally {
      setBusy(false);
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>, note: Note) {
    event.preventDefault();
    if (busy) return;
    const text = editContent.trim();
    if (!text) {
      setMessage({ kind: "error", text: "Escribe una nota antes de guardarla." });
      return;
    }
    if (text === note.content) {
      setEditingId(null);
      setMessage(null);
      return;
    }

    setBusy(true);
    setMessage(null);
    let replacementCreated = false;
    try {
      await createNote(candidateId, text);
      replacementCreated = true;
      await deleteNote(candidateId, note.id);
      setEditingId(null);
      setMessage({ kind: "success", text: "Nota actualizada correctamente." });
      await refreshNotes();
    } catch (error) {
      if (replacementCreated) {
        setEditingId(null);
        setMessage({ kind: "error", text: `La nota nueva se guardó, pero no se pudo confirmar la eliminación de la original. Revisa si hay notas duplicadas. ${errorText(error)}` });
      } else {
        setMessage({ kind: "error", text: `No se pudo confirmar que se guardara la nota nueva. Revisa la lista antes de reintentar. ${errorText(error)}` });
      }
      await refreshNotes();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="notes-title" className="mt-8 border-t border-slate-200 pt-6">
      <h2 id="notes-title" className="text-lg font-semibold">Notas</h2>
      {message && <p role={message.kind === "error" ? "alert" : "status"} className={`mt-4 rounded p-3 text-sm ${message.kind === "error" ? "bg-red-50 text-red-900" : "bg-emerald-50 text-emerald-900"}`}>{message.text}</p>}
      <form onSubmit={handleSubmit} className="mt-4">
        <label htmlFor="note-content" className="text-sm font-medium text-slate-700">Nueva nota</label>
        <textarea id="note-content" value={content} onChange={(event) => setContent(event.target.value)} disabled={busy} required rows={3} className="mt-1 block w-full rounded border border-slate-300 bg-white p-3 text-sm" />
        <button type="submit" disabled={busy} className="mt-3 rounded bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60">{busy ? "Procesando..." : "Añadir nota"}</button>
      </form>
      {state.kind === "loading" && <p role="status" className="py-6 text-sm text-slate-600">Cargando notas...</p>}
      {state.kind === "error" && <div role="alert" className="mt-5 border-l-4 border-red-600 bg-red-50 p-4 text-sm text-red-900"><p>No se pudieron cargar las notas. {state.message}</p><button type="button" onClick={() => setAttempt((value) => value + 1)} disabled={busy} className="mt-3 rounded border border-red-700 px-3 py-1.5 font-semibold">Reintentar</button></div>}
      {state.kind === "success" && (state.notes.length === 0 ? <p className="py-6 text-sm text-slate-600">Todavía no hay notas.</p> : <ul className="mt-5 divide-y divide-slate-200 border-y border-slate-200">{state.notes.map((note) => {
        const date = new Date(note.created_at);
        return <li key={note.id} className="py-4">
          {editingId === note.id ? <form onSubmit={(event) => void handleEdit(event, note)}>
            <label htmlFor={`edit-note-${note.id}`} className="text-sm font-medium text-slate-700">Editar nota</label>
            <textarea id={`edit-note-${note.id}`} value={editContent} onChange={(event) => setEditContent(event.target.value)} disabled={busy} required rows={3} className="mt-1 block w-full rounded border border-slate-300 bg-white p-3 text-sm" />
            <div className="mt-3 flex gap-3"><button type="submit" disabled={busy} className="rounded bg-teal-800 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Guardando..." : "Guardar nota"}</button><button type="button" disabled={busy} onClick={() => setEditingId(null)} className="text-sm text-slate-700 underline">Cancelar</button></div>
          </form> : <p className="whitespace-pre-wrap break-words text-sm text-slate-900">{note.content}</p>}
          <p className="mt-2 text-xs text-slate-500">{Number.isNaN(date.getTime()) ? note.created_at : new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(date)}</p>
          {editingId !== note.id && (confirmId === note.id ? <div className="mt-3 flex flex-wrap items-center gap-3"><span className="text-sm text-red-900">¿Eliminar esta nota?</span><button type="button" disabled={busy} onClick={() => void handleDelete(note.id)} className="rounded border border-red-700 px-3 py-1 text-sm font-semibold text-red-800 disabled:opacity-60">{busy ? "Eliminando..." : "Confirmar eliminación"}</button><button type="button" disabled={busy} onClick={() => setConfirmId(null)} className="text-sm text-slate-700 underline">Cancelar</button></div> : <div className="mt-3 flex gap-4"><button type="button" disabled={busy} onClick={() => { setEditingId(note.id); setEditContent(note.content); setConfirmId(null); setMessage(null); }} className="text-sm font-medium text-teal-800 underline disabled:opacity-60">Editar nota</button><button type="button" disabled={busy} onClick={() => { setEditingId(null); setConfirmId(note.id); }} className="text-sm font-medium text-red-700 underline disabled:opacity-60">Eliminar nota</button></div>)}
        </li>;
      })}</ul>)}
    </section>
  );
}