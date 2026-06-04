import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Política de Privacidad",
  description: "Conocé cómo Radar Educativo recopila, usa y protege tu información personal.",
  canonicalPath: "/privacidad"
});

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-brand-700">Legal</p>
        <h1 className="font-display text-4xl text-ink">Política de Privacidad</h1>
        <p className="text-slate-500">Última actualización: junio 2025</p>
      </div>

      <div className="space-y-6 text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">1. Quiénes somos</h2>
          <p>
            Radar Educativo es una plataforma digital que ayuda a familias argentinas a descubrir, comparar y elegir colegios privados. Operamos en <strong>radareducativo.com</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">2. Qué información recopilamos</h2>
          <p>Recopilamos información cuando:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Creás una cuenta o iniciás sesión (email, nombre)</li>
            <li>Completás un formulario de contacto con un colegio (nombre, email, teléfono)</li>
            <li>Dejás una reseña (tu email y contenido de la reseña)</li>
            <li>Navegás el sitio (datos de uso anónimos para mejorar la experiencia)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">3. Cómo usamos tu información</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Para conectarte con colegios de tu interés cuando enviás un formulario de contacto</li>
            <li>Para personalizar tu experiencia en el sitio</li>
            <li>Para enviarte comunicaciones relacionadas con tu actividad (con tu consentimiento)</li>
            <li>Para mejorar nuestros servicios y funcionalidades</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">4. Compartimos tu información</h2>
          <p>
            Cuando completás un formulario de contacto con un colegio, compartimos tus datos (nombre, email, teléfono) con esa institución para que puedan responderte. <strong>No vendemos ni comercializamos tu información personal a terceros.</strong>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">5. Cookies y tecnologías de seguimiento</h2>
          <p>
            Utilizamos cookies propias para mantener tu sesión activa y cookies de análisis (PostHog) para entender cómo se usa el sitio de forma agregada y anónima.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">6. Seguridad</h2>
          <p>
            Tu información se transmite siempre bajo conexión HTTPS cifrada. Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra acceso no autorizado.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">7. Tus derechos</h2>
          <p>Podés ejercer en cualquier momento los siguientes derechos sobre tu información:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Acceso:</strong> conocer qué datos tenemos sobre vos</li>
            <li><strong>Rectificación:</strong> corregir datos incorrectos</li>
            <li><strong>Eliminación:</strong> solicitar que borremos tu información</li>
          </ul>
          <p>Para ejercer estos derechos escribinos a <a href="mailto:soporte@radareducativo.com" className="text-brand-700 underline underline-offset-2">soporte@radareducativo.com</a>.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">8. Cambios a esta política</h2>
          <p>
            Podemos actualizar esta política de privacidad. Te notificaremos cambios significativos publicando la nueva versión en esta página con la fecha de actualización.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">9. Contacto</h2>
          <p>
            Para cualquier consulta sobre esta política escribinos a{" "}
            <a href="mailto:soporte@radareducativo.com" className="text-brand-700 underline underline-offset-2">
              soporte@radareducativo.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
