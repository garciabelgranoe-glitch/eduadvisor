import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Sobre Radar Educativo",
  description: "Conocé qué es Radar Educativo, cómo funciona y por qué lo creamos para ayudar a las familias argentinas a elegir mejor.",
  canonicalPath: "/sobre-nosotros"
});

export default function SobreNosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-12">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-brand-700">Quiénes somos</p>
        <h1 className="font-display text-4xl text-ink">Radar Educativo</h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          Ayudamos a las familias argentinas a encontrar el colegio privado que mejor se adapta a sus necesidades, con datos reales y sin perder tiempo.
        </p>
      </div>

      <div className="space-y-4 text-slate-700 leading-relaxed">
        <h2 className="font-display text-2xl text-ink">El problema que resolvemos</h2>
        <p>
          Elegir un colegio privado en Argentina es una de las decisiones más importantes para una familia. Sin embargo, la información está dispersa, es difícil de comparar y muchas veces está desactualizada.
        </p>
        <p>
          Hasta ahora, las familias dependían del boca a boca, de buscar en Google sin criterio, o de visitar cada colegio sin saber si valía la pena. <strong>Radar Educativo cambia eso.</strong>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: "🔍",
            title: "Buscá con criterio",
            description: "Filtrá por ciudad, nivel educativo, cuota estimada y más para encontrar opciones realmente relevantes para tu familia."
          },
          {
            icon: "⚖️",
            title: "Compará en un vistazo",
            description: "Ponemos los datos clave lado a lado para que puedas comparar colegios sin abrir diez pestañas distintas."
          },
          {
            icon: "📊",
            title: "Decidí con datos",
            description: "El Score R.E. resume la calidad de cada institución en un número claro, combinando múltiples factores objetivos."
          }
        ].map((item) => (
          <Card key={item.title} className="space-y-2 border-brand-100">
            <p className="text-2xl">{item.icon}</p>
            <h3 className="font-semibold text-ink">{item.title}</h3>
            <p className="text-sm text-slate-600">{item.description}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-4 text-slate-700 leading-relaxed">
        <h2 className="font-display text-2xl text-ink">Para las instituciones</h2>
        <p>
          Radar Educativo también es una herramienta para los colegios. Las instituciones pueden reclamar su perfil, actualizar su información, cargar fotos y gestionar contactos desde su panel propio.
        </p>
        <p>
          Los colegios con perfil Premium aparecen con mayor visibilidad en los resultados y acceden a herramientas de análisis para entender cómo las familias los encuentran.
        </p>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-6 space-y-4">
        <h2 className="font-display text-2xl text-ink">¿Preguntas?</h2>
        <p className="text-slate-600">
          Escribinos a{" "}
          <a href="mailto:hola@radareducativo.com" className="text-brand-700 underline underline-offset-2 font-medium">
            hola@radareducativo.com
          </a>{" "}
          — respondemos todas las consultas.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/search">Buscar colegios</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/para-colegios">Soy un colegio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
