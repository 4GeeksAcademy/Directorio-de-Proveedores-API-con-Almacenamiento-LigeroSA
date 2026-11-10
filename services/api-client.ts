export const TOKEN_KEY = "healthcore_access_token";
export const SESSION_EVENT = "healthcore:session";

export type Profile = { name: string | null; phone: string | null; address: string | null };
export type CurrentUser = { email: string; role: string; profile: Profile | null };

export class ApiError extends Error {
  constructor(public status: number, message: string, public fields: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
  }
}

export function getStoredToken(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string | null) {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function tokenExpiry(token: string): number {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || parts.some((part) => !part)) return 0;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && Number.isFinite(payload.exp) ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

export function expireSession(token: string | null) {
  if (getStoredToken() !== token) return;
  try {
    storeToken(null);
  } finally {
    window.location.replace("/login");
  }
}

function isSameOrigin(url: string): boolean {
  return new URL(url, window.location.origin).origin === window.location.origin;
}

export async function apiFetch(url: string, options: RequestInit = {}, authenticated = true): Promise<Response> {
  // Never send the session token to another origin (e.g. NEXT_PUBLIC_API_URL).
  if (authenticated && !isSameOrigin(url)) {
    const response = await fetch(url, { ...options, cache: "no-store", credentials: "omit" });
    if (response.status === 401) throw new ApiError(401, "Tu sesion ha caducado. Inicia sesion de nuevo.");
    return response;
  }
  const token = authenticated ? getStoredToken() : null;
  if (authenticated && (!token || tokenExpiry(token) <= Date.now())) {
    expireSession(token);
    throw new ApiError(401, "Tu sesion ha caducado. Inicia sesion de nuevo.");
  }
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(url, { ...options, headers, cache: "no-store", credentials: "omit" });
  if (authenticated && response.status === 401) {
    expireSession(token);
    throw new ApiError(401, "Tu sesion ha caducado. Inicia sesion de nuevo.");
  }
  return response;
}

export async function apiRequest<Result>(path: string, options: RequestInit = {}, authenticated = true): Promise<Result> {
  if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Ruta de API no valida.");
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const response = await apiFetch(`/api${path}`, { ...options, headers }, authenticated);
  const body = response.status === 204 ? undefined : await response.json().catch(() => null);
  if (!response.ok) {
    const fields: Record<string, string> = {};
    if (Array.isArray(body?.detail)) {
      for (const issue of body.detail) {
        const field = issue.loc?.at(-1);
        if (typeof field === "string" && typeof issue.msg === "string") fields[field] = issue.msg;
      }
    }
    if (response.status === 409 && path === "/users") fields.email = "El email ya esta registrado.";
    throw new ApiError(response.status, typeof body?.detail === "string" ? body.detail : "No se pudo completar la solicitud. Revisa los datos.", fields);
  }
  if (response.status !== 204 && body === null) throw new ApiError(502, "La API devolvio una respuesta inesperada.");
  return body as Result;
}