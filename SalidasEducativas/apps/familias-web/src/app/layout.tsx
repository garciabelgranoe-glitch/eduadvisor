import type { Metadata } from "next";
import { MainNav } from "@/components/main-nav";
import { familyProfile } from "@/lib/mock-data";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal de Familias",
  description: "Vertical slice del portal institucional para familias"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="background-decor" aria-hidden="true" />
        <div className="shell">
          <header className="top-header">
            <div>
              <p className="overline">{familyProfile.schoolName}</p>
              <h1>Portal de Familias</h1>
            </div>
            <div className="header-meta">
              <p>{familyProfile.guardianName}</p>
              <span>{familyProfile.cycleLabel}</span>
            </div>
          </header>
          <MainNav />
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
