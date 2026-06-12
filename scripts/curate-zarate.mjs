/**
 * Curación de colegios de Zárate.
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-zarate.mjs [--dry-run]
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
    id: "cmqb4nczk01kg76vhz4bx7ux9",
    name: "Colegio De La Ciudad - Nivel Secundario",
    payload: {
      levels: ["SECUNDARIA"],
      description: "El Colegio De La Ciudad en su nivel secundario es una institución educativa de Zárate que ofrece un bachillerato orientado a la preparación universitaria y al desarrollo de competencias para el mundo profesional. Con una propuesta académica actualizada y un equipo docente comprometido, acompaña a los jóvenes zarateños en una etapa clave de su formación. La institución se destaca por su vocación de servicio a la comunidad local y por la calidad de sus egresados que continúan estudios superiores."
    }
  },
  {
    id: "cmqb4nd8801ml76vhmtgrpnjw",
    name: "Colegio Del Sol",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Del Sol de Zárate es una institución educativa privada que lleva en su nombre la luminosidad y la energía vital como símbolos de una educación que ilumina el camino de cada alumno. Con una propuesta completa desde el nivel inicial hasta el secundario, combina la calidez en el trato con una exigencia académica que prepara a los alumnos para los desafíos de la vida universitaria y profesional. En el partido de Zárate, el Colegio Del Sol es reconocido por su ambiente alegre y su compromiso con la formación integral."
    }
  },
  {
    id: "cmqb4nd1x01l276vhvxvfkpv4",
    name: "Colegio Ritchie Zárate",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Ritchie de Zárate es una institución educativa privada con larga trayectoria en la ciudad que ofrece formación completa desde el nivel inicial hasta el secundario. Con décadas de presencia en Zárate, el colegio ha formado generaciones de familias zarateñas con una propuesta pedagógica que equilibra la exigencia académica y el acompañamiento personalizado. Su nombre está vinculado a la historia local y su comunidad educativa es un reflejo del compromiso con la educación de calidad en el norte bonaerense."
    }
  },
  {
    id: "cmqb4nd4m01lo76vha95dbbex",
    name: "Colegio Sagrada Familia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Sagrada Familia de Zárate es una institución educativa católica que toma como modelo el hogar de Nazaret para una propuesta educativa basada en el amor, la responsabilidad y la fe. Con formación completa desde el jardín maternal hasta el secundario, la institución integra los valores de la familia cristiana con una currícula actualizada que prepara a los alumnos para los estudios superiores. En el norte de la provincia de Buenos Aires, el Colegio Sagrada Familia es un referente de la educación privada religiosa con profundo arraigo comunitario."
    }
  },
  {
    id: "cmqb4nd0t01kr76vh0i2hqphg",
    name: "Colegio San Pablo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio San Pablo de Zárate es una institución educativa cristiana que ofrece formación completa desde el nivel inicial hasta el secundario inspirada en la figura del Apóstol de los Gentiles. Con una propuesta que combina la fe y el rigor académico, el colegio forma jóvenes zarateños con valores de apertura, perseverancia y compromiso con el bien común. La institución es valorada en la comunidad local por su ambiente ordenado y su proyecto educativo coherente con los principios del Evangelio."
    }
  },
  {
    id: "cmqb4ndcp01nr76vhevv3n7ov",
    name: "E.P.N 3 Nuestra Señora Del Carmen de Zárate",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "La Escuela Privada N°3 Nuestra Señora del Carmen de Zárate es una institución educativa católica de larga tradición en la ciudad que lleva el nombre de la patrona del Carmen, venerada especialmente por los devotos del litoral bonaerense. Con niveles inicial y primario, ofrece una propuesta pedagógica que combina la formación en la fe con los valores de la educación argentina. La institución es un referente de la educación católica en Zárate con generaciones de familias que han confiado en su proyecto educativo."
    }
  },
  {
    id: "cmqb4ndf001ob76vhtxglt2kr",
    name: "Escolandia",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "Escolandia es una institución educativa privada de Zárate cuyo nombre evoca un reino encantado del saber, reflejando una propuesta pedagógica lúdica y creativa especialmente diseñada para los primeros años de escolaridad. Con niveles inicial y primario, la institución ofrece un ambiente estimulante donde los niños descubren el placer de aprender a través del juego, el arte y la exploración. Escolandia es una opción apreciada por las familias zarateñas que buscan una educación inicial y primaria con impronta creativa y afectuosa."
    }
  },
  {
    id: "cmqb4ndhj01ox76vhqgge08ob",
    name: "Escuela de Educación Secundaria Técnica N° 2 Tomás Espora",
    payload: {
      levels: ["SECUNDARIA"],
      description: "La Escuela de Educación Secundaria Técnica N°2 Tomás Espora de Zárate lleva el nombre del marino y militar argentino en homenaje al espíritu de valor y sacrificio que define a la historia naval del Río de la Plata. Con formación técnica en diversas especialidades, la EEST N°2 prepara a los jóvenes zarateños para el mercado laboral industrial y para la continuación de estudios superiores tecnológicos. En una ciudad con importante actividad industrial y portuaria, la escuela técnica tiene un rol estratégico en el desarrollo productivo local."
    }
  },
  {
    id: "cmqb4ndae01n776vhw09sv2ut",
    name: "Escuela Evangélica Dr. F. Jorge Hotton",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "La Escuela Evangélica Dr. F. Jorge Hotton de Zárate lleva el nombre de un destacado médico y misionero que trabajó en el desarrollo de las comunidades del norte bonaerense, integrando el servicio médico y la fe. Con una propuesta educativa completa basada en valores protestantes, la institución ofrece formación desde el nivel inicial hasta el secundario con un fuerte compromiso con la salud integral y el bienestar de los alumnos. La escuela es un referente de la educación evangélica en el partido de Zárate."
    }
  },
  {
    id: "cmqb4nd5x01lz76vhwt1tssmh",
    name: "Instituto de Vanguardia",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto de Vanguardia de Zárate lleva en su nombre la voluntad de estar siempre a la avanzada de la educación, incorporando las metodologías y tecnologías más actualizadas en su propuesta pedagógica. Con educación primaria y secundaria, la institución forma a sus alumnos con competencias del siglo XXI: pensamiento crítico, creatividad, trabajo colaborativo y alfabetización digital. En el norte bonaerense, el Instituto de Vanguardia es una opción diferenciada para las familias que buscan una educación orientada al futuro."
    }
  },
  {
    id: "cmqb4nd3901ld76vhepsznxr7",
    name: "Instituto Jose Manuel Estrada",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto José Manuel Estrada de Zárate lleva el nombre del célebre educador, político y orador argentino del siglo XIX, pionero de la educación católica y defensor de la libertad de enseñanza. Con educación primaria y secundaria, la institución honra el legado de Estrada con una propuesta que integra la solidez académica con los valores de la tradición educativa católica argentina. En Zárate, el Instituto Estrada es un referente de la educación privada con una identidad histórica y cultural consolidada."
    }
  },
  {
    id: "cmqb4nd9c01mw76vhcm8tkrmr",
    name: "Instituto San Francisco de Asís - Doble Escolaridad",
    payload: {
      levels: ["PRIMARIA"],
      description: "El Instituto San Francisco de Asís de Zárate con doble escolaridad es una institución franciscana que ofrece educación primaria en jornada extendida, brindando a los alumnos un tiempo adicional para actividades de refuerzo, deportes, artes y formación en valores. La jornada completa permite una educación más integral donde el espíritu franciscano de alegría, sencillez y amor a la naturaleza se vive con mayor profundidad en la cotidianidad escolar. Una opción valorada por las familias zarateñas que buscan una propuesta educativa enriquecida."
    }
  },
  {
    id: "cmqb4ndl101ps76vh22pwy3hn",
    name: "Jardin de Infantes Lucerito",
    payload: {
      levels: ["INICIAL"],
      description: "El Jardín de Infantes Lucerito de Zárate es un espacio educativo especializado en la primera infancia que lleva en su nombre la luz pequeña pero brillante que cada niño aporta al mundo. Con una propuesta pedagógica centrada en el juego, la expresión artística y el desarrollo socioemocional, Lucerito ofrece un ambiente cálido y seguro donde los más pequeños dan sus primeros pasos escolares. Su nombre refleja la filosofía institucional: cada niño es una luz única que merece ser descubierta y cultivada con amor y dedicación."
    }
  },
  {
    id: "cmqb4nd7401ma76vhgkzbfhz2",
    name: "Jardín maternal y de infantes Pepín Cascarón",
    payload: {
      levels: ["INICIAL"],
      description: "El Jardín Maternal y de Infantes Pepín Cascarón de Zárate es una institución de educación temprana que lleva el nombre de un entrañable personaje infantil como símbolo de ternura y alegría. Ofrece atención y educación desde los primeros meses de vida hasta el ingreso a la escuela primaria, con un enfoque basado en el vínculo afectivo, la estimulación temprana y el juego como motor del aprendizaje. Un espacio querido por las familias zarateñas que buscan un jardín maternal con calidez y profesionalismo para sus hijos más pequeños."
    }
  },
  {
    id: "cmqb4ndge01om76vhsz27ugas",
    name: "Mi Pequeño Jardín",
    payload: {
      levels: ["INICIAL"],
      description: "Mi Pequeño Jardín de Zárate es una institución de educación inicial cuyo nombre evoca un espacio verde y vivo donde los niños florecen y crecen con la misma naturalidad que las plantas. Con una propuesta pedagógica que integra el contacto con la naturaleza, la creatividad y el afecto como pilares del aprendizaje temprano, el jardín ofrece un ambiente acogedor y estimulante para los más pequeños. Es una opción muy valorada por las familias de Zárate que buscan un jardín con impronta naturalista y trato personalizado."
    }
  },
];

console.log(`\n✏️  Curando ${updates.length} colegios de Zárate${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

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
