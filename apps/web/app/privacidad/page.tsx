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
        <p className="text-slate-500">Última actualización: junio 2026</p>
      </div>

      <div className="space-y-6 text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">1. Responsable del tratamiento</h2>
          <p>
            El responsable del tratamiento de los datos personales recopilados a través de esta plataforma es <strong>Radar Educativo</strong>, operado desde la República Argentina. Para cualquier consulta relacionada con tus datos podés contactarnos en{" "}
            <a href="mailto:soporte@radareducativo.com" className="text-brand-700 underline underline-offset-2">
              soporte@radareducativo.com
            </a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">2. Marco legal</h2>
          <p>
            Esta política se rige por la <strong>Ley 25.326 de Protección de los Datos Personales</strong> de la República Argentina y su decreto reglamentario 1558/2001. El tratamiento de datos personales se realiza únicamente con bases legales válidas: consentimiento del titular, ejecución de un contrato, interés legítimo o cumplimiento de una obligación legal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">3. Qué información recopilamos</h2>
          <p><strong>Datos que nos proporcionás directamente:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Al crear una cuenta o iniciar sesión: email y nombre</li>
            <li>Al completar un formulario de contacto con un colegio: nombre, email y teléfono</li>
            <li>Al reclamar un perfil institucional (claim): nombre del representante, email, teléfono y cargo</li>
            <li>Al dejar una reseña: email y contenido de la reseña</li>
            <li>Al contratar el plan Premium: datos de facturación procesados por Stripe</li>
          </ul>
          <p className="mt-2"><strong>Datos que recopilamos automáticamente:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Datos de navegación anónimos: páginas visitadas, tiempo de sesión, dispositivo y navegador</li>
            <li>Dirección IP (utilizada únicamente para geolocalización aproximada y seguridad)</li>
            <li>Cookies de sesión necesarias para el funcionamiento del sitio</li>
          </ul>
          <p className="mt-2"><strong>Datos de instituciones educativas:</strong></p>
          <p>
            Los perfiles de colegios publicados en la plataforma se construyen a partir de fuentes de acceso público (Google Maps, sitios web oficiales, registros públicos). Estos datos son de carácter institucional y no personal. Las instituciones pueden solicitar su modificación o eliminación en cualquier momento.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">4. Cómo usamos tu información</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Para conectarte con colegios de tu interés cuando enviás un formulario de contacto</li>
            <li>Para gestionar tu cuenta y el acceso al panel institucional</li>
            <li>Para procesar y verificar solicitudes de claim de perfil</li>
            <li>Para enviarte notificaciones transaccionales relacionadas con tu actividad en la plataforma</li>
            <li>Para enviarte comunicaciones de marketing, únicamente con tu consentimiento previo</li>
            <li>Para mejorar la experiencia del sitio mediante análisis de uso agregado y anónimo</li>
            <li>Para prevenir fraudes, abusos y garantizar la seguridad de la plataforma</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">5. Con quién compartimos tu información</h2>
          <p>
            Cuando completás un formulario de contacto con un colegio, compartimos tus datos (nombre, email, teléfono) con esa institución para que puedan responderte. <strong>No vendemos, alquilamos ni comercializamos tu información personal a terceros.</strong>
          </p>
          <p className="mt-2">Podemos compartir datos con terceros proveedores de servicios que actúan en nuestro nombre:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Resend</strong> — envío de emails transaccionales</li>
            <li><strong>Stripe</strong> — procesamiento de pagos (no accede a datos no relacionados con la transacción)</li>
            <li><strong>PostHog</strong> — análisis de uso anónimo</li>
            <li><strong>Google Analytics</strong> — métricas de tráfico web</li>
            <li><strong>Supabase</strong> — almacenamiento de archivos multimedia</li>
          </ul>
          <p className="mt-2">
            Todos estos proveedores están contractualmente obligados a tratar los datos únicamente para los fines indicados y con medidas de seguridad adecuadas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">6. Transferencia internacional de datos</h2>
          <p>
            Algunos de nuestros proveedores operan fuera de Argentina: los servidores de la API están alojados en <strong>Railway</strong> (Estados Unidos) y el almacenamiento de archivos en <strong>Supabase</strong> (Brasil). Estas transferencias se realizan con proveedores que aplican estándares de seguridad reconocidos internacionalmente. Al usar la plataforma aceptás que tus datos puedan ser procesados en estos países.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">7. Retención de datos</h2>
          <p>Conservamos tu información personal durante el tiempo necesario para cumplir con los fines indicados en esta política:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Cuentas de usuario:</strong> mientras la cuenta esté activa. Al solicitar la baja, eliminamos los datos personales dentro de los 30 días.</li>
            <li><strong>Formularios de contacto (leads):</strong> hasta 2 años desde su creación, o hasta que el usuario solicite su eliminación.</li>
            <li><strong>Datos de facturación:</strong> el tiempo que exija la normativa fiscal argentina (mínimo 5 años).</li>
            <li><strong>Registros de seguridad:</strong> hasta 12 meses.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">8. Cookies y tecnologías de seguimiento</h2>
          <p>Utilizamos los siguientes tipos de cookies:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Cookies esenciales:</strong> necesarias para el funcionamiento del sitio (sesión de usuario, preferencias). No pueden desactivarse.</li>
            <li><strong>Cookies analíticas:</strong> PostHog y Google Analytics, para entender cómo se usa el sitio de forma agregada. Pueden desactivarse sin afectar el funcionamiento.</li>
          </ul>
          <p>Podés gestionar las cookies desde la configuración de tu navegador.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">9. Seguridad</h2>
          <p>
            Toda la información se transmite bajo conexión <strong>HTTPS cifrada</strong>. Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos contra acceso no autorizado, alteración, divulgación o destrucción, incluyendo control de acceso por roles, monitoreo de actividad y backups periódicos.
          </p>
          <p>
            En caso de una brecha de seguridad que afecte tus datos personales, te notificaremos dentro de un plazo razonable conforme lo establece la normativa aplicable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">10. Tus derechos</h2>
          <p>Conforme a la Ley 25.326, podés ejercer en cualquier momento los siguientes derechos sobre tu información:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Acceso:</strong> conocer qué datos personales tenemos sobre vos</li>
            <li><strong>Rectificación:</strong> corregir datos incorrectos o desactualizados</li>
            <li><strong>Eliminación:</strong> solicitar que borremos tu información personal</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos para fines de marketing</li>
            <li><strong>Portabilidad:</strong> recibir una copia de tus datos en formato estructurado</li>
          </ul>
          <p>
            Para ejercer cualquiera de estos derechos escribinos a{" "}
            <a href="mailto:soporte@radareducativo.com" className="text-brand-700 underline underline-offset-2">
              soporte@radareducativo.com
            </a>{" "}
            indicando tu nombre, email y el derecho que querés ejercer. Responderemos dentro de los <strong>15 días hábiles</strong>.
          </p>
          <p>
            También podés presentar una queja ante la <strong>Dirección Nacional de Protección de Datos Personales</strong> (Argentina) si considerás que tus derechos no fueron respetados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">11. Email marketing y comunicaciones</h2>
          <p>
            Solo te enviamos emails de marketing si nos diste tu consentimiento explícito. Podés darte de baja en cualquier momento haciendo click en el enlace de cancelación incluido en cada email, o escribiéndonos a{" "}
            <a href="mailto:soporte@radareducativo.com" className="text-brand-700 underline underline-offset-2">
              soporte@radareducativo.com
            </a>.
          </p>
          <p>
            Las instituciones educativas que figuran en la plataforma pueden recibir comunicaciones relacionadas con la gestión de su perfil. Estas se realizan en el marco del interés legítimo de operar la plataforma y pueden solicitar la baja escribiéndonos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">12. Menores de edad</h2>
          <p>
            Radar Educativo no recopila intencionalmente datos personales de menores de 18 años. El servicio está dirigido a familias y responsables adultos. Si detectamos que hemos recopilado datos de un menor sin consentimiento parental, los eliminaremos de forma inmediata.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">13. Cambios a esta política</h2>
          <p>
            Podemos actualizar esta política de privacidad. Publicaremos la nueva versión en esta página con la fecha de actualización. Para cambios significativos que afecten tus derechos, te notificaremos por email con al menos 15 días de anticipación.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-xl text-ink">14. Contacto</h2>
          <p>
            Para cualquier consulta sobre esta política o el tratamiento de tus datos personales escribinos a{" "}
            <a href="mailto:soporte@radareducativo.com" className="text-brand-700 underline underline-offset-2">
              soporte@radareducativo.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
