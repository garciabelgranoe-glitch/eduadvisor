import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Panel administrador",
  description: "Panel interno de operación de plataforma.",
  canonicalPath: "/admin"
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <section className="space-y-5">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Panel administrador</p>
        <h1 className="font-display text-4xl text-ink">Control de plataforma</h1>
        <p className="text-sm text-slate-600">
          Gestión de colegios, moderación de contenido y monitoreo operativo.
        </p>
        <AdminNav />
      </header>
      {children}
    </section>
  );
}
