/**
 * Curación de colegios de Longchamps
 * Aplica descripciones, niveles y teléfonos faltantes vía Admin API.
 *
 * Uso:
 *   ADMIN_API_KEY=<tu-key> node scripts/curate-longchamps.mjs
 *
 * El ADMIN_API_KEY se obtiene de las env vars de Railway (servicio eduadvisor-api).
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY. Usá: ADMIN_API_KEY=xxx node scripts/curate-longchamps.mjs");
  process.exit(1);
}

const updates = [
  {
    id: "cmpqarqlq003vik8bzgod9dsw",
    name: "Colegio del Pilar",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      phone: "+54 11 4297-2050",
      description:
        "Colegio privado laico ubicado en Los Studs 1115, Longchamps, que ofrece los tres niveles educativos: inicial, primaria y secundaria. Con jornada simple e inglés desde los primeros años, propone un recorrido formativo completo en un entorno cercano. Su continuidad entre niveles lo convierte en una opción valorada por familias del partido de Almirante Brown."
    }
  },
  {
    id: "cmpqarqdt000tik8bk1tcem7q",
    name: "Colegio Del Sur",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico de Longchamps que abarca desde el jardín maternal hasta el secundario, con opción de jornada simple y jornada completa. En el nivel secundario otorga el título de Bachiller con orientación en Ciencias Naturales. Cuenta con servicio opcional de transporte escolar. Su nivel inicial opera de manera independiente como Jardín del Sur, parte del mismo complejo educativo."
    }
  },
  {
    id: "cmpqarqfd001fik8blgc77kzi",
    name: "Colegio Jesús María",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Fundado en 1958, el Colegio Jesús María es una institución privada de gestión católica con más de seis décadas de historia en Longchamps. Ofrece los niveles inicial, primario y secundario con una propuesta que combina formación académica sólida y valores humanos. Sus instalaciones incluyen capilla, biblioteca, SUM, sala de informática y kiosco."
    }
  },
  {
    id: "cmpqarqcz000iik8b41qo7tie",
    name: "Colegio Mariano Moreno",
    payload: {
      description:
        "Con más de 40 años de trayectoria, el Colegio Mariano Moreno ofrece educación desde el nivel inicial —a través de su Jardín El Principito— hasta el secundario. Su propuesta incluye inglés con dos horas cátedra semanales y trabajo por proyectos. El bachillerato tiene dos orientaciones: Ciencias Sociales y Humanidades, o Economía y Administración."
    }
  },
  {
    id: "cmpqarqo0004sik8bezb0eofy",
    name: "Colegio Media 10",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Escuela de educación secundaria ubicada en Combate de Monte Santiago 1702, Longchamps. Ofrece educación secundaria obligatoria para adolescentes con eje en la formación académica, el desarrollo de habilidades sociales y la habilitación para el ingreso a estudios superiores. Su propuesta curricular sigue los diseños oficiales de la Provincia de Buenos Aires."
    }
  },
  {
    id: "cmpqarqg6001qik8b2yrt36bw",
    name: "Colegio San Marcos",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      website: "https://colegiosanmarcos.edu.ar",
      description:
        "Colegio privado laico en Sarmiento 1050, Longchamps, con los tres niveles educativos bajo una propuesta de educación integral. Desarrolla autonomía, creatividad y trabajo colaborativo, con programas de robótica, inglés extraprogramático, educación emocional y campamentos. Su programa «Padrinos y ahijados» facilita las transiciones entre niveles. Fundamenta su proyecto en valores de solidaridad, inclusión y participación."
    }
  },
  {
    id: "cmpqarqih002nik8bfvs6of8b",
    name: "Colegio Secundario Santa Clara de Asís",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Institución privada de gestión católica en Juan de Garay 738, Longchamps. Parte de un complejo educativo mayor con niveles inicial y primario. El secundario funciona en jornada simple matutina (7:30 a 13:00 hs) con una propuesta que combina rigor académico y formación en valores, orientada a preparar a los alumnos para el ingreso a la educación superior."
    }
  },
  {
    id: "cmpqarqk60039ik8bexvin4wd",
    name: "Cooperativa de Enseñanza Escuela Sendas Verdes LTDA.",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa organizada como cooperativa de enseñanza, única en su modelo en Longchamps. Sendas Verdes construye su propuesta sobre el vínculo como eje de la formación integral. Ofrece los tres niveles en jornada extendida (8:00 a 16:30 hs), con gestión no confesional y participativa. Ubicada en Av. Tomás Espora 5298, combina solidez pedagógica con un modelo de gestión comunitario."
    }
  },
  {
    id: "cmpqarqbw0007ik8bw29jcvio",
    name: "Del Prado SRL",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado laico ubicado en Ricardo Davel 2020, Longchamps, que ofrece los niveles inicial, primario y secundario. Con jornada simple, enseñanza de inglés y modalidad mixta, Del Prado es una opción educativa con trayectoria en el partido de Almirante Brown para familias que buscan una propuesta integral y accesible."
    }
  },
  {
    id: "cmpqarqhq002cik8bobsxgvgy",
    name: "Escuela Modelo Gran Bs As, Longchamps",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico en General Parodi 2090, Longchamps, con los tres niveles educativos (el inicial opera como Jardín Longchamps). Ofrece inglés, deportes —fútbol y vóley—, talleres de artes plásticas y música. Sus instalaciones incluyen SUM, sala de informática y kiosco. Una propuesta completa en jornada simple para familias del sur del conurbano."
    }
  },
  {
    id: "cmpqarqj9002yik8bermnbcxo",
    name: "Escuela Secundaria Modelo Gran Argentina",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Nivel secundario del complejo educativo Modelo Gran Argentina en Longchamps. De gestión privada y laica, con jornada simple e inglés, ofrece continuidad pedagógica para los alumnos egresados del nivel primario del mismo complejo hasta la obtención del título de Bachiller."
    }
  },
  {
    id: "cmpqarqgy0021ik8bzn10468j",
    name: "Instituto del Sur",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Instituto privado de educación secundaria en Languenhein 378, Longchamps. De gestión laica y organización mixta con jornada simple, combina formación académica con acompañamiento en valores y hábitos de estudio. El trato personalizado y el seguimiento individual son aspectos destacados por las familias que eligen la institución."
    }
  },
  {
    id: "cmpqarqkz003kik8bqgmjinn1",
    name: "Instituto Educativo Parroquial Longchamps",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa parroquial con trayectoria en Longchamps que ofrece los niveles inicial, primario y secundario bajo un proyecto de identidad católica. Integra formación académica con desarrollo de valores humanos y acompañamiento pastoral. Reconocida por exalumnos y familias como una base sólida de preparación para estudios terciarios y universitarios."
    }
  },
  {
    id: "cmpqarqn8004hik8bsyi3fccb",
    name: "Jardín de Infantes Amiguitos",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes privado en Carlos Diehl 870, Longchamps, orientado al acompañamiento integral de niños de 3 a 6 años. Nivel inicial del complejo educativo Colegio San Marcos. Valorado por las familias del barrio por su clima afectivo, la accesibilidad en cuotas y la cercanía del equipo docente con los alumnos y sus familias."
    }
  },
  {
    id: "cmpqarqmh0046ik8bt45mkqxi",
    name: "Jardín El Principito",
    payload: {
      levels: ["INICIAL"],
      description:
        "Nivel inicial del Colegio Mariano Moreno de Longchamps. El Jardín El Principito ofrece educación para niños de 3 a 5 años dentro del mismo proyecto pedagógico institucional. Introduce el inglés desde los primeros años e integra a los más pequeños a una comunidad educativa con más de 40 años de historia, facilitando la transición al nivel primario en la misma institución."
    }
  },
  {
    id: "cmpqarqor0053ik8bkg9fzlta",
    name: "Jardín del Árbol de Longchamps",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín maternal y de infantes privado en Ruta Provincial 210 Nº 556, Longchamps. Atiende niños desde los primeros meses hasta los 5 años, con un enfoque centrado en el juego, la exploración y el desarrollo integral de la primera infancia. Una opción de inicio educativo cálido y personalizado en la zona sur del partido de Almirante Brown."
    }
  },
  {
    id: "cmpqarqq9005pik8brfonp4yw",
    name: "Jardín del Sur",
    payload: {
      levels: ["INICIAL"],
      description:
        "Nivel inicial del Colegio Del Sur en Longchamps. Ofrece jardín maternal y de infantes como parte del complejo educativo que abarca hasta el secundario, brindando continuidad pedagógica desde los primeros años. Forma la base de un proyecto institucional que acompaña a los alumnos a lo largo de toda su trayectoria escolar."
    }
  }
];

async function patchSchool(id, name, payload) {
  const url = `${API_BASE}/v1/schools/id/${id}/profile`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "x-admin-key": ADMIN_API_KEY
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    console.log(`✅  ${name}`);
  } else {
    const body = await res.text();
    console.error(`❌  ${name} — HTTP ${res.status}: ${body}`);
  }
}

console.log(`\n🏫  Curando ${updates.length} colegios de Longchamps...\n`);

for (const { id, name, payload } of updates) {
  await patchSchool(id, name, payload);
}

console.log("\n✨  Listo.\n");
