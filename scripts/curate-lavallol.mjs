/**
 * Curación de colegios de Lavallol
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-lavallol.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) { console.error("❌  Falta ADMIN_API_KEY."); process.exit(1); }

const updates = [
  {
    id: "cmpzuraow0021qvqloxnpspgj",
    name: "Colegio Belén",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Lavallol bajo la advocación de Belén, el lugar del nacimiento de Jesús. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la espiritualidad del misterio de la Navidad —la humildad, la sencillez y el amor que se hace cercano— con una formación académica de calidad. Una institución con arraigo en la comunidad de Lavallol y el sur del GBA."
    }
  },
  {
    id: "cmpzuramc0014qvqlzfojycee",
    name: "Colegio La Milagrosa",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Lavallol bajo la advocación de Nuestra Señora de la Medalla Milagrosa, aparecida a Santa Catalina Labouré en París en 1830. Ofrece los niveles inicial, primario y secundario con una espiritualidad mariana vicentina y una formación académica actualizada. Una institución con devoción popular y compromiso educativo en la comunidad del sur del Gran Buenos Aires."
    }
  },
  {
    id: "cmpzurakf000iqvqlcnmoopeo",
    name: "Colegio Nuestra Señora del Rosario",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Lavallol bajo la advocación de Nuestra Señora del Rosario. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción mariana del Rosario con una formación académica sólida y valores del humanismo cristiano. Una institución con arraigo en la comunidad de Lavallol, valorada por su clima espiritual y el acompañamiento cercano a las familias."
    }
  },
  {
    id: "cmpzuran6001fqvqlel38aiav",
    name: "Complejo Educativo Otero",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Lavallol con los niveles inicial, primario y secundario. El Complejo Educativo Otero ofrece una trayectoria educativa completa bajo el mismo techo institucional, acompañando a sus alumnos desde la primera infancia hasta el egreso secundario. Con arraigo en la comunidad de Lavallol y el compromiso de sus docentes, es una referencia del sistema educativo privado en el sur del GBA."
    }
  },
  {
    id: "cmpzurald000tqvqlc6jc5lxl",
    name: "Euskal Echea",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Lavallol fundada por la comunidad vasca argentina, cuyo nombre significa 'Casa Vasca' en euskera. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra la identidad y la cultura del País Vasco, una de las comunidades inmigrantes más activas de la Argentina. Una institución única en el sur del GBA, con fuerte identidad cultural vasca y compromiso con la excelencia educativa."
    }
  },
  {
    id: "cmpzuraj70007qvql1114kn9u",
    name: "Instituto San Francisco de Asís",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada franciscana de Lavallol bajo el patronazgo de San Francisco de Asís. Ofrece los niveles inicial, primario y secundario con la espiritualidad franciscana centrada en el amor a la naturaleza, la pobreza evangélica y la fraternidad universal. Su propuesta forma alumnos con sensibilidad ecológica, espíritu de servicio y valores del humanismo cristiano franciscano en el sur del Gran Buenos Aires."
    }
  },
  {
    id: "cmpzurao3001qqvql0k8s3cxx",
    name: "Jardín de Infantes La Casita del Sol",
    payload: {
      levels: ["INICIAL"],
      description: "Jardín de infantes privado de Lavallol cuyo nombre evoca una casita cálida bañada por el sol, metáfora de un espacio seguro, luminoso y hogareño para los más pequeños. Atiende niños de 2 a 5 años con una propuesta centrada en el juego, el afecto y el desarrollo integral en la primera infancia. Un espacio donde los niños de Lavallol dan sus primeros pasos escolares rodeados de calidez y estimulación."
    }
  }
];

async function patchSchool(id, name, payload) {
  const url = `${API_BASE}/v1/schools/id/${id}/profile`;
  const res = await fetch(url, { method: "PATCH", headers: { "content-type": "application/json", "x-admin-key": ADMIN_API_KEY }, body: JSON.stringify(payload) });
  if (res.ok) { console.log(`✅  ${name}`); } else { const body = await res.text(); console.error(`❌  ${name} — HTTP ${res.status}: ${body}`); }
}

console.log(`\n🏫  Curando ${updates.length} colegios de Lavallol...\n`);
for (const { id, name, payload } of updates) { await patchSchool(id, name, payload); }
console.log("\n✨  Listo.\n");
