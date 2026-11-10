"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiRequest, expireSession, getStoredToken, SESSION_EVENT, storeToken, TOKEN_KEY, tokenExpiry, type CurrentUser, type Profile } from "../../services/api-client";

type Session =
  | { status: "loading" | "anonymous"; user: null }
  | { status: "authenticated"; user: CurrentUser }
  | { status: "error"; user: null; message: string };

const AuthContext = createContext<{
  session: Session;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  retry: () => void;
  updateProfile: (profile: Profile) => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ status: "loading", user: null });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const changed = () => {
      setSession({ status: "loading", user: null });
      setRevision((value) => value + 1);
    };
    const storage = (event: StorageEvent) => { if (event.key === TOKEN_KEY || event.key === null) changed(); };
    const focus = () => {
      try {
        const token = getStoredToken();
        if (token && tokenExpiry(token) <= Date.now()) expireSession(token);
      } catch {
        changed();
      }
    };
    window.addEventListener(SESSION_EVENT, changed);
    window.addEventListener("storage", storage);
    window.addEventListener("focus", focus);
    return () => {
      window.removeEventListener(SESSION_EVENT, changed);
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", focus);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function restore() {
      try {
        const token = getStoredToken();
        if (!token) {
          setSession({ status: "anonymous", user: null });
          return;
        }
        const remaining = tokenExpiry(token) - Date.now();
        if (remaining <= 0) { expireSession(token); return; }
        const user = await apiRequest<CurrentUser>("/auth/me", { signal: controller.signal });
        if (controller.signal.aborted || getStoredToken() !== token) return;
        setSession({ status: "authenticated", user });
        timer = setTimeout(() => {
          if (tokenExpiry(token) <= Date.now()) expireSession(token);
          else setRevision((value) => value + 1);
        }, Math.min(Math.max(0, tokenExpiry(token) - Date.now()), 2147483647));
      } catch (error) {
        if (!controller.signal.aborted) setSession({ status: "error", user: null, message: error instanceof Error ? error.message : "No se pudo verificar la sesion." });
      }
    }
    void restore();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [revision]);

  async function login(email: string, password: string) {
    const result = await apiRequest<{ access_token: string }>("/auth/login", {
      method: "POST", body: JSON.stringify({ email, password }),
    }, false);
    if (typeof result.access_token !== "string" || tokenExpiry(result.access_token) <= Date.now()) throw new Error("La API devolvio un token no valido.");
    storeToken(result.access_token);
  }

  function logout() {
    try { storeToken(null); } finally {
      setSession({ status: "anonymous", user: null });
      window.location.replace("/login");
    }
  }

  function updateProfile(profile: Profile) {
    setSession((current) => current.status === "authenticated" ? { ...current, user: { ...current.user, profile } } : current);
  }

  return <AuthContext.Provider value={{ session, login, logout, updateProfile, retry: () => setRevision((value) => value + 1) }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth requiere AuthProvider.");
  return context;
}

export function useApiClient() {
  useAuth();
  return apiRequest;
}