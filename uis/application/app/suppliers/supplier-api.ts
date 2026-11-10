export const categoryLabels = {
  health_tech_software: "Tecnología sanitaria",
  revenue_billing_services: "Facturación e ingresos",
  medical_supplies: "Insumos clínicos",
  recruitment_hr: "Selección y RR. HH.",
  compliance_legal: "Cumplimiento y legal",
  general_operations: "Operaciones generales",
} as const;

export type SupplierCategory = keyof typeof categoryLabels;
export type SupplierStatus = "activo" | "suspendido";
export type SupplierInput = {
  name: string;
  country: "US" | "UK";
  category: SupplierCategory;
  rate: number;
  status: SupplierStatus;
};
export type Supplier = SupplierInput & { id: string; updated_at: string };

const tokenKey = "healthcore_access_token";

export class AuthRequiredError extends Error {}

export function getStoredToken(): string | null {
  return sessionStorage.getItem(tokenKey);
}

export function storeToken(token: string | null) {
  if (token) sessionStorage.setItem(tokenKey, token);
  else sessionStorage.removeItem(tokenKey);
}

export async function login(email: string, password: string): Promise<string> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof body?.detail === "string" ? body.detail : "No se pudo iniciar sesión.");
  return body.access_token as string;
}

const fieldLabels: Record<string, string> = {
  name: "Nombre", country: "País", category: "Categoría", rate: "Tarifa", status: "Estado",
};

export async function supplierRequest<Result>(path = "", options: RequestInit = {}): Promise<Result> {
  const token = getStoredToken();
  const response = await fetch(`/api/suppliers${path}`, {
    ...options,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (response.status === 401) {
    storeToken(null);
    throw new AuthRequiredError("Tu sesión ha caducado. Inicia sesión de nuevo.");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    if (response.status === 422 && Array.isArray(body?.detail)) {
      const messages = body.detail.map((issue: { loc?: string[]; type?: string }) => {
        const field = issue.loc?.at(-1) ?? "datos";
        const label = fieldLabels[field] ?? field;
        if (field === "rate") return "Tarifa: introduce un número finito mayor que cero.";
        if (field === "name") return "Nombre: introduce entre 1 y 200 caracteres.";
        return `${label}: selecciona un valor válido.`;
      });
      throw new Error([...new Set(messages)].join(" "));
    }
    throw new Error(typeof body?.detail === "string" ? body.detail : "No se pudo completar la operación. Comprueba la conexión con la API.");
  }
  if (response.status === 204) return undefined as Result;
  return response.json() as Promise<Result>;
}