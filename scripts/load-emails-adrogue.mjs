/**
 * Carga emails para los colegios de Adrogué.
 * Uso: ADMIN_API_KEY=<key> node scripts/load-emails-adrogue.mjs
 *      ADMIN_API_KEY=<key> node scripts/load-emails-adrogue.mjs --dry-run
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

const DRY_RUN = process.argv.includes("--dry-run");

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY");
  process.exit(1);
}

const EMAILS = [
  { slug: "baby-school-escuela-montessoriana-adrogue",          email: "info@babyschool.com.ar" },
  { slug: "colegio-irlandes-adrogue",                           email: "info@colegioirlandes.edu.ar" },
  { slug: "colegio-modelo-marmol-adrogue",                      email: "recepcionmodelomarmol@gmail.com" },
  { slug: "colegio-newlands-adrogue",                           email: "info@colegionewlands.com.ar" },
  { slug: "colegio-nuestra-senora-de-lujan-adrogue-adrogue",    email: "secretariaprimaria@colegionslujan.edu.ar" },
  { slug: "colegio-san-miguel-adrogue",                         email: "secretaria@colegiosanmiguel.edu.ar" },
  { slug: "dejalo-ser-adrogue",                                 email: "info@institutodejaloser.com.ar" },
  { slug: "establecimiento-educativo-argentino-adrogue",        email: "escuelaespecial@educativoargentino.com.ar" },
  { slug: "jardin-nuestra-senora-de-lujan-adrogue",             email: "secretariaprimaria@colegionslujan.edu.ar" },
  { slug: "nuestro-lugar-vidka-adrogue",                        email: "lugarvidka@aol.com" },
];

console.log(`\n📧  Cargando emails para Adrogué${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

let ok = 0;
let failed = 0;

for (const { slug, email } of EMAILS) {
  if (DRY_RUN) {
    console.log(`📨  [DRY RUN] ${slug} → ${email}`);
    ok++;
    continue;
  }

  const res = await fetch(`${API_BASE}/v1/admin/schools/${slug}/fields`, {
    method: "PATCH",
    headers: {
      "x-admin-key": ADMIN_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });

  if (res.ok) {
    console.log(`✅  ${slug} → ${email}`);
    ok++;
  } else {
    const text = await res.text();
    console.error(`❌  ${slug} — ${res.status} ${text}`);
    failed++;
  }
}

console.log(`\n✨  Listo. OK: ${ok} | Fallidos: ${failed}\n`);
