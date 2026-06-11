/**
 * Script de outreach para incentivar a colegios a reclamar su perfil.
 *
 * Busca colegios CURATED de una ciudad que tengan email registrado
 * y les envía un email personalizado via Resend.
 *
 * Uso:
 *   RESEND_API_KEY=<key> ADMIN_API_KEY=<key> node scripts/outreach-claim.mjs --city=longchamps
 *   RESEND_API_KEY=<key> ADMIN_API_KEY=<key> node scripts/outreach-claim.mjs --city=mendoza --dry-run
 *
 * Flags:
 *   --city=NOMBRE     Ciudad a procesar (requerido)
 *   --dry-run         Muestra qué se enviaría sin enviar nada
 *   --limit=N         Máximo de emails a enviar (default: 50)
 */

// Resend se importa dinámicamente solo cuando no es dry-run
let Resend;
try {
  const mod = await import("../apps/api/node_modules/resend/dist/index.mjs").catch(
    () => import("../node_modules/resend/dist/index.mjs")
  );
  Resend = mod.Resend;
} catch {
  // No disponible — solo funciona en dry-run
}

const API_BASE = "https://eduadvisor-production.up.railway.app";
const SITE_URL = "https://radareducativo.com";
const FROM_EMAIL = "soporte@radareducativo.com";
const FROM_NAME = "Radar Educativo";

// Prueba social: colegios premium por ciudad
const PREMIUM_PROOF = {
  longchamps: "Colegio Mariano Moreno",
  mendoza: null,
  adrogue: null,
  guernica: null,
  default: null
};

// ─── Args ────────────────────────────────────────────────────────────────────

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(arg => arg.startsWith("--"))
    .map(arg => {
      const [key, value] = arg.slice(2).split("=");
      return [key, value ?? true];
    })
);

const CITY = args.city;
const DRY_RUN = args["dry-run"] === true || args["dry-run"] === "true";
const LIMIT = parseInt(args.limit ?? "50", 10);

if (!CITY) {
  console.error("❌  Falta --city=NOMBRE. Ejemplo: --city=longchamps");
  process.exit(1);
}

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY.");
  process.exit(1);
}

if (!RESEND_API_KEY && !DRY_RUN) {
  console.error("❌  Falta RESEND_API_KEY. Usá --dry-run para probar sin enviar.");
  process.exit(1);
}

const resend = (RESEND_API_KEY && Resend) ? new Resend(RESEND_API_KEY) : null;

// ─── Obtener colegios ─────────────────────────────────────────────────────────

async function getSchools(city) {
  const res = await fetch(
    `${API_BASE}/v1/admin/schools?q=${encodeURIComponent(city)}&limit=100&page=1`,
    { headers: { "x-admin-key": ADMIN_API_KEY } }
  );

  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

// ─── Template de email ────────────────────────────────────────────────────────

function buildEmail(school, cityName, proofSchool) {
  const profileUrl = `${SITE_URL}/ar/${encodeURIComponent(school.province?.toLowerCase().replace(/\s+/g, "-") ?? "argentina")}/${encodeURIComponent(cityName.toLowerCase().replace(/\s+/g, "-"))}/${school.slug}`;
  const claimUrl = `${SITE_URL}/para-colegios?flow=claim&school=${school.slug}`;

  const proofLine = proofSchool
    ? `<p style="margin: 0 0 8px;">📍 <strong>${proofSchool}</strong>, también de ${cityName}, ya gestiona su perfil y recibe consultas de familias a través de la plataforma.</p>`
    : `<p style="margin: 0 0 8px;">📍 Colegios de tu zona ya están gestionando sus perfiles y recibiendo consultas de familias interesadas.</p>`;

  const subject = `${school.name} ya tiene perfil en Radar Educativo`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; font-family: sans-serif; background: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">

    <!-- Header -->
    <div style="background: #0f4c3a; border-radius: 12px 12px 0 0; padding: 24px 32px;">
      <h1 style="margin: 0; color: white; font-size: 18px; font-weight: 700;">Radar Educativo</h1>
      <p style="margin: 4px 0 0; color: rgba(255,255,255,0.7); font-size: 13px;">La plataforma donde las familias eligen colegios</p>
    </div>

    <!-- Body -->
    <div style="background: white; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 32px;">

      <p style="margin: 0 0 16px; color: #1a1a1a;">Hola,</p>

      <p style="margin: 0 0 16px; color: #374151; line-height: 1.6;">
        Somos <strong>Radar Educativo</strong>, la plataforma donde las familias argentinas buscan y comparan colegios privados antes de inscribir a sus hijos.
      </p>

      <p style="margin: 0 0 16px; color: #374151; line-height: 1.6;">
        Creamos un perfil para <strong>${school.name}</strong> que ya está visible para padres que buscan opciones en ${cityName}:
      </p>

      <!-- CTA Ver perfil -->
      <div style="text-align: center; margin: 24px 0;">
        <a href="${profileUrl}"
           style="background: #f3f4f6; color: #0f4c3a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; border: 1px solid #d1d5db; display: inline-block;">
          Ver el perfil de ${school.name} →
        </a>
      </div>

      <!-- Prueba social -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 0 0 24px;">
        ${proofLine}
      </div>

      <!-- Beneficios del claim -->
      <p style="margin: 0 0 12px; font-weight: 600; color: #1a1a1a;">Reclamar tu perfil es gratis y te permite:</p>
      <ul style="margin: 0 0 24px; padding-left: 20px; color: #374151; line-height: 2;">
        <li>✏️ Actualizar descripción, cuotas, niveles y contacto</li>
        <li>📩 Recibir consultas de familias interesadas</li>
        <li>📊 Ver estadísticas de visitas a tu perfil</li>
      </ul>

      <!-- CTA Claim -->
      <div style="text-align: center; margin: 0 0 32px;">
        <a href="${claimUrl}"
           style="background: #0f4c3a; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block;">
          Reclamar perfil gratis →
        </a>
      </div>

      <!-- Premium upsell -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #1a1a1a;">¿Querés destacarte entre los colegios de la zona?</p>
        <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; line-height: 1.6;">
          Los colegios con <strong>perfil Premium</strong> aparecen primero en los resultados, muestran fotos institucionales y reciben leads de familias directamente. Respondé este email si querés conocer más.
        </p>
      </div>

      <!-- Footer del email -->
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
        <p style="margin: 0; font-size: 13px; color: #9ca3af;">
          El equipo de <a href="${SITE_URL}" style="color: #0f4c3a;">Radar Educativo</a> ·
          <a href="mailto:soporte@radareducativo.com" style="color: #9ca3af;">soporte@radareducativo.com</a>
        </p>
        <p style="margin: 8px 0 0; font-size: 11px; color: #d1d5db;">
          Recibiste este email porque tu institución figura en nuestra plataforma educativa.
          Si no querés recibir más comunicaciones escribinos a soporte@radareducativo.com.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, html, profileUrl, claimUrl };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const cityDisplay = CITY.charAt(0).toUpperCase() + CITY.slice(1);
const proofSchool = PREMIUM_PROOF[CITY.toLowerCase()] ?? PREMIUM_PROOF.default;

console.log(`\n📧  Outreach para colegios de ${cityDisplay}${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

const schools = await getSchools(CITY);

// Solo CURATED sin claim (no VERIFIED ni PREMIUM) y que tengan email
const targets = schools
  .filter(s => s.profileStatus === "CURATED" && s.email)
  .slice(0, LIMIT);

const skipped = schools.filter(s => s.profileStatus === "CURATED" && !s.email).length;
const alreadyClaimed = schools.filter(s => ["VERIFIED", "PREMIUM"].includes(s.profileStatus)).length;

console.log(`📊  Total encontrados: ${schools.length}`);
console.log(`✅  Ya reclamados/premium: ${alreadyClaimed}`);
console.log(`📧  Con email para enviar: ${targets.length}`);
console.log(`⚠️   Sin email (omitidos): ${skipped}\n`);

if (targets.length === 0) {
  console.log("No hay colegios para contactar.");
  process.exit(0);
}

let sent = 0;
let failed = 0;

for (const school of targets) {
  const cityName = school.city ?? cityDisplay;
  const { subject, html, profileUrl } = buildEmail(school, cityName, proofSchool);

  if (DRY_RUN) {
    console.log(`📨  [DRY RUN] ${school.name}`);
    console.log(`    Para: ${school.email}`);
    console.log(`    Asunto: ${subject}`);
    console.log(`    Perfil: ${profileUrl}\n`);
    sent++;
    continue;
  }

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: school.email,
      subject,
      html
    });

    if (error) {
      console.error(`❌  ${school.name} (${school.email}) — ${error.message}`);
      failed++;
    } else {
      console.log(`✅  ${school.name} → ${school.email}`);
      sent++;
    }

    // Pequeña pausa para no saturar la API
    await new Promise(r => setTimeout(r, 300));
  } catch (err) {
    console.error(`❌  ${school.name} — ${err.message}`);
    failed++;
  }
}

console.log(`\n✨  Listo. Enviados: ${sent} | Fallidos: ${failed}\n`);
