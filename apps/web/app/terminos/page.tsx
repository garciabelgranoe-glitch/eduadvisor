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
        <p className="text-slate-500">Última actualización: junio 2026</p>
      </div>

      <div className="space-y-6 text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">1. Aceptación de los términos</h2>
          <p>
            Al acceder o usar Radar Educativo (<strong>radareducativo.com</strong>) aceptás estos Términos de Uso en su totalidad. Si no estás de acuerdo con alguna de estas condiciones, por favor no uses el sitio. El uso continuado del sitio implica la aceptación de cualquier modificación que realicemos a estos términos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">2. Descripción del servicio</h2>
          <p>
            Radar Educativo es una plataforma de información educativa que permite a familias buscar, comparar y contactar colegios privados en Argentina. También ofrece herramientas de gestión y visibilidad a instituciones educativas que reclaman su perfil.
          </p>
          <p>
            El servicio se presta "tal cual está disponible". Nos reservamos el derecho de modificar, suspender o discontinuar cualquier funcionalidad en cualquier momento, con o sin previo aviso.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">3. Uso aceptado</h2>
          <p>Al usar el sitio te comprometés a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>No publicar información falsa, engañosa o difamatoria sobre ninguna institución educativa</li>
            <li>No usar el sitio para spam, comunicaciones no solicitadas o fines comerciales no autorizados</li>
            <li>No intentar acceder a secciones del sistema sin autorización, ni realizar ingeniería inversa del software</li>
            <li>No realizar scraping automatizado ni uso masivo de la API sin autorización previa</li>
            <li>Brindar información veraz al completar formularios de contacto o de claim de perfil</li>
            <li>No suplantar la identidad de otra persona o institución</li>
          </ul>
          <p>
            El incumplimiento de cualquiera de estas condiciones puede resultar en la suspensión inmediata del acceso al servicio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">4. Información de los colegios</h2>
          <p>
            Los perfiles de colegios en Radar Educativo combinan datos de fuentes públicas (Google Maps, sitios web oficiales, registros públicos) con información provista por las propias instituciones. <strong>Radar Educativo no garantiza la exactitud, completitud ni vigencia de los datos publicados.</strong>
          </p>
          <p>
            Recomendamos verificar toda la información directamente con cada institución antes de tomar decisiones vinculantes. Radar Educativo no se responsabiliza por errores u omisiones en los datos publicados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">5. Claim de perfil institucional</h2>
          <p>
            Las instituciones educativas pueden reclamar la titularidad de su perfil ("claim") completando el proceso de verificación correspondiente. Al hacer el claim, la institución:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Declara tener autorización para representar a la institución en la plataforma</li>
            <li>Acepta la responsabilidad por el contenido que publique en su perfil</li>
            <li>Se compromete a mantener la información actualizada y veraz</li>
            <li>Acepta que Radar Educativo puede rechazar o revocar el claim si detecta información falsa o uso indebido</li>
          </ul>
          <p>
            Radar Educativo se reserva el derecho de verificar la identidad del representante por los medios que considere adecuados antes de aprobar el claim.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">6. Baja de perfil institucional</h2>
          <p>
            Cualquier institución educativa tiene derecho a solicitar la eliminación de su perfil de Radar Educativo escribiendo a{" "}
            <a href="mailto:soporte@radareducativo.com" className="text-brand-700 underline underline-offset-2">
              soporte@radareducativo.com
            </a>{" "}
            indicando el nombre de la institución y los datos de contacto del solicitante. Procesaremos la solicitud dentro de los <strong>10 días hábiles</strong> de recibida y confirmaremos la baja por email.
          </p>
          <p>
            La eliminación del perfil no implica la devolución de pagos realizados por servicios Premium ya prestados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">7. Reseñas y contenido de usuarios</h2>
          <p>
            Las reseñas y comentarios publicados en Radar Educativo reflejan opiniones personales de sus autores y no representan la posición de Radar Educativo. Al publicar una reseña, el usuario:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Declara que su experiencia es auténtica y verídica</li>
            <li>Acepta que la reseña puede ser moderada o eliminada si viola estos términos</li>
            <li>Cede a Radar Educativo el derecho de publicar y mostrar dicho contenido en la plataforma</li>
          </ul>
          <p>Nos reservamos el derecho de moderar o eliminar sin previo aviso cualquier reseña que:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Contenga información falsa, difamatoria o malintencionada</li>
            <li>Incluya lenguaje ofensivo, discriminatorio o violento</li>
            <li>Sea identificada como spam o reseña falsa</li>
            <li>Viole la privacidad de terceros (nombres de docentes, menores, etc.)</li>
            <li>Tenga un conflicto de interés evidente (reseñas de competidores, ex-empleados, etc.)</li>
          </ul>
          <p>
            Las instituciones pueden reportar reseñas que consideren inapropiadas a{" "}
            <a href="mailto:soporte@radareducativo.com" className="text-brand-700 underline underline-offset-2">
              soporte@radareducativo.com
            </a>. Revisaremos cada reporte en un plazo máximo de <strong>5 días hábiles</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">8. Score Radar Educativo</h2>
          <p>
            El Score R.E. es un indicador orientativo calculado en base a múltiples variables de cada institución (completitud del perfil, reseñas, nivel de interacción, entre otros). <strong>No constituye una certificación oficial, acreditación educativa ni una recomendación definitiva.</strong> Es una herramienta de referencia para ayudar a las familias en su proceso de búsqueda.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">9. Plan Premium para instituciones</h2>
          <p>
            Los colegios que contratan el plan Premium acceden a funcionalidades adicionales de gestión y visibilidad. Al contratar el plan:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Los pagos son procesados de forma segura por Stripe. Radar Educativo no almacena datos de tarjetas de crédito.</li>
            <li>Los planes se facturan de forma mensual o anual según lo acordado al momento de la contratación.</li>
            <li>La cancelación del plan puede realizarse en cualquier momento. El acceso a las funcionalidades Premium se mantiene hasta el fin del período facturado.</li>
            <li>No se realizan reembolsos por períodos parciales salvo disposición legal en contrario.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">10. Comunicaciones y email marketing</h2>
          <p>
            Al usar la plataforma o completar formularios, podés recibir comunicaciones de Radar Educativo relacionadas con el servicio. Las comunicaciones de marketing son siempre opcionales y podés cancelar la suscripción en cualquier momento haciendo click en el enlace de baja incluido en cada email, o escribiendo a{" "}
            <a href="mailto:soporte@radareducativo.com" className="text-brand-700 underline underline-offset-2">
              soporte@radareducativo.com
            </a>.
          </p>
          <p>
            Las instituciones educativas que figuran en la plataforma pueden recibir comunicaciones relacionadas con la gestión de su perfil. Estas comunicaciones no son de carácter comercial y se realizan en el marco legítimo de la operación de la plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">11. Suspensión de cuentas</h2>
          <p>
            Radar Educativo puede suspender o cancelar el acceso de cualquier usuario o institución, de forma temporal o permanente, ante:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Violación de estos términos de uso</li>
            <li>Publicación de contenido falso o malintencionado</li>
            <li>Uso fraudulento del sistema de claims o reseñas</li>
            <li>Falta de pago de servicios contratados</li>
          </ul>
          <p>
            En casos graves, la suspensión puede ser inmediata y sin previo aviso. En casos menores, notificaremos al usuario antes de tomar acción.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">12. Propiedad intelectual</h2>
          <p>
            El diseño, código, logo, nombre comercial, estructura y contenidos propios de Radar Educativo son propiedad exclusiva de sus creadores y están protegidos por la legislación argentina de propiedad intelectual. Queda prohibida su reproducción, distribución o uso sin autorización expresa y escrita.
          </p>
          <p>
            El contenido aportado por usuarios (reseñas, fotos, descripciones) es responsabilidad de cada autor. Al publicarlo en la plataforma, el autor otorga a Radar Educativo una licencia no exclusiva, gratuita y mundial para mostrarlo, reproducirlo y distribuirlo dentro del servicio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">13. Limitación de responsabilidad</h2>
          <p>
            En la máxima medida permitida por la ley aplicable, Radar Educativo no será responsable por:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Decisiones tomadas en base a la información publicada en el sitio</li>
            <li>Problemas derivados del vínculo entre familias e instituciones educativas</li>
            <li>Interrupciones del servicio por causas técnicas, de mantenimiento o de fuerza mayor</li>
            <li>Contenido publicado por terceros (usuarios, instituciones) en la plataforma</li>
            <li>Daños indirectos, incidentales o consecuentes de cualquier tipo</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">14. Jurisdicción y ley aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia derivada del uso de la plataforma será sometida a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando las partes a cualquier otro fuero que pudiera corresponderles.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">15. Contacto</h2>
          <p>
            Para consultas sobre estos términos escribinos a{" "}
            <a href="mailto:soporte@radareducativo.com" className="text-brand-700 underline underline-offset-2">
              soporte@radareducativo.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
