/**
 * Curación de colegios de San Vicente
 * Aplica descripciones, niveles y datos faltantes vía Admin API.
 *
 * Uso:
 *   ADMIN_API_KEY=<tu-key> node scripts/curate-san-vicente.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY. Usá: ADMIN_API_KEY=xxx node scripts/curate-san-vicente.mjs");
  process.exit(1);
}

const updates = [
  {
    id: "cmpyboak60075tjf1ygr98fo5",
    name: "Campus Educativo Lorenzini",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Campus Educativo Lorenzini es una institución privada laica de San Vicente que ofrece los niveles inicial, primario y secundario en un entorno amplio con espacios verdes. Su propuesta pedagógica apunta al desarrollo integral del alumno, combinando formación académica con actividades deportivas y culturales. Valorado por las familias de la zona por la continuidad de niveles y el trato personalizado."
    }
  },
  {
    id: "cmpyboahu006jtjf1pukyi7u3",
    name: "Colegio Grilli Principado San Vicente",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "El Colegio Grilli Principado es una institución privada de San Vicente con larga trayectoria en el partido. Ofrece los tres niveles educativos —inicial, primario y secundario— con una propuesta que prioriza la formación en valores y el acompañamiento académico. Su continuidad de niveles facilita el recorrido escolar completo de los alumnos dentro de una misma comunidad educativa."
    }
  },
  {
    id: "cmpyboam6007rtjf1rfypde3y",
    name: "Colegio San Francisco",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de San Vicente con los niveles inicial, primario y secundario. Combina una propuesta académica sólida con formación en valores humanos dentro de un clima institucional familiar. Reconocido por las familias de San Vicente por su compromiso pedagógico y la atención personalizada que brinda a sus alumnos a lo largo de toda la trayectoria escolar."
    }
  },
  {
    id: "cmpyboar80098tjf1ozwxcwfa",
    name: "Colegio San Gabriel",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de San Vicente que ofrece educación desde el nivel inicial hasta el secundario. Su proyecto educativo integra formación académica rigurosa con el desarrollo de habilidades sociales y trabajo en valores. El colegio cuenta con una comunidad activa de familias y egresados que valoran la calidez del entorno y la continuidad pedagógica entre niveles."
    }
  },
  {
    id: "cmpyboawd00artjf1siliqano",
    name: "Colegio San Mateo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico de San Vicente con los tres niveles educativos. Ofrece una propuesta formativa integral con énfasis en el acompañamiento individual del alumno y el trabajo colaborativo. Su recorrido completo desde el jardín hasta el secundario permite a las familias sostener un vínculo estable con la institución a lo largo de toda la escolaridad de sus hijos."
    }
  },
  {
    id: "cmpyboaq8008xtjf1uomepboj",
    name: "Colegio San Vicente",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa privada con arraigo en el distrito de San Vicente. Ofrece los niveles inicial, primario y secundario bajo una propuesta pedagógica orientada a la formación integral y el desarrollo de competencias para la vida. Una referencia educativa local que acompaña a generaciones de familias sanvicentinas en el recorrido escolar completo de sus hijos."
    }
  },
  {
    id: "cmpyboaxe00b2tjf1fxjxzk6q",
    name: "ESCUELA EGB Nº16 \"CARLOS ALFONSO IBAÑEZ\"",
    payload: {
      levels: ["PRIMARIA"],
      description:
        "Escuela pública de educación primaria de San Vicente, dependiente de la Dirección General de Cultura y Educación de la Provincia de Buenos Aires. Brinda educación gratuita y obligatoria con una propuesta curricular orientada a la formación ciudadana, la alfabetización y el desarrollo de las competencias básicas para la continuidad educativa en el nivel secundario."
    }
  },
  {
    id: "cmpqb8t0q006d2um7n2simqoi",
    name: "Escuela Jonas Salk E.P N 5",
    payload: {
      levels: ["PRIMARIA"],
      description:
        "Escuela Primaria N°5 Jonas Salk de San Vicente, institución pública de gestión estatal dependiente de la provincia de Buenos Aires. Ofrece educación primaria gratuita con una propuesta curricular que privilegia la formación integral del niño, la convivencia democrática y el desarrollo de capacidades para el aprendizaje continuo. Referente educativo del distrito con décadas de historia."
    }
  },
  {
    id: "cmpyboap6008mtjf133y7aufm",
    name: "Instituto Agrotécnico San José",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Instituto de educación secundaria técnica agropecuaria de San Vicente. Ofrece formación con orientación en ciencias agrarias y producción agropecuaria, brindando a los egresados herramientas prácticas y teóricas para desenvolverse en el sector productivo rural. Una propuesta educativa diferenciada y estratégica para un distrito con fuerte impronta agropecuaria como San Vicente."
    }
  },
  {
    id: "cmpqb8swn00432um7onkbtbo7",
    name: "Instituto Aires del Sur",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado laico de San Vicente que ofrece los niveles inicial, primario y secundario. Con una propuesta educativa centrada en el desarrollo integral del alumno, Aires del Sur combina formación académica con actividades artísticas, deportivas y tecnológicas. Su clima institucional cálido y el acompañamiento cercano a las familias lo convierten en una opción reconocida en el distrito."
    }
  },
  {
    id: "cmpyboas7009jtjf1lsdjjokz",
    name: "INSTITUTO EDUCATIVO DEL SUR (ALEJANDRO KORN)",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto Educativo del Sur con sede en Alejandro Korn, localidad del partido de San Vicente. Ofrece los niveles inicial, primario y secundario con una propuesta educativa integral. Su ubicación en Alejandro Korn lo convierte en una referencia educativa clave para las familias de esa localidad que buscan un recorrido escolar completo y de calidad sin necesidad de trasladarse."
    }
  },
  {
    id: "cmpyboaye00bdtjf1w8g612xw",
    name: "INSTITUTO EDUCATIVO DEL SUR ESCUELA PRIMARIA",
    payload: {
      levels: ["PRIMARIA"],
      description:
        "Nivel primario del Instituto Educativo del Sur en San Vicente. Brinda educación primaria dentro de una institución con trayectoria en el distrito, articulando su propuesta con los demás niveles del complejo educativo. La continuidad pedagógica y el trabajo en equipo entre docentes de los distintos niveles son aspectos valorados por la comunidad educativa."
    }
  },
  {
    id: "cmpyboazf00botjf1eqje1vqx",
    name: "Instituto San Vicente Pallotti",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de inspiración católica en San Vicente, perteneciente a la familia religiosa palotina. Ofrece los niveles inicial, primario y secundario con una propuesta que integra excelencia académica y formación en valores. Su identidad institucional se apoya en el carisma de San Vicente Pallotti, promoviendo la corresponsabilidad, la misión y el servicio a la comunidad."
    }
  },
  {
    id: "cmpyboaud00a5tjf1uzhypo1o",
    name: "Instituto Técnico Monseñor Schell",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Instituto de educación secundaria técnica de San Vicente, orientado a la formación de técnicos con competencias para el mundo laboral. Su propuesta curricular combina el bachillerato con especialización técnica, brindando a los egresados una doble titulación que habilita tanto para el ingreso a estudios superiores como para el mercado de trabajo. Referente de la educación técnica en el partido."
    }
  },
  {
    id: "cmpyboat8009utjf1w83pa2i9",
    name: "Instituto Yapeyú",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado laico de San Vicente con los tres niveles educativos. Su propuesta pedagógica integra tradición y modernidad, combinando una enseñanza sólida con actividades extracurriculares que enriquecen la formación del alumno. La comunidad Yapeyú valora el clima institucional inclusivo, la participación de las familias y el seguimiento personalizado en cada etapa del recorrido escolar."
    }
  },
  {
    id: "cmpyboan60082tjf1v70ji3ck",
    name: "Jardín Joan Miró",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes privado de San Vicente orientado a la educación artística y creativa en la primera infancia. Su propuesta toma como referencia el universo visual del artista Joan Miró para estimular la expresión plástica, la imaginación y el juego simbólico desde los primeros años. Un espacio diferenciado para familias que buscan una propuesta lúdica, afectiva y creativa para sus hijos."
    }
  },
  {
    id: "cmpyboal6007gtjf1iuuy5inz",
    name: "Jardín San Vicente",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes privado de San Vicente orientado a la educación integral de niños de 2 a 5 años. Ofrece un ambiente cálido y estimulante donde el juego y la afectividad son el eje de la propuesta pedagógica. Reconocido por las familias del distrito por la dedicación de su equipo docente y el acompañamiento cercano en los primeros años de escolarización."
    }
  },
  {
    id: "cmpyboaj0006utjf1a5dy8glw",
    name: "Miro College San Vicente",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Miro College es una institución privada bilingüe de San Vicente que ofrece los niveles inicial, primario y secundario con fuerte énfasis en la enseñanza del inglés. Su propuesta pedagógica combina el currículo oficial con metodologías activas y un abordaje internacional, preparando a los alumnos para un mundo globalizado. Una opción diferenciada para familias que priorizan la formación bilingüe desde los primeros años."
    }
  },
  {
    id: "cmpyboago0068tjf1de4nrd6y",
    name: "San José",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de gestión católica bajo la advocación de San José, con los niveles inicial, primario y secundario en San Vicente. Su propuesta educativa integra la formación académica con los valores del humanismo cristiano, promoviendo el crecimiento personal, la responsabilidad social y el sentido de comunidad. Una institución reconocida en el distrito por su trayectoria y su compromiso con la familia."
    }
  },
  {
    id: "cmpyboavd00agtjf18bbo192f",
    name: "Shamrock School Of English",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description:
        "Shamrock School of English es una institución bilingüe de San Vicente especializada en la enseñanza del inglés desde la primera infancia. Ofrece los niveles inicial y primario con un modelo de inmersión lingüística que permite a los alumnos desarrollar fluidez en inglés de manera natural. Una propuesta diferenciada para familias que priorizan el bilingüismo como herramienta clave para el futuro de sus hijos."
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

console.log(`\n🏫  Curando ${updates.length} colegios de San Vicente...\n`);

for (const { id, name, payload } of updates) {
  await patchSchool(id, name, payload);
}

console.log("\n✨  Listo.\n");
