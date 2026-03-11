import Link from "next/link";
import type { Metadata } from "next";
import { SchoolPublishForm } from "@/components/sections/school-publish-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { pickParam, type RawSearchParams } from "@/lib/query-params";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Para colegios",
  description: "Publica o reclama el perfil de tu colegio para recibir leads y mejorar visibilidad.",
  canonicalPath: "/para-colegios"
});

interface ForSchoolsPageProps {
  searchParams?: RawSearchParams;
}

export default function ForSchoolsPage({ searchParams }: ForSchoolsPageProps) {
  const flowParam = pickParam(searchParams?.flow);
  const schoolParam = pickParam(searchParams?.school);
  const initialFlow = flowParam === "claim" ? "claim" : "publish";

  return (
    <section className="space-y-6">
      <Card className="space-y-5 overflow-hidden border-brand-200 bg-gradient-to-br from-white via-brand-50 to-amber-50">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Growth para colegios privados</p>
          <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">
            Convertí visibilidad en matrículas
          </h1>
          <p className="max-w-3xl text-slate-700">
            Reclama tu perfil, mejora tu presentación institucional y activa herramientas premium para captar
            familias con intención real de consulta.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-brand-100 bg-white/90 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Resultado</p>
            <p className="mt-1 text-lg font-semibold text-ink">Más leads calificados</p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white/90 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Operacion</p>
            <p className="mt-1 text-lg font-semibold text-ink">Gestion centralizada del perfil</p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white/90 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Marca</p>
            <p className="mt-1 text-lg font-semibold text-ink">Posición premium en catálogo</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a href="#solicitud-colegio">Reclamar o publicar ahora</a>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/ingresar?next=/school-dashboard">Entrar al panel de colegio</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/rankings">Ver cómo se muestran los rankings</Link>
          </Button>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-brand-700">1. Reclamo de perfil</p>
          <h2 className="text-xl font-semibold text-ink">Control institucional</h2>
          <p className="text-sm text-slate-600">
            El claim valida titularidad y habilita gestion segura del perfil del colegio.
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-brand-700">2. Activacion premium</p>
          <h2 className="text-xl font-semibold text-ink">Más conversión y confianza</h2>
          <p className="text-sm text-slate-600">
            Destacado premium, logo, galería institucional y prioridad de exposición frente a familias.
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-brand-700">3. Gestion comercial</p>
          <h2 className="text-xl font-semibold text-ink">Leads y seguimiento</h2>
          <p className="text-sm text-slate-600">
            Responde consultas, ordena pipeline y mide performance desde un dashboard único.
          </p>
        </Card>
      </section>

      <Card className="space-y-4 border-brand-200 bg-white">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Onboarding guiado</p>
          <h2 className="font-display text-3xl text-ink">Activación comercial en 72 horas hábiles</h2>
          <p className="text-sm text-slate-600">
            Nuestro equipo acompaña el proceso para que el colegio quede visible, validado y listo para convertir
            consultas en matrículas.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-700">Día 1</p>
            <p className="mt-1 text-sm font-medium text-ink">Validación de claim y acceso al panel</p>
          </div>
          <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-700">Día 2</p>
            <p className="mt-1 text-sm font-medium text-ink">Optimización de perfil, logo y galería</p>
          </div>
          <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-brand-700">Día 3</p>
            <p className="mt-1 text-sm font-medium text-ink">Activación de leads y seguimiento comercial</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a href="#solicitud-colegio">Iniciar activación</a>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/ingresar?next=/school-dashboard">Ya tengo cuenta de colegio</Link>
          </Button>
        </div>
      </Card>

      <Card className="space-y-4 border-brand-200">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Planes</p>
            <h2 className="font-display text-3xl text-ink">Free vs Premium</h2>
          </div>
          <Button asChild variant="secondary">
            <a href="#solicitud-colegio">Quiero activar premium</a>
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Perfil Free</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>Visibilidad básica en catálogo</li>
              <li>Datos institucionales iniciales</li>
              <li>Sin formulario comercial activo</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4">
            <p className="text-sm font-semibold text-amber-900">Perfil Premium</p>
            <ul className="mt-2 space-y-1 text-sm text-amber-900">
              <li>Badge destacado y prioridad en exposición</li>
              <li>Logo + imágenes institucionales</li>
              <li>Formulario de contacto activo para matrículas</li>
              <li>Herramientas comerciales desde dashboard</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-lg font-semibold text-ink">Como funciona</h3>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>1. Envia solicitud de claim o alta con datos institucionales.</li>
          <li>2. Validamos titularidad y habilitamos acceso al panel.</li>
          <li>3. Activas premium y optimizas tu presencia comercial.</li>
        </ul>
      </Card>

      <div id="solicitud-colegio">
      <SchoolPublishForm initialFlow={initialFlow} initialSchoolSlug={schoolParam} />
      </div>

      <Card className="space-y-2">
        <h3 className="text-lg font-semibold text-ink">¿Qué sigue después de enviar?</h3>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>1. Verificamos titularidad y datos institucionales.</li>
          <li>2. Te habilitamos acceso a dashboard de colegio.</li>
          <li>3. Configuramos perfil público, leads y métricas.</li>
        </ul>
      </Card>
    </section>
  );
}
