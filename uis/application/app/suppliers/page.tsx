"use client";

import { Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { AuthRequiredError, categoryLabels, getStoredToken, login, storeToken, supplierRequest, type Supplier, type SupplierCategory, type SupplierInput } from "./supplier-api";

const inputClass = "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:opacity-60";
const iconClass = "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-slate-300 text-teal-800 hover:bg-teal-50 disabled:opacity-40";
const countryLabels = { US: "Estados Unidos", UK: "Reino Unido" };

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "No se pudo completar la operación.";
}

function SupplierRow({ supplier, onUpdate, onDelete }: {
  supplier: Supplier;
  onUpdate: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}) {
  const [rate, setRate] = useState(String(supplier.rate));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function update(field: "rate" | "status") {
    setBusy(true);
    setError("");
    try {
      const body = field === "rate" ? { rate: Number(rate) } : { status: supplier.status === "activo" ? "suspendido" : "activo" };
      const updated = await supplierRequest<Supplier>(`/${encodeURIComponent(supplier.id)}/${field}`, { method: "PATCH", body: JSON.stringify(body) });
      setRate(String(updated.rate));
      onUpdate(updated);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`¿Eliminar a ${supplier.name} del directorio? Esta acción no se puede deshacer.`)) return;
    setBusy(true);
    setError("");
    try {
      await supplierRequest<void>(`/${encodeURIComponent(supplier.id)}`, { method: "DELETE" });
      onDelete(supplier.id);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <tr className={supplier.status === "suspendido" ? "bg-amber-50/40" : "bg-white"}>
        <th scope="row" className="break-words px-3 py-4 font-semibold text-slate-900">{supplier.name}</th>
        <td className="px-3 py-4">{countryLabels[supplier.country]}</td>
        <td className="px-3 py-4">{categoryLabels[supplier.category]}</td>
        <td className="px-3 py-4">
          <form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); void update("rate"); }}>
            <input aria-label={`Tarifa de ${supplier.name}`} className={`${inputClass} min-w-0`} style={{ width: 110 }} type="number" step="any" required min="0" value={rate} onChange={(event) => setRate(event.target.value)} disabled={busy} />
            <button type="submit" title={`Guardar tarifa de ${supplier.name}`} aria-label={`Guardar tarifa de ${supplier.name}`} className={iconClass} disabled={busy || rate === String(supplier.rate) || !Number.isFinite(Number(rate)) || Number(rate) <= 0}><Save size={17} /></button>
          </form>
        </td>
        <td className="px-3 py-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" role="switch" aria-label={`Proveedor activo: ${supplier.name}`} checked={supplier.status === "activo"} onChange={() => void update("status")} disabled={busy} className="h-4 w-4 accent-teal-700" />
            <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${supplier.status === "activo" ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>{supplier.status === "activo" ? "Activo" : "Suspendido"}</span>
          </label>
        </td>
        <td className="px-3 py-4 text-xs text-slate-500"><time dateTime={supplier.updated_at}>{new Date(supplier.updated_at).toLocaleString("es", { timeZone: "UTC" })} UTC</time></td>
        <td className="px-3 py-4"><button type="button" title={`Eliminar a ${supplier.name}`} aria-label={`Eliminar a ${supplier.name}`} disabled={busy} className={`${iconClass} text-red-700 hover:bg-red-50`} onClick={() => void remove()}><Trash2 size={17} /></button></td>
      </tr>
      {error && <tr><td colSpan={7} className="bg-red-50 px-3 py-3 text-red-900" role="alert">{error}</td></tr>}
    </>
  );
}

function CreateSupplier({ onCreated, onCancel }: { onCreated: (supplier: Supplier) => void; onCancel: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    if (name.length < 1 || name.length > 200) {
      setError("Nombre: introduce entre 1 y 200 caracteres.");
      return;
    }
    const rate = Number(data.get("rate"));
    if (!Number.isFinite(rate) || rate <= 0) {
      setError("Tarifa: introduce un número finito mayor que cero.");
      return;
    }
    const payload: SupplierInput = {
      name,
      country: data.get("country") as SupplierInput["country"],
      category: data.get("category") as SupplierCategory,
      rate,
      status: data.get("status") as SupplierInput["status"],
    };
    setBusy(true);
    setError("");
    try {
      onCreated(await supplierRequest<Supplier>("", { method: "POST", body: JSON.stringify(payload) }));
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="create-supplier-title" className="border-b border-slate-200 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="create-supplier-title" className="text-lg font-semibold">Nuevo proveedor</h2>
        <button type="button" title="Cerrar formulario" aria-label="Cerrar formulario" onClick={onCancel} disabled={busy} className={iconClass}><X size={18} /></button>
      </div>
      <form onSubmit={(event) => void submit(event)}>
        <fieldset disabled={busy} className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1 text-sm font-medium">Nombre<input autoFocus className={inputClass} name="name" required maxLength={200} /></label>
          <label className="space-y-1 text-sm font-medium">País<select aria-label="País" className={inputClass} name="country" defaultValue="US">{Object.entries(countryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="space-y-1 text-sm font-medium">Categoría<select aria-label="Categoría" className={inputClass} name="category" defaultValue="health_tech_software">{Object.entries(categoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label className="space-y-1 text-sm font-medium">Tarifa por hora<input className={inputClass} name="rate" type="number" required min="0" step="any" /></label>
          <label className="space-y-1 text-sm font-medium">Estado<select aria-label="Estado" className={inputClass} name="status" defaultValue="activo"><option value="activo">Activo</option><option value="suspendido">Suspendido</option></select></label>
          <div className="flex items-end"><button type="submit" className="inline-flex min-h-10 items-center gap-2 rounded bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-50"><Plus size={17} />{busy ? "Guardando..." : "Crear proveedor"}</button></div>
        </fieldset>
        {error && <p role="alert" className="mt-4 border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
      </form>
    </section>
  );
}

function LoginPanel({ onLogin }: { onLogin: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      storeToken(await login(String(data.get("email")), String(data.get("password"))));
      onLogin();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-16 sm:px-8">
      <p className="text-xs font-semibold uppercase text-teal-700">HealthCore · Operaciones</p>
      <h1 className="mt-1 text-2xl font-semibold">Iniciar sesión</h1>
      <form className="mt-6" onSubmit={(event) => void submit(event)}>
        <fieldset disabled={busy} className="grid gap-4">
          <label className="space-y-1 text-sm font-medium">Email<input className={inputClass} name="email" type="email" autoComplete="username" required /></label>
          <label className="space-y-1 text-sm font-medium">Contraseña<input className={inputClass} name="password" type="password" autoComplete="current-password" required /></label>
          <button type="submit" className="inline-flex min-h-10 items-center justify-center rounded bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-50">{busy ? "Entrando..." : "Entrar"}</button>
        </fieldset>
        {error && <p role="alert" className="mt-4 border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
      </form>
    </main>
  );
}

export default function SuppliersPage() {
  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setAuthenticated(getStoredToken() !== null);
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    supplierRequest<Supplier[]>("", { signal: controller.signal }).then((items) => {
      if (!controller.signal.aborted) setSuppliers(items);
    }).catch((failure: unknown) => {
      if (controller.signal.aborted) return;
      if (failure instanceof AuthRequiredError) setAuthenticated(false);
      else setError(errorMessage(failure));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [attempt, authenticated]);

  if (!checked) return null;
  if (!authenticated) return <LoginPanel onLogin={() => setAuthenticated(true)} />;

  const filtered = suppliers.filter((supplier) => (!country || supplier.country === country) && (!category || supplier.category === category));

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase text-teal-700">HealthCore · Operaciones</p><h1 className="mt-1 text-2xl font-semibold">Directorio de proveedores</h1></div>
        <button type="button" disabled={creating || loading || !!error} onClick={() => { setCreating(true); setNotice(""); }} className="inline-flex items-center gap-2 rounded bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-50"><Plus size={18} />Nuevo proveedor</button>
      </div>
      {creating && <CreateSupplier onCancel={() => setCreating(false)} onCreated={(supplier) => { setSuppliers((items) => [...items, supplier]); setCreating(false); setCountry(""); setCategory(""); setNotice(`Proveedor ${supplier.name} creado.`); }} />}
      <div className="mt-6 grid items-end gap-4 border-y border-slate-200 py-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        <label className="space-y-1 text-sm font-medium">País<select aria-label="País" className={inputClass} value={country} onChange={(event) => setCountry(event.target.value)}><option value="">Todos los países</option>{Object.entries(countryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="space-y-1 text-sm font-medium">Categoría<select aria-label="Categoría" className={inputClass} value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todas las categorías</option>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        {!loading && !error && <p className="py-2 text-sm text-slate-600" role="status">{filtered.length} de {suppliers.length} proveedores</p>}
      </div>
      <p className="py-3 text-sm text-teal-800" role="status" aria-live="polite">{notice}</p>
      {loading && <p role="status" className="py-8 text-sm text-slate-600">Cargando proveedores...</p>}
      {error && <div role="alert" className="border-l-4 border-red-600 bg-red-50 p-4 text-sm text-red-900"><p>{error}</p><button type="button" className="mt-3 rounded border border-red-700 px-3 py-2" onClick={() => setAttempt((value) => value + 1)}>Reintentar</button></div>}
      {!loading && !error && (filtered.length === 0 ? <p className="py-8 text-sm text-slate-600">No hay proveedores que coincidan con los filtros.</p> : (
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[1100px] table-fixed text-left text-sm">
            <caption className="sr-only">Directorio de proveedores de HealthCore</caption>
            <colgroup><col className="w-[18%]" /><col className="w-[13%]" /><col className="w-[17%]" /><col className="w-[18%]" /><col className="w-[14%]" /><col className="w-[14%]" /><col className="w-[6%]" /></colgroup>
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr>{["Proveedor", "País", "Categoría", "Tarifa / hora", "Estado", "Actualización", ""].map((heading) => <th scope="col" key={heading} className="px-3 py-4 font-semibold">{heading || <span className="sr-only">Acciones</span>}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-200">{filtered.map((supplier) => <SupplierRow key={supplier.id} supplier={supplier} onUpdate={(updated) => { setSuppliers((items) => items.map((item) => item.id === updated.id ? updated : item)); setNotice(`Proveedor ${updated.name} actualizado.`); }} onDelete={(id) => { setSuppliers((items) => items.filter((item) => item.id !== id)); setNotice(`Proveedor ${supplier.name} eliminado.`); }} />)}</tbody>
          </table>
        </div>
      ))}
    </main>
  );
}