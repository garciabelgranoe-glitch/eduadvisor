import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Términos de Uso",
  description: "Condiciones de uso de Radar Educativo para familias y colegios.",
  canonicalPath: "/terminos"
});

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-brand-700">Legal</p>
        <h1 className="font-display text-4xl text-ink">Términos de Uso</h1>
        <p className="text-slate-500">Última actualización: junio 2025</p>
      </div>

      <div className="space-y-6 text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">1. Aceptación de los términos</h2>
          <p>
            Al usar Radar Educativo (<strong>radareducativo.com</strong>) aceptás estos términos de uso. Si no estás de acuerdo, por favor no uses el sitio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">2. Descripción del servicio</h2>
          <p>
            Radar Educativo es una plataforma de información educativa que permite a familias buscar, comparar y contactar colegios privados en Argentina. También ofrece herramientas de gestión a instituciones educativas que reclaman su perfil.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">3. Uso aceptado</h2>
          <p>Al usar el sitio te comprometés a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>No publicar información falsa, engañosa o difamatoria</li>
            <li>No usar el sitio para spam o comunicaciones no solicitadas</li>
            <li>No intentar acceder a partes del sistema sin autorización</li>
            <li>Brindar información verídica al completar formularios de contacto</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">4. Información de los colegios</h2>
          <p>
            Los perfiles de colegios en Radar Educativo combinan datos de fuentes públicas (Google Maps, sitios oficiales) con información provista por las propias instituciones. <strong>Radar Educativo no garantiza la exactitud ni vigencia de los datos.</strong> Recomendamos verificar la información directamente con cada institución antes de tomar decisiones.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">5. Reseñas y contenido de usuarios</h2>
          <p>
            Las reseñas reflejan opiniones personales de usuarios y no representan la posición de Radar Educativo. Nos reservamos el derecho de moderar o eliminar contenido que viole estos términos o sea considerado inapropiado.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">6. Score Radar Educativo</h2>
          <p>
            El Score R.E. es un indicador orientativo calculado en base a múltiples variables de cada institución. No constituye una certificación oficial ni una recomendación definitiva. Es una herramienta de ayuda para la toma de decisiones.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">7. Colegios — Perfil Premium</h2>
          <p>
            Los colegios que contratan el plan Premium acceden a funcionalidades adicionales de gestión y visibilidad. Los pagos son procesados de forma segura por Stripe. Las condiciones específicas del servicio para instituciones se detallan al momento de la contratación.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">8. Propiedad intelectual</h2>
          <p>
            El diseño, código, logo y contenidos propios de Radar Educativo son propiedad de sus creadores. No podés reproducirlos sin autorización expresa.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">9. Limitación de responsabilidad</h2>
          <p>
            Radar Educativo no es responsable por decisiones tomadas en base a la información del sitio, ni por problemas derivados del vínculo entre familias e instituciones educativas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">10. Contacto</h2>
          <p>
            Para consultas sobre estos términos escribinos a{" "}
            <a href="mailto:hola@radareducativo.com" className="text-brand-700 underline underline-offset-2">
              hola@radareducativo.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
