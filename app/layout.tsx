import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "People & Talent | HealthCore",
  description: "Gestión de candidaturas de HealthCore",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}