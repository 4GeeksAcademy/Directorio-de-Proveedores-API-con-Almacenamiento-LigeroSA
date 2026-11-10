import type { Metadata } from "next";
import Link from "next/link";
import { AuthProvider } from "../components/auth/auth-provider";
import { AuthGuard } from "../components/auth/auth-guard";
import "./globals.css";

export const metadata: Metadata = {
  title: "People & Talent | HealthCore",
  description: "Gestión de candidaturas de HealthCore",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <nav aria-label="Menú principal" className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-8">
            <Link href="/" className="text-lg font-semibold text-teal-700">HealthCore</Link>
            <Link href="/" className="text-sm font-medium text-slate-700 hover:text-teal-800">Candidaturas</Link>
            <Link href="/suppliers" className="text-sm font-medium text-slate-700 hover:text-teal-800">Proveedores</Link>
          </nav>
        </header>
        <AuthProvider><AuthGuard>{children}</AuthGuard></AuthProvider>
      </body>
    </html>
  );
}