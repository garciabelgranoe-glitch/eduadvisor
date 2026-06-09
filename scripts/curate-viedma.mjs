const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
if (!ADMIN_API_KEY) { console.error("❌  Falta ADMIN_API_KEY."); process.exit(1); }

const updates = [
  { id: "cmq6z9tf200iv12emsbkln0zn", name: "C.E.M. 18", payload: { levels: ["SECUNDARIA"], description: "Centro de Educación Media privado de Viedma, capital de Río Negro. Ofrece el bachillerato completo en la ciudad que casi se convirtió en la nueva capital federal argentina durante la presidencia de Alfonsín. Con arraigo en la comunidad viedmense y compromiso con la formación de jóvenes patagónicos, prepara egresados para el ingreso universitario y el mercado laboral del sur argentino." } },
  { id: "cmq6z9t9a00h112emrnt3f3i9", name: "Colegios Artémides Zatti/Juan Vecchi", payload: { levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"], description: "Institución salesiana de Viedma que lleva los nombres del Beato Artémides Zatti —el 'Gaucho de Dios' patagónico, coadjutor salesiano beatificado por Juan Pablo II— y Juan Vecchi, rector mayor salesiano. Los Salesianos llegaron a la Patagonia en el siglo XIX con Don Bosco y marcaron la educación de la región. Esta institución aplica el sistema preventivo salesiano en los tres niveles en la capital rionegrina." } },
  { id: "cmq6z9ta800hc12em7vpefxys", name: "Escuela Ecológica Gaia", payload: { levels: ["INICIAL", "PRIMARIA"], description: "Institución privada de Viedma con propuesta ecológica e integradora para los niveles inicial y primario. Lleva el nombre de Gaia, la diosa griega de la Tierra y símbolo del pensamiento ecológico contemporáneo. Con énfasis en el cuidado del medio ambiente, la biodiversidad patagónica y el aprendizaje en contacto con la naturaleza, forma niños con conciencia ambiental en la capital de Río Negro." } },
  { id: "cmq6z9td600i912emsbi31u8t", name: "Instituto Adventista Francisco Ramos Mejia", payload: { levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"], description: "Institución de la Iglesia Adventista del Séptimo Día en Viedma que lleva el nombre del médico y político argentino Francisco Ramos Mejía. Con los tres niveles educativos y los valores adventistas de salud integral, amor por la naturaleza y preparación para la vida, ofrece una propuesta educativa completa en la capital de Río Negro con comunidad de familias comprometidas con la formación integral de sus hijos." } },
  { id: "cmq6z9tc700hy12em00zpex3k", name: "Instituto María Auxiliadora", payload: { levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"], description: "Institución dirigida por las Hijas de María Auxiliadora —la rama femenina de los Salesianos— en Viedma. Con los tres niveles educativos y la espiritualidad salesiana centrada en la devoción a María Auxiliadora, es parte de la histórica presencia salesiana en la Patagonia. Forma alumnas con fe, saber y compromiso social en la capital rionegrina, continuando la misión educativa que los Salesianos comenzaron en el sur argentino hace más de un siglo." } },
  { id: "cmq6z9t8b00gq12emdfd3cmcu", name: "Instituto Modelo Viedma", payload: { levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"], description: "Institución privada laica de referencia en Viedma que ofrece los tres niveles educativos con propuesta actualizada y énfasis en la calidad académica. Con arraigo en la comunidad viedmense y docentes comprometidos, prepara alumnos para el ingreso a la Universidad Nacional de Río Negro y otras instituciones de educación superior. Una opción consolidada para familias que priorizan la formación integral en la capital patagónica." } },
  { id: "cmq6z9tb800hn12emq0kxlqmn", name: "Instituto Rosario Vera Peñaloza", payload: { levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"], description: "Institución privada de Viedma que lleva el nombre de Rosario Vera Peñaloza, la 'Maestra de la Patria' riojana que revolucionó la educación inicial argentina con los jardines de infantes y el método Froebel. En Viedma, esta institución honra su legado con una propuesta educativa que valora la formación integral desde los primeros años, ofreciendo los tres niveles en la capital de Río Negro con vocación pedagógica y compromiso social." } },
];

async function patchSchool(id, name, payload) {
  const res = await fetch(`${API_BASE}/v1/schools/id/${id}/profile`, {
    method: "PATCH",
    headers: { "content-type": "application/json", "x-admin-key": ADMIN_API_KEY },
    body: JSON.stringify(payload)
  });
  if (res.ok) { console.log(`✅  ${name}`); }
  else { const b = await res.text(); console.error(`❌  ${name} — HTTP ${res.status}: ${b}`); }
}

console.log(`\n🏫  Curando ${updates.length} colegios de Viedma...\n`);
for (const { id, name, payload } of updates) { await patchSchool(id, name, payload); }
console.log("\n✨  Listo.\n");
