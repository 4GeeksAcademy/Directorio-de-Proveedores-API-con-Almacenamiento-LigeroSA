"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { ApiError } from "../../services/api-client";
import { useApiClient, useAuth } from "./auth-provider";

export const authInputClass = "mt-1 block w-full min-w-0 rounded border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100";
export const authButtonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded bg-teal-800 px-4 py-2 font-semibold text-white hover:bg-teal-900 disabled:opacity-50";

export function AuthForm({ register = false }: { register?: boolean }) {
  const { login, session } = useAuth();
  const request = useApiClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [created, setCreated] = useState(false);

  useEffect(() => {
    if (session.status === "authenticated") router.replace("/suppliers");
  }, [session.status, router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim();
    const password = String(data.get("password"));
    setError("");
    setFields({});
    setBusy(true);
    try {
      if (register && !created) {
        if (new TextEncoder().encode(password).length > 72) {
          setFields({ password: "La contrasena no puede superar 72 bytes." });
          return;
        }
        await request("/users", {
          method: "POST",
          body: JSON.stringify({ email, password, ...Object.fromEntries(["name", "phone", "address"].map((field) => [field, String(data.get(field) ?? "").trim() || null])) }),
        }, false);
        setCreated(true);
      }
      await login(email, password);
      router.replace("/suppliers");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo conectar con la API.");
      if (failure instanceof ApiError) setFields(failure.fields);
    } finally {
      setBusy(false);
    }
  }

  const inputs = [
    { name: "email", label: "Email", type: "email", autoComplete: "username", required: true },
    { name: "password", label: "Contrasena", type: "password", autoComplete: register ? "new-password" : "current-password", required: true },
    ...(register ? [
      { name: "name", label: "Nombre", type: "text", autoComplete: "name", maxLength: 200 },
      { name: "phone", label: "Telefono", type: "tel", autoComplete: "tel", maxLength: 50 },
      { name: "address", label: "Direccion", type: "text", autoComplete: "street-address", maxLength: 300 },
    ] : []),
  ];

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:px-8">
      <h1 className="text-2xl font-semibold">{register ? "Crear cuenta" : "Iniciar sesion"}</h1>
      <form className="mt-6 space-y-4" onSubmit={(event) => void submit(event)} aria-busy={busy}>
        <fieldset disabled={busy} className="grid min-w-0 gap-4">
          {inputs.map(({ label, ...input }) => (
            <div key={input.name} className="text-sm font-medium">
              <label htmlFor={input.name}>{label}</label>
              <input {...input} id={input.name} className={authInputClass} minLength={register && input.name === "password" && !created ? 8 : undefined} aria-invalid={!!fields[input.name]} aria-describedby={fields[input.name] ? `${input.name}-error` : undefined} />
              {fields[input.name] && <span id={`${input.name}-error`} className="mt-1 block text-red-800">{fields[input.name]}</span>}
            </div>
          ))}
          <button className={authButtonClass} type="submit">{register && !created ? <UserPlus size={18} /> : <LogIn size={18} />}{busy ? "Enviando..." : register && !created ? "Crear cuenta" : "Entrar"}</button>
        </fieldset>
        {created && <p role="status" className="text-sm text-teal-800">Cuenta creada.</p>}
        {error && <p role="alert" className="border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
      </form>
      <Link className="mt-6 inline-block text-sm text-teal-800 underline" href={register ? "/login" : "/register"}>{register ? "Iniciar sesion" : "Crear cuenta"}</Link>
    </main>
  );
}