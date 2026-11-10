"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "./auth-provider";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { session, logout, retry } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const publicRoute = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    if (!publicRoute && session.status === "anonymous") router.replace("/login");
  }, [publicRoute, session.status, router]);

  if (publicRoute) return children;
  if (session.status === "error") return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-12">
      <p role="alert">{session.message}</p>
      <button className="rounded border px-4 py-2" onClick={retry}>Reintentar</button>
      <button className="ml-4 rounded border px-4 py-2" onClick={logout}>Cerrar sesion</button>
    </main>
  );
  if (session.status !== "authenticated") return <p role="status" className="p-8">Verificando sesion...</p>;
  return (
    <>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-4 px-4 py-3 text-sm sm:px-8">
        <Link href="/account/profile" className="inline-flex items-center gap-2 text-teal-800"><UserRound size={18} />Mi perfil</Link>
        <button type="button" onClick={logout} className="inline-flex items-center gap-2 text-red-800"><LogOut size={18} />Cerrar sesion</button>
      </div>
      {children}
    </>
  );
}