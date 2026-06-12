/**
 * Curación de colegios de San Martín (GBA).
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-san-martin.mjs [--dry-run]
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const DRY_RUN = process.argv.includes("--dry-run");

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY");
  process.exit(1);
}

const updates = [
  {
    id: "cmq6z6s2f002c12emk0uhv851",
    name: "Colegio 182 P - Jose Fco de San Martin",
    payload: {
      levels: ["PRIMARIA"],
      description: "El Colegio N°182 José Francisco de San Martín es una institución educativa del partido de San Martín que rinde homenaje al Libertador con una propuesta pedagógica orientada a los valores patrios y la formación ciudadana. Ofrece educación primaria con un enfoque en la enseñanza de calidad y el acompañamiento integral de cada alumno. Su identidad institucional está marcada por el orgullo de llevar el nombre del prócer más importante de la historia argentina."
    }
  },
  {
    id: "cmq6z6ryj001612emzdq94syr",
    name: "Colegio San Martin",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio San Martín del partido homónimo es una institución educativa privada con una propuesta completa que abarca desde el nivel inicial hasta la escuela secundaria. Con décadas de presencia en la comunidad local, se ha convertido en un referente educativo para las familias del distrito. Su proyecto pedagógico combina una formación académica sólida con actividades extracurriculares que potencian el desarrollo integral de los estudiantes."
    }
  },
  {
    id: "cmqb4hx7500gp76vhodlbg0c6",
    name: "Instituto Gral Jose de San Martin",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto General José de San Martín es una institución educativa del partido de San Martín que combina la educación primaria y secundaria con una fuerte identidad histórica y patriótica. Su propuesta académica incluye el estudio en profundidad de la vida y obra del Libertador como eje transversal de la formación ciudadana. Con un equipo docente comprometido y un ambiente escolar ordenado, la institución prepara a sus alumnos para los desafíos de la vida universitaria y profesional."
    }
  },
  {
    id: "cmqb4hx9l00hb76vh0c9v4q4n",
    name: "Instituto Positano San Martin",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Positano San Martín es una institución educativa privada ubicada en el partido de San Martín que ofrece formación completa desde el jardín de infantes hasta el secundario. Su nombre evoca un ambiente cálido y mediterráneo que se refleja en el clima institucional cercano y afectuoso que caracteriza a la comunidad escolar. Con una currícula actualizada y un enfoque en el bienestar emocional de los alumnos, Positano es una opción valorada por familias que buscan calidad educativa y contención."
    }
  },
];

console.log(`\n✏️  Curando ${updates.length} colegios de San Martín${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

let ok = 0;
let failed = 0;

for (const { id, name, payload } of updates) {
  if (DRY_RUN) {
    console.log(`📋  [DRY RUN] ${name}`);
    ok++;
    continue;
  }

  const res = await fetch(`${API_BASE}/v1/schools/id/${id}/profile`, {
    method: "PATCH",
    headers: {
      "x-admin-key": ADMIN_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    console.log(`✅  ${name}`);
    ok++;
  } else {
    const text = await res.text();
    console.error(`❌  ${name} — ${res.status} ${text}`);
    failed++;
  }
}

console.log(`\n✨  Listo. OK: ${ok} | Fallidos: ${failed}\n`);
