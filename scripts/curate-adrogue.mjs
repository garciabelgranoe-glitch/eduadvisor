/**
 * Curación de colegios de Adrogué
 * ADMIN_API_KEY=<key> node scripts/curate-adrogue.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY.");
  process.exit(1);
}

const updates = [
  {
    id: "cmpqb9ja400az2um75zy0o64g",
    name: "Baby School Escuela Montessoriana",
    payload: {
      levels: ["MATERNAL", "INICIAL"],
      description:
        "Jardín maternal y de infantes de enfoque Montessoriano ubicado en Hipólito Bouchard 1580, Adrogué. Afiliada a la Fundación Argentina María Montessori, Baby School brinda un espacio de enseñanza-aprendizaje basado en el desarrollo social, motriz y emocional del niño. La propuesta atiende tres necesidades fundamentales de la primera infancia: afecto, seguridad y actividad, acompañando el desarrollo integral desde los primeros meses de vida."
    }
  },
  {
    id: "cmpqb9j64008j2um7a9a1fzhv",
    name: "Colegio A.L.F.A.",
    payload: {
      levels: ["MATERNAL", "INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Fundado en 1961 como iniciativa de laicos comprometidos de la Parroquia San Gabriel Arcángel, el Colegio ALFA (Asociación Laical Fraterna) es una institución privada, mixta y sin fines de lucro de Adrogué. Ofrece los cuatro niveles educativos — maternal, inicial, primaria y secundaria — con formación en valores católicos, inglés con posibilidad de certificaciones internacionales y bachillerato con orientación en Economía y Administración. Su jardín funciona bajo el nombre Alfa de Jesús Niño."
    }
  },
  {
    id: "cmpqb9jcf00c72um7ee7jghcl",
    name: "Colegio de la Reina",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de gestión católica fundado en 1956, ubicado en Roque Sáenz Peña 675, Adrogué. Ofrece los niveles inicial, primario y secundario con una propuesta de jornada simple y enseñanza de inglés. Su línea educativa tradicional prioriza el cumplimiento de contenidos oficiales con materiales actualizados y una marcada formación en valores religiosos, siendo una de las instituciones con mayor trayectoria en el partido de Almirante Brown."
    }
  },
  {
    id: "cmpqb9j43007b2um7lgutntv7",
    name: "Colegio Irlandés",
    payload: {
      levels: ["MATERNAL", "INICIAL", "PRIMARIA", "SECUNDARIA"],
      website: "https://www.colegioirlandes.edu.ar/",
      description:
        "Colegio privado bilingüe fundado en 2001 en Pasaje Estrada 151, Adrogué. Organizado como cooperativa de enseñanza, el Colegio Irlandés ofrece los cuatro niveles educativos en jornada completa con inglés como segunda lengua. Su modelo constructivista sitúa al alumno como protagonista del aprendizaje, con apertura a la innovación, las nuevas tecnologías, el deporte y la cultura. Tiene una fuerte impronta artística, con talleres de artes plásticas, comedia musical, música y teatro."
    }
  },
  {
    id: "cmpqb9jan00ba2um7sokdsii3",
    name: "Colegio Maria Montessori",
    payload: {
      levels: ["MATERNAL", "INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico bilingüe de Adrogué que adapta la pedagogía Montessori al sistema educativo argentino, integrando contenidos curriculares oficiales con el enfoque centrado en el niño. Ofrece los niveles maternal, inicial, primario y secundario, con inglés en doble escolaridad obligatoria desde sala de 5. Su lema «Educare Ad Futurum» refleja una formación integral que promueve el pensamiento crítico, la comunicación y el trabajo colaborativo, incorporando tecnología, deporte, actividades artísticas y culturales."
    }
  },
  {
    id: "cmpqb9j8l00a22um75muz4z9k",
    name: "Colegio Modelo Marmol",
    payload: {
      levels: ["MATERNAL", "INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado laico fundado en 1988 en una casona histórica de comienzos del siglo XX, ubicado en Bynnon 2355, José Mármol, partido de Almirante Brown. Ofrece los cuatro niveles educativos — desde sala maternal hasta secundaria — con jornada simple y/o completa e inglés integrado en la currícula. Su emplazamiento en una construcción de época le da un carácter distintivo en la zona sur del conurbano bonaerense."
    }
  },
  {
    id: "cmpqb9j7m009g2um7s2y154zh",
    name: "Colegio Newlands",
    payload: {
      levels: ["MATERNAL", "INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico de jornada completa fundado en 1990 en Diagonal Almirante Brown 1556, Adrogué. Su propuesta se sustenta en dos pilares: formación bilingüe intensiva en inglés y francés, y un fuerte énfasis en el desarrollo deportivo. El bachillerato ofrece orientaciones en Ciencias Sociales y Humanidades o Ciencias Naturales. Prepara a sus alumnos para certificaciones internacionales (IGCSE, CAE, FCE, DELF, entre otras) y promueve proyectos de ecología, solidaridad, modelo de Naciones Unidas y viajes de estudio nacionales e internacionales."
    }
  },
  {
    id: "cmpqb9j3k00702um7u98omp5f",
    name: "Colegio Nuestra Señora del Carmen",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado católico subvencionado ubicado en Rosales 1685, Adrogué, con los tres niveles educativos. El bachillerato otorga tres orientaciones: Ciencias Sociales y Humanidades, Ciencias Naturales, y Economía y Administración. Su propuesta incluye inglés, orientación psicopedagógica y vocacional, feria cultural, jornadas de convivencia, proyecto ecológico y campamentos. Con 87 evaluaciones y una calificación de 4,5/5, es una de las instituciones mejor valoradas del partido."
    }
  },
  {
    id: "cmpqb9j4m007m2um7y40vwhp3",
    name: "Colegio Nuestra Señora de Luján Adrogue",
    payload: {
      levels: ["MATERNAL", "INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa privada católica subvencionada fundada en 1958 en Seguí 149, Adrogué. Ofrece los cuatro niveles — maternal, inicial, primario y secundario — con inglés y bachillerato en tres orientaciones: Ciencias Sociales y Humanidades, Ciencias Naturales, y Economía y Administración. Su jardín opera con una sede propia. Con más de 65 años de historia, es una referencia consolidada de educación confesional en el partido de Almirante Brown."
    }
  },
  {
    id: "cmpqb9j9400ad2um70iqwwlu9",
    name: "Colegio Parroquial Stella Maris",
    payload: {
      levels: ["MATERNAL", "INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto parroquial privado católico fundado en 1964 en Tomás Nother 230, Adrogué. Ofrece maternal, jardín de infantes, primaria y secundaria en jornada simple con inglés. El bachillerato otorga orientación en Ciencias Naturales o Economía y Administración. Con décadas de trayectoria en la zona, combina formación académica sólida con identidad religiosa y acompañamiento pastoral para familias del partido de Almirante Brown."
    }
  },
  {
    id: "cmpqb9j54007x2um78di2p479",
    name: "Colegio San Miguel",
    payload: {
      levels: ["MATERNAL", "INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "St. Michael's College es el colegio mixto, laico y bilingüe más antiguo de Adrogué, fundado en 1953 en Uriburu 362. Ofrece jornada completa en todos los niveles — desde sala de 2 años hasta el secundario — con inglés y francés como lenguas de enseñanza. Prepara a sus alumnos para certificaciones internacionales como IGCSE, CAE y CPE. El bachillerato otorga orientación en Ciencias Sociales y Humanidades. Con más de 70 años de historia, es una institución de referencia en la zona sur del conurbano."
    }
  },
  {
    id: "cmpqb9j6l008u2um7k5k72vtx",
    name: "Colegio San Patricio (historic)",
    payload: {
      description:
        "Establecimiento educativo privado con trayectoria histórica en Adrogué, partido de Almirante Brown. Actualmente en proceso de actualización de datos institucionales en la plataforma EduAdvisor."
    }
  },
  {
    id: "cmpqb9j7400952um7i1awuu0d",
    name: "Dejalo Ser",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description:
        "Centro educativo terapéutico y escuela especial privada en Amenedo 1355, Adrogué. Atiende a niños y adolescentes con trastornos motores, conductuales y secuelas neurológicas, genéticas u ortopédicas. Ofrece nivel inicial, primaria, centro de formación integral y módulo de apoyo a la integración escolar en todos los niveles, en turno mañana y tarde. Cuenta con una marcada propuesta artística que incluye artes plásticas, danza, música y teatro como parte del proyecto terapéutico."
    }
  },
  {
    id: "cmpqb9jb900bl2um7tcc174y2",
    name: "Escuela de Educación Secundaria n.°11 \"Almirante Guillermo Brown\"",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Escuela de educación secundaria de gestión estatal ubicada en Adrogué, dependiente de la Dirección General de Cultura y Educación de la Provincia de Buenos Aires. Ofrece educación secundaria obligatoria para adolescentes y jóvenes, con una currícula enmarcada en los diseños oficiales provinciales. Una opción de referencia para familias que buscan educación pública de calidad en el partido de Almirante Brown."
    }
  },
  {
    id: "cmpqb9j5n00882um7hgb3rl5o",
    name: "Establecimiento Educativo Argentino",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico en Quintana 1048, Adrogué, que integra en un mismo campus los niveles inicial, primario, secundario y un programa de educación especial. Con 175 valoraciones y una calificación de 4,4/5, es una de las instituciones mejor evaluadas de la zona. Su proyecto educativo se fundamenta en el compromiso con la educación democrática, la inclusión de la diversidad y la defensa de la identidad nacional, con jornada simple y/o extendida e inglés integrado."
    }
  },
  {
    id: "cmpqb9jdv00ct2um7y668z1nb",
    name: "Jardín De Infantes Nº907",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes de gestión estatal N° 907 ubicado en Adrogué, partido de Almirante Brown, dependiente de la Dirección General de Cultura y Educación de la Provincia de Buenos Aires. Ofrece educación inicial pública para niños en edad preescolar."
    }
  },
  {
    id: "cmpqb9jby00bw2um7dlgrdj06",
    name: "Jardin Maternal María Montessori",
    payload: {
      levels: ["MATERNAL", "INICIAL"],
      description:
        "Nivel maternal del Colegio María Montessori de Adrogué, ubicado en una sede propia. Atiende niños desde los primeros meses hasta los 5 años con la pedagogía Montessori adaptada al sistema educativo argentino, promoviendo el desarrollo autónomo y el aprendizaje a través de la experiencia sensorial en un entorno preparado. La propuesta se integra al proyecto pedagógico del colegio, facilitando la transición hacia los niveles superiores."
    }
  },
  {
    id: "cmpqb9j82009r2um7fjpsztnw",
    name: "Jardín Nuestra Señora de Luján",
    payload: {
      levels: ["MATERNAL", "INICIAL"],
      description:
        "Nivel inicial del Colegio Nuestra Señora de Luján de Adrogué, que funciona en una sede propia. Atiende desde el jardín maternal hasta sala de 5 años dentro del proyecto pedagógico y los valores católicos de la institución fundada en 1958. La propuesta acompaña a los niños en sus primeros pasos educativos, facilitando la transición hacia el nivel primario en el mismo complejo institucional."
    }
  },
  {
    id: "cmpqb9jcz00ci2um78sw1z34d",
    name: "NUESTRO LUGAR VIDKA",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description:
        "Centro educativo terapéutico y escuela especial privada laica ubicada en Enrique Policastro 183, Adrogué. Atiende a niños y adolescentes con trastornos motores, conductuales adaptativos y secuelas de patologías genéticas, neurológicas, neurometabólicas, ortopédicas o traumáticas. Ofrece educación especial a nivel primario con un enfoque orientado a desarrollar las potencialidades de cada alumno y favorecer su inclusión social."
    }
  },
  {
    id: "cmpqb9j9m00ao2um7jy215vfa",
    name: "Winners School Adrogué",
    payload: {
      description:
        "Instituto de inglés y apoyo escolar fundado en 2007 en Adrogué, partido de Almirante Brown. Ofrece cursos de inglés de todos los niveles y clases de apoyo académico. Una opción de formación complementaria para alumnos de la zona sur del conurbano bonaerense."
    }
  }
];

async function patchSchool(id, name, payload) {
  const url = `${API_BASE}/v1/schools/id/${id}/profile`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "content-type": "application/json", "x-admin-key": ADMIN_API_KEY },
    body: JSON.stringify(payload)
  });
  if (res.ok) {
    console.log(`✅  ${name}`);
  } else {
    console.error(`❌  ${name} — HTTP ${res.status}: ${await res.text()}`);
  }
}

console.log(`\n🏫  Curando ${updates.length} colegios de Adrogué...\n`);
for (const { id, name, payload } of updates) {
  await patchSchool(id, name, payload);
}
console.log("\n✨  Listo.\n");
