"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { useApiClient, useAuth } from "../../../components/auth/auth-provider";
import { authButtonClass, authInputClass } from "../../../components/auth/auth-form";
import { ApiError, type Profile } from "../../../services/api-client";

export default function ProfilePage() {
  const { session, updateProfile } = useAuth();
  const request = useApiClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  if (session.status !== "authenticated") return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    setSaved(false);
    setFields({});
    try {
      const profile = await request<Profile>("/profiles/me", { method: "PUT", body: JSON.stringify(Object.fromEntries(["name", "phone", "address"].map((field) => [field, String(data.get(field) ?? "").trim() || null]))) });
      updateProfile(profile);
      setSaved(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo guardar el perfil.");
      if (failure instanceof ApiError) setFields(failure.fields);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10 sm:px-8">
      <h1 className="text-2xl font-semibold">Mi perfil</h1>
      <form className="mt-6 space-y-4" onSubmit={(event) => void submit(event)} aria-busy={busy}>
        <label className="block text-sm font-medium">Email<input className={authInputClass} type="email" value={session.user.email} readOnly /></label>
        <fieldset disabled={busy} className="grid min-w-0 gap-4">
          {([
            { name: "name", label: "Nombre", type: "text", autoComplete: "name", maxLength: 200 },
            { name: "phone", label: "Telefono", type: "tel", autoComplete: "tel", maxLength: 50 },
            { name: "address", label: "Direccion", type: "text", autoComplete: "street-address", maxLength: 300 },
          ] as const).map(({ label, ...input }) => <div key={input.name} className="text-sm font-medium"><label htmlFor={input.name}>{label}</label><input {...input} id={input.name} className={authInputClass} defaultValue={session.user.profile?.[input.name] ?? ""} aria-invalid={!!fields[input.name]} aria-describedby={fields[input.name] ? `${input.name}-error` : undefined} />{fields[input.name] && <span id={`${input.name}-error`} className="text-red-800">{fields[input.name]}</span>}</div>)}
          <button className={authButtonClass} type="submit"><Save size={18} />{busy ? "Guardando..." : "Guardar cambios"}</button>
        </fieldset>
        {error && <p role="alert" className="text-red-800">{error}</p>}
        {saved && <p role="status" className="text-teal-800">Perfil actualizado.</p>}
      </form>
    </main>
  );
}