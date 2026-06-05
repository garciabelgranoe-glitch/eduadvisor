import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Cómo funciona el Score R.E.",
  description: "El Score R.E. es el indicador de calidad de Radar Educativo. Entendé cómo se calcula y qué significa para elegir un colegio.",
  canonicalPath: "/score-re"
});

const COMPONENTS = [
  {
    weight: "70%",
    label: "Rating de Google",
    color: "bg-brand-700",
    description:
      "Tomamos el rating promedio de Google Maps del colegio y lo combinamos con la cantidad de reseñas para medir qué tan confiable es ese dato. Un colegio con 4.8 estrellas y 200 reseñas pesa mucho más que uno con 5 estrellas y 2 reseñas."
  },
  {
    weight: "20%",
    label: "Perfil completo",
    color: "bg-brand-500",
    description:
      "Evaluamos qué tan completa está la información institucional: descripción, teléfono, sitio web, email, logo y niveles educativos. Un perfil completo le da a las familias los datos que necesitan para tomar una decisión informada."
  },
  {
    weight: "10%",
    label: "Perfil verificado",
    color: "bg-brand-300",
    description:
      "Los colegios que reclamaron y verificaron su perfil en Radar Educativo reciben puntos adicionales. Esto indica que la institución está activa y comprometida con brindar información actualizada a las familias."
  }
];

export default function ScoreRePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">

      {/* Header */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-brand-700">Metodología</p>
        <h1 className="font-display text-4xl text-ink">Cómo funciona el Score R.E.</h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          El Score R.E. resume la calidad de cada institución en un número del <strong>0 al 100</strong>. Es una herramienta orientativa para comparar colegios de forma rápida y objetiva.
        </p>
      </div>

      {/* Score visual example */}
      <Card className="flex items-center gap-6 border-brand-100 bg-brand-50/40 p-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
          <div className="text-center">
            <p className="text-2xl font-bold leading-none">78</p>
            <p className="mt-0.5 text-[9px] uppercase tracking-widest text-white/75">Score R.E.</p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-ink">¿Qué significa este número?</p>
          <p className="text-sm text-slate-600">
            Un score de <strong>78/100</strong> indica un colegio con buen rating en Google, perfil bien completo y presencia activa en la plataforma. Cuanto más alto, mayor la calidad percibida y la confiabilidad de los datos.
          </p>
        </div>
      </Card>

      {/* Components */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Los tres componentes</h2>
        <div className="space-y-4">
          {COMPONENTS.map((c) => (
            <Card key={c.label} className="space-y-3 border-brand-100 p-5">
              <div className="flex items-center gap-3">
                <span className={`${c.color} rounded-full px-3 py-1 text-sm font-bold text-white`}>{c.weight}</span>
                <h3 className="font-semibold text-ink">{c.label}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{c.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Bar chart visual */}
      <div className="space-y-3">
        <h2 className="font-display text-2xl text-ink">Distribución del puntaje</h2>
        <div className="space-y-2 rounded-xl border border-brand-100 bg-white p-5">
          {COMPONENTS.map((c) => (
            <div key={c.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">{c.label}</span>
                <span className="font-semibold text-ink">{c.weight}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full ${c.color}`}
                  style={{ width: c.weight }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interpretación */}
      <div className="space-y-4 text-slate-700 leading-relaxed">
        <h2 className="font-display text-2xl text-ink">Cómo interpretar el score</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { range: "75 – 100", label: "Excelente", color: "bg-emerald-700", desc: "Alta calidad percibida, perfil completo y buena reputación en Google." },
            { range: "50 – 74",  label: "Bueno",     color: "bg-brand-500",   desc: "Colegio con presencia sólida. Puede mejorar completando su perfil." },
            { range: "0 – 49",   label: "Básico",    color: "bg-slate-400",   desc: "Pocos datos disponibles. Recomendamos consultar directamente al colegio." }
          ].map((item) => (
            <Card key={item.range} className="space-y-2 border-brand-100 p-4">
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="font-semibold text-ink">{item.label}</span>
              </div>
              <p className="text-xs font-mono text-brand-700">{item.range} puntos</p>
              <p className="text-xs text-slate-600">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Aclaración */}
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <p className="font-semibold">Importante</p>
        <p>
          El Score R.E. es un <strong>indicador orientativo</strong>, no una certificación oficial ni una evaluación pedagógica. No reemplaza la visita al colegio ni el diálogo con la institución. Te ayuda a priorizar opciones, no a decidir solo con un número.
        </p>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-4">
        <h2 className="font-display text-2xl text-ink">¿Sos un colegio?</h2>
        <p className="text-slate-600">
          Verificá tu perfil, completá tu información y mejorá tu Score R.E. Es gratis y te da visibilidad ante miles de familias que buscan colegio cada mes.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/para-colegios">Quiero verificar mi colegio</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/search">Buscar colegios</Link>
          </Button>
        </div>
      </div>

    </div>
  );
}
