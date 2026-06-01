import Link from "next/link";
import type { Metadata } from "next";
import { SchoolPublishForm } from "@/components/sections/school-publish-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { pickParam, type RawSearchParams } from "@/lib/query-params";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Para colegios — Recibí consultas de familias con intención real",
  description:
    "Publicá o reclamá el perfil de tu colegio en EduAdvisor. Accedé a leads de matrícula, analytics y herramientas para convertir más familias.",
  canonicalPath: "/para-colegios"
});

interface ForSchoolsPageProps {
  searchParams?: RawSearchParams;
}

const freeFeatures = [
  "Presencia básica en el catálogo",
  "Datos institucionales iniciales",
  "Aparición en resultados de búsqueda"
];

const premiumFeatures = [
  { icon: "📥", text: "Formulario de contacto activo para consultas de matrícula" },
  { icon: "🗂️", text: "Panel de leads con pipeline de seguimiento" },
  { icon: "📸", text: "Galería de fotos institucionales destacadas" },
  { icon: "🏅", text: "Logo e identidad visual en búsquedas y rankings" },
  { icon: "📊", text: "Estadísticas de visitas y tasa de conversión" },
  { icon: "💬", text: "Respuesta a reseñas de familias" },
  { icon: "📤", text: "Exportación de leads a CSV" },
  { icon: "⚡", text: "Activación en 72 horas hábiles" },
];

const steps = [
  {
    number: "01",
    title: "Reclamá o publicá tu colegio",
    description: "Completá el formulario con los datos institucionales. Verificamos titularidad en menos de 72 horas hábiles."
  },
  {
    number: "02",
    title: "Completá tu perfil con fotos",
    description: "Subí logo, galería de fotos y describí tu propuesta educativa. Los perfiles con imágenes reciben hasta 3× más consultas."
  },
  {
    number: "03",
    title: "Gestioná leads desde el panel",
    description: "Las familias te contactan desde tu perfil. Seguí cada lead en el pipeline y convertí consultas en matrículas."
  }
];

const faqs = [
  {
    q: "¿Cuánto cuesta el plan Premium?",
    a: "El precio varía según el tamaño del colegio y el mercado. Contactanos al enviar el formulario y te enviamos una propuesta personalizada."
  },
  {
    q: "¿Ya tengo un perfil creado en EduAdvisor?",
    a: "Probablemente sí — importamos datos de fuentes públicas. Reclamá el perfil para tomar el control y activar las funciones comerciales."
  },
  {
    q: "¿Qué pasa si no quiero activar Premium?",
    a: "Podés mantener un perfil gratuito con visibilidad básica sin costo. El Premium solo se activa si decidís contratar."
  },
  {
    q: "¿Cómo funciona el pipeline de leads?",
    a: "Cada consulta entra a tu panel con los datos de la familia. Podés moverla entre etapas (nuevo → contactado → visita → matrícula) y exportar el listado completo."
  }
];

export default function ForSchoolsPage({ searchParams }: ForSchoolsPageProps) {
  const flowParam = pickParam(searchParams?.flow);
  const schoolParam = pickParam(searchParams?.school);
  const initialFlow = flowParam === "claim" ? "claim" : "publish";

  return (
    <div className="space-y-20">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 px-6 py-14 text-white shadow-[0_24px_60px_rgba(31,92,77,0.35)] sm:px-10 md:px-14 md:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-0 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="relative max-w-3xl space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
            Para colegios privados · Argentina
          </p>
          <h1 className="font-display text-3xl leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Las familias ya están
            <br />buscando.
            <br />
            <span className="text-amber-300">¿Tu colegio aparece?</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            EduAdvisor conecta colegios privados con padres que ya tienen intención de consulta.
            Publicá tu perfil, recibí leads calificados y gestioná todo desde un panel.
          </p>

          <div className="flex flex-wrap gap-6 pt-2">
            <div>
              <p className="text-2xl font-bold text-white">+688</p>
              <p className="text-sm text-white/60">colegios en catálogo</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold text-white">20</p>
              <p className="text-sm text-white/60">ciudades cubiertas</p>
            </div>
            <div className="w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold text-white">72 hs</p>
              <p className="text-sm text-white/60">tiempo de activación</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="h-12 bg-amber-400 px-7 text-amber-950 hover:bg-amber-300">
              <a href="#solicitud-colegio">Publicar mi colegio gratis</a>
            </Button>
            <Link
              href="/ingresar?next=/school-dashboard"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/40 px-7 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Ya tengo cuenta →
            </Link>
          </div>
        </div>
      </section>

      {/* ── LEADS — sección central ── */}
      <section className="space-y-10">
        <div className="text-center">
          <p className="ea-kicker mb-2">Por qué EduAdvisor</p>
          <h2 className="font-display text-4xl text-ink">
            Leads con intención real,<br className="hidden sm:block" /> no clicks sin contexto
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Las familias llegan a tu perfil ya filtradas por zona, nivel y presupuesto.
            No comprás publicidad genérica — recibís consultas de padres listos para decidir.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Card className="space-y-3 border-brand-200">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-2xl">📥</div>
            <h3 className="font-display text-xl text-ink">Captá consultas directo</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              El formulario de contacto del perfil Premium activa un canal de entrada directo. Cada consulta llega con nombre, email, nivel de interés y mensaje de la familia.
            </p>
          </Card>
          <Card className="space-y-3 border-amber-200 bg-amber-50/40">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-2xl">🗂️</div>
            <h3 className="font-display text-xl text-ink">Pipeline de seguimiento</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Gestioná cada lead desde el panel: etapas de nuevo → contactado → visita → matrícula. Nunca pierdas una oportunidad por falta de seguimiento.
            </p>
          </Card>
          <Card className="space-y-3 border-brand-200">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-2xl">📊</div>
            <h3 className="font-display text-xl text-ink">Medí tu conversión</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Accedés a estadísticas de visitas, comparaciones y tasa de contacto. Sabés exactamente cuántas familias vieron tu perfil y cuántas consultaron.
            </p>
          </Card>
        </div>

        {/* Mock pipeline visual */}
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-slate-50 to-brand-50/30 p-6 shadow-[0_8px_24px_rgba(13,27,31,0.06)]">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-700">Panel de leads — vista del colegio</p>
          <div className="grid gap-3 md:grid-cols-4">
            {[
              { stage: "Nuevos", color: "bg-slate-100 border-slate-200", dot: "bg-slate-400", count: 3 },
              { stage: "Contactados", color: "bg-blue-50 border-blue-200", dot: "bg-blue-400", count: 5 },
              { stage: "Visita agendada", color: "bg-amber-50 border-amber-200", dot: "bg-amber-400", count: 2 },
              { stage: "Matrícula", color: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500", count: 4 },
            ].map(({ stage, color, dot, count }) => (
              <div key={stage} className={`rounded-xl border p-3 ${color}`}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  <span className="text-xs font-semibold text-slate-600">{stage}</span>
                  <span className="ml-auto rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-slate-500">{count}</span>
                </div>
                {Array.from({ length: count }).map((_, i) => (
                  <div key={i} className="mb-2 rounded-lg bg-white/80 p-2 shadow-sm">
                    <div className="mb-1 h-2 w-3/4 rounded bg-slate-200" />
                    <div className="h-2 w-1/2 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">Representación visual del panel de gestión de leads Premium</p>
        </div>
      </section>

      {/* ── FOTOS ── */}
      <section className="space-y-8">
        <div className="text-center">
          <p className="ea-kicker mb-2">Perfil completo</p>
          <h2 className="font-display text-4xl text-ink">
            Las fotos convierten.<br className="hidden sm:block" /> El texto informa.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Los perfiles con galería de fotos reciben significativamente más consultas.
            Mostrá instalaciones, aulas y espacios deportivos antes de que la familia llegue a la puerta.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Sin fotos */}
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">Perfil básico</span>
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-100" />
                <div className="space-y-1">
                  <div className="h-3 w-32 rounded bg-slate-200" />
                  <div className="h-2 w-20 rounded bg-slate-100" />
                </div>
              </div>
              <div className="mb-3 space-y-2">
                <div className="h-2 w-full rounded bg-slate-100" />
                <div className="h-2 w-5/6 rounded bg-slate-100" />
                <div className="h-2 w-4/6 rounded bg-slate-100" />
              </div>
              <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8">
                <p className="text-xs text-slate-400">Sin fotos institucionales</p>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400">Menor tasa de contacto · Perfil genérico</p>
          </div>

          {/* Con fotos Premium */}
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs">Perfil Premium</span>
            </p>
            <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white p-4 shadow-[0_8px_24px_rgba(161,98,7,0.12)]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-lg font-bold text-amber-700">C</div>
                <div className="space-y-1">
                  <div className="h-3 w-36 rounded bg-slate-200" />
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Premium ✓</span>
                </div>
              </div>
              <div className="mb-3 space-y-2">
                <div className="h-2 w-full rounded bg-slate-100" />
                <div className="h-2 w-5/6 rounded bg-slate-100" />
              </div>
              {/* Galería simulada */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="col-span-2 h-24 rounded-lg bg-gradient-to-br from-brand-200 to-brand-300" />
                <div className="space-y-1.5">
                  <div className="h-[44px] rounded-lg bg-gradient-to-br from-amber-100 to-amber-200" />
                  <div className="h-[44px] rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200" />
                </div>
              </div>
              <div className="mt-3">
                <div className="rounded-lg bg-brand-600 py-2 text-center text-xs font-semibold text-white">
                  Consultar vacantes →
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-amber-700 font-medium">Mayor atención · Más consultas · Mejor primera impresión</p>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="space-y-10">
        <div className="text-center">
          <p className="ea-kicker mb-2">Proceso</p>
          <h2 className="font-display text-4xl text-ink">Activación en 3 pasos</h2>
        </div>

        <div className="relative grid gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent md:block" />
          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center gap-4 text-center">
              <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-2 border-brand-200 bg-white shadow-[0_8px_24px_rgba(31,92,77,0.12)]">
                <span className="font-display text-xl font-bold text-brand-700">{step.number}</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-lg text-ink">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild className="h-11 px-8">
            <a href="#solicitud-colegio">Empezar ahora — es gratis</a>
          </Button>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="planes" className="space-y-8 scroll-mt-8">
        <div className="text-center">
          <p className="ea-kicker mb-2">Planes</p>
          <h2 className="font-display text-4xl text-ink">Free para siempre. Premium cuando estés listo.</h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-600">
            Empezá gratis, sin tarjeta. Activá Premium cuando quieras empezar a recibir leads y medir resultados.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
          {/* Free */}
          <Card className="flex flex-col space-y-5 border-slate-200 bg-slate-50/60">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Gratis</p>
              <p className="mt-1 font-display text-3xl text-ink">$0</p>
              <p className="mt-1 text-sm text-slate-500">Sin costo, siempre</p>
            </div>
            <ul className="flex flex-1 flex-col gap-2">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-0.5 text-slate-400">○</span>
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="ghost" className="w-full">
              <a href="#solicitud-colegio">Crear perfil gratis</a>
            </Button>
          </Card>

          {/* Premium */}
          <Card className="relative flex flex-col space-y-5 border-amber-300 bg-gradient-to-b from-amber-50/80 to-white shadow-[0_16px_40px_rgba(161,98,7,0.15)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-amber-400 px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-900">
                Recomendado
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Premium</p>
              <p className="mt-1 font-display text-3xl text-ink">A consultar</p>
              <p className="mt-1 text-sm text-slate-500">Según tamaño y mercado del colegio</p>
            </div>
            <ul className="flex flex-1 flex-col gap-2">
              {premiumFeatures.map(({ icon, text }) => (
                <li key={text} className="flex items-start gap-2 text-sm text-amber-900">
                  <span className="mt-0.5 text-base leading-none">{icon}</span>
                  {text}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full bg-amber-400 text-amber-950 hover:bg-amber-300">
              <a href="#solicitud-colegio">Quiero activar Premium</a>
            </Button>
          </Card>
        </div>
      </section>

      {/* ── FORMULARIO ── */}
      <section id="solicitud-colegio" className="scroll-mt-8 space-y-6">
        <div className="text-center">
          <p className="ea-kicker mb-2">Empezar</p>
          <h2 className="font-display text-4xl text-ink">Publicá o reclamá tu colegio</h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-600">
            Completá el formulario y nos contactamos en menos de 72 horas hábiles para activar tu perfil.
          </p>
        </div>
        <SchoolPublishForm initialFlow={initialFlow} initialSchoolSlug={schoolParam} />
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-2xl space-y-6">
        <h2 className="font-display text-center text-3xl text-ink">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.q} className="space-y-2 border-brand-100">
              <h3 className="font-semibold text-ink">{faq.q}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{faq.a}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CIERRE ── */}
      <section className="rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-amber-50 px-8 py-12 text-center shadow-[0_8px_24px_rgba(13,27,31,0.06)]">
        <h2 className="font-display text-4xl text-ink">
          Las familias buscan hoy.
          <br />
          <span className="text-brand-700">Aparecé mañana.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-slate-600">
          Activación gratuita, sin costo de alta. Empezá con perfil básico y escalá cuando veas resultados.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="h-12 px-8">
            <a href="#solicitud-colegio">Publicar mi colegio</a>
          </Button>
          <Button asChild variant="secondary" className="h-12 px-6">
            <Link href="/ingresar?next=/school-dashboard">Entrar al panel →</Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
