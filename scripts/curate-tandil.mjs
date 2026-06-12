/**
 * Curación de colegios de Tandil.
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-tandil.mjs [--dry-run]
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
    id: "cmqb4ilzi00l976vhgqekxef5",
    name: "Asociacion Civil Santo Domingo de Guzman",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "La Asociación Civil Santo Domingo de Guzmán es una institución educativa de Tandil de inspiración dominicana que ofrece formación completa desde el nivel inicial hasta la educación secundaria. Siguiendo el carisma de Domingo de Guzmán, su propuesta pedagógica está centrada en la búsqueda de la verdad, el estudio riguroso y la formación en valores evangélicos. En el contexto serrano de Tandil, la institución brinda un ambiente de aprendizaje inspirador donde los alumnos desarrollan su intelecto y su espiritualidad."
    }
  },
  {
    id: "cmqb4im5800ms76vh4y3aer6t",
    name: "ATAD",
    payload: {
      levels: ["INICIAL"],
      description: "ATAD (Asociación Tandilense de Ayuda al Discapacitado) es una institución de Tandil dedicada a la educación y atención de personas con discapacidad, con décadas de trabajo en la comunidad. Su equipo interdisciplinario brinda atención en múltiples áreas —estimulación temprana, educación especial, talleres de formación laboral— con un enfoque integral y centrado en la persona. ATAD es un pilar social de Tandil reconocido por su compromiso con la inclusión y el desarrollo pleno de cada individuo."
    }
  },
  {
    id: "cmqb4ilq200it76vhnyjz36kn",
    name: "Colegio Aprenderes de Tandil",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "El Colegio Aprenderes de Tandil es una institución educativa de gestión privada con una propuesta pedagógica innovadora centrada en el aprendizaje activo y significativo. Ubicado en el entorno serrano de Tandil, su proyecto educativo integra el contacto con la naturaleza y el medio ambiente como recurso pedagógico fundamental. Con grupos reducidos y un enfoque constructivista, Aprenderes ofrece una experiencia escolar diferenciada para familias que buscan alternativas pedagógicas en la ciudad."
    }
  },
  {
    id: "cmqb4ilm500i776vhzfdov3ru",
    name: "COLEGIO AYRES DEL CERRO",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Ayres del Cerro es una institución educativa privada de Tandil que toma su nombre del paisaje serrano que rodea la ciudad, reflejando una propuesta pedagógica que integra el entorno natural como parte de la experiencia de aprendizaje. Ofrece formación completa desde el nivel inicial hasta el secundario con una currícula actualizada y actividades al aire libre que favorecen el desarrollo integral. Es una opción destacada para familias tandilenses que valoran la conexión entre educación y naturaleza."
    }
  },
  {
    id: "cmqb4ilsm00jf76vhfs0wlgpz",
    name: "Colegio de la Sierra",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio de la Sierra es una institución educativa emblemática de Tandil que toma su identidad del paisaje serrano que caracteriza a esta ciudad bonaerense. Con una propuesta educativa que abarca todos los niveles escolares, el colegio integra la cultura y la historia local en su currícula, fortaleciendo el sentido de pertenencia de sus alumnos. Su infraestructura moderna y sus actividades en el entorno natural hacen de esta institución una referencia educativa en la región."
    }
  },
  {
    id: "cmqb4im6c00n376vhow32s3lr",
    name: "Colegio Estrella de Belen",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Estrella de Belén de Tandil es una institución educativa católica que guía su proyecto pedagógico bajo el símbolo de la estrella que acompañó al nacimiento de Cristo. Ofrece formación desde el jardín de infantes hasta la escuela secundaria con una propuesta que integra la fe, el servicio y la excelencia académica. La institución es valorada en Tandil por su clima institucional fraterno y por la formación integral que brinda a sus alumnos."
    }
  },
  {
    id: "cmqb4ilnh00ii76vhwf8vnf1d",
    name: "Colegio Nuestra Tierra",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "El Colegio Nuestra Tierra de Tandil es una institución educativa con una identidad fuertemente ligada al ambiente natural y cultural de la región serrana. Su propuesta pedagógica para el nivel inicial y primario incorpora el trabajo con la tierra, el huerto escolar y el respeto por el medio ambiente como ejes transversales del aprendizaje. Un espacio único donde los niños aprenden conectados con la naturaleza que rodea a la bella ciudad de Tandil."
    }
  },
  {
    id: "cmqb4ilxa00kn76vh9roazrjg",
    name: "Colegio Pilares",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Pilares de Tandil es una institución educativa privada que ofrece formación completa sustentada en valores sólidos como pilares del desarrollo personal y académico. Con una propuesta actualizada que abarca los tres niveles de escolaridad, Pilares combina la exigencia académica con el trabajo en habilidades socioemocionales y el acompañamiento personalizado. La institución es reconocida en Tandil por su ambiente ordenado y su compromiso con el bienestar y el éxito escolar de cada alumno."
    }
  },
  {
    id: "cmqb4im0k00lk76vh6ndlc052",
    name: "Colegio Primario y Secundario Nuestra Señora De Begoña",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Nuestra Señora de Begoña de Tandil es una institución educativa de inspiración vasca y católica que honra a la Virgen de Begoña, patrona del País Vasco. Su propuesta educativa para los niveles primario y secundario integra valores de identidad cultural, solidaridad y fe en una formación académica rigurosa. La institución tiene una comunidad cohesionada con raíces en la inmigración vasca que contribuyó a forjar la identidad de Tandil."
    }
  },
  {
    id: "cmqb4ilv000k176vhtknqjh8u",
    name: "Colegio Sagrada Familia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Sagrada Familia de Tandil es una institución educativa católica que toma como modelo el hogar de Nazaret para guiar su propuesta pedagógica. Ofrece los tres niveles de escolaridad con una formación basada en el amor, la responsabilidad y la fe cristiana. En el contexto serrano de Tandil, la institución brinda un ambiente familiar y acogedor donde alumnos, docentes y familias construyen juntos una comunidad educativa sólida."
    }
  },
  {
    id: "cmqb4ilw500kc76vhlvqzpx8h",
    name: "Colegio San Ignacio",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio San Ignacio de Tandil es una institución jesuita que ofrece una educación integral basada en el magis ignaciano —siempre más, siempre mejor— como principio rector de toda la propuesta educativa. Con los tres niveles de escolaridad, el colegio prepara a sus alumnos para ser personas reflexivas, abiertas al aprendizaje, comprometidas con la justicia y movidas por el amor. Su trayectoria en Tandil y la calidad de sus egresados lo posicionan como uno de los colegios de referencia de la región."
    }
  },
  {
    id: "cmqb4iltu00jq76vhku4z7rkx",
    name: "Colegio San José",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio San José de Tandil es una institución educativa católica que lleva el nombre del padre adoptivo de Jesús como símbolo del trabajo, la responsabilidad y la familia. Ofrece formación completa desde el jardín de infantes hasta la escuela secundaria con una propuesta que equilibra la exigencia académica y la formación en valores. La institución es un referente histórico de la educación privada en Tandil, con generaciones de familias que han confiado en su proyecto educativo."
    }
  },
  {
    id: "cmqb4ilkn00hw76vh7tqf5xnm",
    name: "Colegio Santa Catalina en la Sierra",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Santa Catalina en la Sierra es una institución educativa de Tandil que integra en su propuesta pedagógica la riqueza del paisaje serrano bonaerense. Con una formación completa desde el nivel inicial hasta el secundario, el colegio promueve el amor por la naturaleza, la cultura regional y los valores humanos como pilares de la educación. Su nombre evoca la rica tradición cultural del entorno serrano de Tandil, haciendo del aprendizaje una experiencia vinculada al territorio."
    }
  },
  {
    id: "cmqb4ilrc00j476vh2fs0fq5d",
    name: "Colegio Santo Domingo en la Sierra",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Santo Domingo en la Sierra de Tandil es una institución dominicana ubicada en el entorno serrano de la ciudad, que ofrece educación completa desde el nivel inicial hasta el secundario. Siguiendo la tradición intelectual de la Orden de Predicadores, su propuesta combina la búsqueda de la verdad, el rigor académico y la formación espiritual en un contexto natural privilegiado. El paisaje de las sierras de Tandil enmarca una experiencia educativa única e inspiradora."
    }
  },
  {
    id: "cmqb4im8l00np76vhodidfvk2",
    name: "Escuela Waldorf Tandil: La Colmena",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "La Escuela Waldorf La Colmena de Tandil es una institución educativa que aplica la pedagogía Waldorf desarrollada por Rudolf Steiner, adaptada al contexto serrano y cultural de la región. Su propuesta integra las artes, los ritmos naturales y el desarrollo armónico del ser humano en las dimensiones intelectual, artística y práctica. En Tandil, La Colmena es un referente de la educación alternativa y ofrece a las familias una experiencia escolar profundamente humanista y conectada con la vida."
    }
  },
  {
    id: "cmqb4im2x00m676vhj1bxfs0v",
    name: "Jardin Bambi Colegio Dal",
    payload: {
      levels: ["INICIAL"],
      description: "El Jardín Bambi, perteneciente al Colegio Dal de Tandil, es un espacio educativo dedicado al nivel inicial con una propuesta lúdica y afectiva que acompaña a los niños en sus primeros pasos escolares. Con docentes especializadas y un ambiente cálido y seguro, el jardín promueve el desarrollo del lenguaje, la socialización y las habilidades motoras a través del juego y la exploración. La articulación con los niveles superiores del Colegio Dal garantiza una continuidad pedagógica enriquecedora."
    }
  },
  {
    id: "cmqb4im7h00ne76vhucifu6w5",
    name: "Jardin Maternal y de Infantes Mameluco",
    payload: {
      levels: ["INICIAL"],
      description: "El Jardín Maternal y de Infantes Mameluco de Tandil es una institución especializada en la primera infancia que ofrece atención y educación desde los primeros meses de vida hasta el ingreso a la escuela primaria. Con un enfoque basado en el juego, el vínculo afectivo y la estimulación temprana, Mameluco brinda un espacio seguro y enriquecedor para el desarrollo integral de los más pequeños. Sus docentes especializadas acompañan cada etapa del crecimiento con sensibilidad y profesionalismo."
    }
  },
  {
    id: "cmqb4im1q00lv76vhya846s63",
    name: "Quinta San Gabriel Colegio San José",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "La Quinta San Gabriel es la sede campestre del Colegio San José de Tandil, un espacio educativo privilegiado que integra el contacto con la naturaleza en la propuesta pedagógica. Sus instalaciones en un entorno rural permiten actividades de aprendizaje al aire libre, huerta escolar y convivencias que enriquecen la formación de los alumnos. Un espacio único donde la educación se vive en conexión con la tierra y el paisaje serrano de Tandil."
    }
  },
  {
    id: "cmqb4im4500mh76vhp4biiy64",
    name: "San Francisco de Asis",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio San Francisco de Asís de Tandil es una institución franciscana que lleva el nombre del Poverello de Asís como inspiración de una educación basada en la sencillez, el amor a la naturaleza y el servicio a los demás. Ofrece los tres niveles de escolaridad con una propuesta que integra la espiritualidad franciscana con una formación académica actualizada. En el entorno serrano de Tandil, este colegio ofrece una experiencia educativa única, marcada por la cercanía, la alegría y el amor por la creación."
    }
  },
  {
    id: "cmqb4ilyd00ky76vhddj0boo2",
    name: "San José Nivel Inicial",
    payload: {
      levels: ["INICIAL"],
      description: "San José Nivel Inicial es el jardín de infantes del Colegio San José de Tandil, brindando a los más pequeños un ambiente cálido, seguro y estimulante para sus primeras experiencias escolares. Con docentes especializadas en educación inicial y una propuesta pedagógica que integra la fe y los valores del proyecto educativo del colegio, el jardín acompaña a los niños en el desarrollo de su autonomía, sociabilidad y expresión. La continuidad con los niveles superiores facilita una transición natural y contenida."
    }
  },
];

console.log(`\n✏️  Curando ${updates.length} colegios de Tandil${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

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
