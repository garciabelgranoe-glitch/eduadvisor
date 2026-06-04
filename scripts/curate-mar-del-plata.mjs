/**
 * Curación de colegios de Mar del Plata
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-mar-del-plata.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY.");
  process.exit(1);
}

const updates = [
  {
    id: "cmpq2yliv02g8rn5qgrunsxou",
    name: "Colegio Alberto Schweitzer",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico de Mar del Plata que lleva el nombre del médico y humanista Albert Schweitzer. Ofrece los niveles inicial, primario y secundario con una propuesta orientada al pensamiento crítico, la solidaridad y la formación ciudadana. Una institución valorada por las familias marplatenses por su clima inclusivo y su compromiso con el desarrollo integral de cada alumno."
    }
  },
  {
    id: "cmpq2yl0y027drn5qwtn571d5",
    name: "Colegio Bilingüe Northern Hills",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Mar del Plata con fuerte énfasis en la enseñanza del inglés desde los primeros años. Ofrece los niveles inicial, primario y secundario con un modelo de inmersión lingüística que permite a los alumnos desarrollar fluidez genuina. Una opción diferenciada para familias marplatenses que priorizan el bilingüismo como herramienta clave para el futuro de sus hijos."
    }
  },
  {
    id: "cmpq2ykyy0265rn5qrsz2xpck",
    name: "Colegio Carlos Saavedra Lamas",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata que lleva el nombre del jurista y diplomático argentino Carlos Saavedra Lamas, único latinoamericano en recibir el Premio Nobel de la Paz. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica los valores del diálogo, la paz y el compromiso internacional. Una referencia educativa en la ciudad con vocación por la excelencia académica."
    }
  },
  {
    id: "cmpq2yl00026rrn5q4fsl704t",
    name: "Colegio de las Naciones Unidas",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Mar del Plata con orientación internacional. Su nombre evoca los valores de cooperación y diversidad de las Naciones Unidas, y su propuesta pedagógica apunta a formar ciudadanos globales con perspectiva multicultural. Ofrece los niveles inicial, primario y secundario con énfasis en el inglés, la convivencia democrática y el pensamiento crítico aplicado a los desafíos del mundo contemporáneo."
    }
  },
  {
    id: "cmpq2yleh02eprn5qoue1essn",
    name: "Colegio Don Orione",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución orionista de Mar del Plata fundada bajo el carisma de San Luis Orione. Ofrece los niveles inicial, primario y secundario con una propuesta que integra formación académica y educación en valores evangélicos con atención especial a los más vulnerables. Con presencia en toda Argentina, la obra orionista en Mar del Plata tiene décadas de historia al servicio de la educación y la comunidad marplatense."
    }
  },
  {
    id: "cmpq2ylcc02dhrn5qu4ibtz2z",
    name: "Colegio Fasta San Vicente de Paul",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución católica de Mar del Plata perteneciente a la red FASTA (Fraternidad de Agrupaciones Santo Tomás de Aquino), bajo la advocación de San Vicente de Paúl. Ofrece los niveles inicial, primario y secundario con la pedagogía tomista que integra fe, razón y ciencia. Su propuesta forma alumnos con sólida base académica y valores del humanismo cristiano, preparados para el ingreso a la universidad."
    }
  },
  {
    id: "cmpq2ylac02ckrn5qtt0dz1vz",
    name: "Colegio Isaac Newton",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Mar del Plata que lleva el nombre del físico y matemático Isaac Newton. Ofrece los niveles inicial, primario y secundario con fuerte orientación científica y tecnológica. Su propuesta pedagógica privilegia el pensamiento analítico, el método científico y las matemáticas como herramientas fundamentales del aprendizaje, preparando a los alumnos para carreras universitarias en ciencias exactas e ingeniería."
    }
  },
  {
    id: "cmpq2yky1025jrn5q4u6ycltq",
    name: "Colegio Leonardo Da Vinci",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Mar del Plata que lleva el nombre del genio renacentista Leonardo Da Vinci. Ofrece los niveles inicial, primario y secundario con una propuesta que integra arte, ciencia y tecnología como pilares del aprendizaje. Su perfil creativo e innovador apunta a desarrollar las múltiples inteligencias del alumno, fomentando la curiosidad, la experimentación y la expresión desde los primeros años."
    }
  },
  {
    id: "cmpq2yl8902bcrn5qwxj0ufl7",
    name: "Colegio Luis Federico Leloir",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata que lleva el nombre del bioquímico argentino Luis Federico Leloir, Premio Nobel de Química 1970. Ofrece los niveles inicial, primario y secundario con orientación científica en homenaje a uno de los investigadores más destacados de la historia argentina. Su propuesta pedagógica privilegia las ciencias naturales, la investigación y el pensamiento experimental."
    }
  },
  {
    id: "cmpq2yl1x027zrn5qv7lqit3u",
    name: "Colegio Musical IDRA",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata con una propuesta educativa que integra la música como eje transversal del aprendizaje. Ofrece los niveles inicial, primario y secundario con formación musical especializada junto al currículo oficial. Una opción única en la ciudad para familias que valoran la educación artística como componente esencial del desarrollo integral de sus hijos."
    }
  },
  {
    id: "cmpq2yle002eern5qsypnxgmp",
    name: "Colegio Nuestra Señora del Carmen",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Mar del Plata bajo la advocación de Nuestra Señora del Carmen. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción carmelita con una formación académica sólida. Su comunidad educativa valora el clima espiritual, el acompañamiento personalizado y la tradición institucional que la distingue en el sistema educativo marplatense."
    }
  },
  {
    id: "cmpq2yl7p02b1rn5qyn63xsbr",
    name: "Colegio Privado Fleming",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Mar del Plata que lleva el nombre del científico Alexander Fleming, descubridor de la penicilina. Ofrece los niveles inicial, primario y secundario con orientación científica y una propuesta pedagógica que privilegia la investigación, la experimentación y el pensamiento crítico. Una referencia educativa en la ciudad para familias que buscan una formación con perfil científico-humanístico."
    }
  },
  {
    id: "cmpq2yl3p028wrn5qth6p01xd",
    name: "Colegio San Agustín OAR",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución agustiniana recoleta de Mar del Plata perteneciente a la Orden de Agustinos Recoletos (OAR). Ofrece los niveles inicial, primario y secundario con la espiritualidad agustiniana centrada en la búsqueda de la verdad, el amor y la interioridad. Con presencia histórica en la ciudad, el Colegio San Agustín OAR forma alumnos con sólida preparación académica y vocación espiritual."
    }
  },
  {
    id: "cmpq2ylib02fxrn5qcyyslu8f",
    name: "Colegio San Jerónimo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado católico de Mar del Plata bajo el patronazgo de San Jerónimo, Doctor de la Iglesia y patrono de los traductores. Ofrece los niveles inicial, primario y secundario con una propuesta que combina rigor académico y formación en valores. Su identidad institucional privilegia el estudio, la disciplina intelectual y el amor por el conocimiento, características asociadas al patrono que da nombre a la institución."
    }
  },
  {
    id: "cmpq2yll102h5rn5qwt5u8dhe",
    name: "Colinas de Peralta Ramos",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada ubicada en el barrio Peralta Ramos de Mar del Plata, uno de los sectores residenciales más tranquilos de la ciudad. Ofrece los niveles inicial, primario y secundario con una propuesta pedagógica integral en un entorno natural privilegiado. Su ubicación y propuesta la convierten en una referencia educativa para las familias del sur marplatense."
    }
  },
  {
    id: "cmpq2yl58029trn5qon33sver",
    name: "Escuela Cooperativa Amuyen",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa organizada como cooperativa de enseñanza en Mar del Plata. Amuyen —que significa 'juntos' en mapuche— refleja una propuesta de gestión participativa donde la comunidad tiene voz activa. Ofrece los niveles inicial, primario y secundario con un modelo pedagógico que privilegia la autogestión, la solidaridad y el aprendizaje colaborativo como valores fundantes del proyecto educativo."
    }
  },
  {
    id: "cmpq2yl6z02aqrn5qddx2dtet",
    name: "Escuela Huinco Monseñor Enrique Rau",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description:
        "Institución educativa de Mar del Plata que lleva el nombre del Monseñor Enrique Rau, histórico obispo de la diócesis marplatense. Su nombre Huinco —que en mapuche significa 'lazo' o 'unión'— refleja una propuesta centrada en los vínculos, la comunidad y la pertenencia. Ofrece los niveles inicial y primario con un modelo educativo que privilegia la inclusión y el acompañamiento integral."
    }
  },
  {
    id: "cmpq2ykzj026grn5qd3mopuj5",
    name: "Holy Trinity College - Colegio Santísima Trinidad",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Mar del Plata con tradición anglicana, conocido en la ciudad como Holy Trinity. Ofrece los niveles inicial, primario y secundario con una propuesta de inmersión en inglés y formación en valores del humanismo cristiano. Una de las referencias del bilingüismo en Mar del Plata, valorado por las familias por su exigencia académica y el perfil internacional de sus egresados."
    }
  },
  {
    id: "cmpq2ylf202f0rn5qrw3hwsgl",
    name: "ICT - Instituto Carlos Tejedor",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata que lleva el nombre del jurista y político argentino Carlos Tejedor, autor del primer Código Penal de la Argentina. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia la formación cívica, el derecho y la cultura del trabajo. Una institución con identidad propia en el sistema educativo marplatense."
    }
  },
  {
    id: "cmpq2yl9v02c9rn5qg09zyxxs",
    name: "Institución Educativa Dr. Alberto Schweitzer",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa privada de Mar del Plata que rinde homenaje al Dr. Albert Schweitzer, Premio Nobel de la Paz y referente del humanismo universal. Ofrece los niveles inicial, primario y secundario con una propuesta orientada a la solidaridad, el respeto por la vida y la formación ciudadana. Su enfoque humanístico se traduce en una educación que privilegia el desarrollo ético y el compromiso social."
    }
  },
  {
    id: "cmpq2ylhr02fmrn5qp5gyuv5s",
    name: "Instituto Antártida Argentina",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata que lleva el nombre del territorio antártico argentino, evocando la soberanía y el compromiso nacional. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica la identidad argentina y la formación ciudadana. Su nombre refuerza el vínculo con la geografía nacional y el orgullo por el patrimonio territorial de Argentina."
    }
  },
  {
    id: "cmpq2yl5q02a4rn5qbh80lnhi",
    name: "Instituto Argentino Modelo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata con los niveles inicial, primario y secundario. Su nombre refleja una vocación de excelencia y calidad educativa que lo convierte en un referente del sistema privado marplatense. Con décadas de trayectoria en la ciudad, ofrece una formación integral que combina sólida preparación académica con desarrollo humano y actividades extracurriculares."
    }
  },
  {
    id: "cmpq2yl1g027orn5qyhjn7r3w",
    name: "Instituto Ayelén",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata cuyo nombre Ayelén —que en mapuche significa 'alegría'— refleja una propuesta educativa centrada en el bienestar emocional y el aprendizaje positivo. Ofrece los niveles inicial, primario y secundario con un enfoque que privilegia el clima afectivo, la motivación intrínseca y el desarrollo de la autoestima como bases del aprendizaje significativo."
    }
  },
  {
    id: "cmpq2yl8q02bnrn5q7dnj7x07",
    name: "Instituto Domingo Faustino Sarmiento",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata que lleva el nombre del gran educador y presidente argentino Domingo Faustino Sarmiento. Ofrece los niveles inicial, primario y secundario rindiendo homenaje al impulsor de la educación pública en Argentina. Su propuesta pedagógica refleja los valores sarmientinos de esfuerzo, conocimiento y formación ciudadana como herramientas de progreso y movilidad social."
    }
  },
  {
    id: "cmpq2yl36028lrn5q7jkr3ku8",
    name: "Instituto Educativo Julio Cortázar",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata que lleva el nombre del escritor argentino Julio Cortázar, uno de los grandes maestros de la literatura latinoamericana. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia la lectura, la escritura creativa y las artes como ejes del aprendizaje. Su identidad literaria se traduce en una educación que estimula la imaginación y el pensamiento divergente."
    }
  },
  {
    id: "cmpq2yl2g028arn5qe43chdie",
    name: "Instituto Educativo Punta Mogotes",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata ubicado en la zona de Punta Mogotes, sector costero al sur de la ciudad. Ofrece los niveles inicial, primario y secundario con una propuesta educativa que aprovecha el entorno natural costero como recurso pedagógico. Su ubicación lo convierte en la referencia educativa privada de la zona sur marplatense para las familias de esa área."
    }
  },
  {
    id: "cmpq2ylh202fbrn5q6fnl3t6v",
    name: "Instituto Educativo YUMBEL",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Instituto de educación secundaria privado de Mar del Plata. Ofrece el bachillerato con una propuesta que combina formación académica sólida con orientación vocacional y acompañamiento en la transición hacia los estudios superiores. Su nombre evoca raíces culturales americanas y su proyecto apunta a formar jóvenes con identidad propia y herramientas para el mundo universitario y laboral."
    }
  },
  {
    id: "cmpq2ylkh02gurn5qtcagfqch",
    name: "Instituto Inmaculada Concepción",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Mar del Plata bajo la advocación de la Inmaculada Concepción de María. Ofrece los niveles inicial, primario y secundario con una propuesta que combina rigor académico y formación en valores marianos. Con presencia histórica en la ciudad, es una de las instituciones más queridas por la comunidad católica marplatense por su clima espiritual y su compromiso con la educación integral."
    }
  },
  {
    id: "cmpq2ykyh025urn5q2key0mxs",
    name: "Instituto Juan Gutenberg",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata que lleva el nombre de Johannes Gutenberg, inventor de la imprenta moderna. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia la lectura, la cultura escrita y el acceso al conocimiento como herramientas de transformación social. Su identidad vinculada a la difusión del saber se traduce en un proyecto educativo que valora el libro y el aprendizaje permanente."
    }
  },
  {
    id: "cmpq2ylje02gjrn5qv6a1t5nj",
    name: "Instituto Julio Verne",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata que lleva el nombre del escritor francés Julio Verne, padre de la ciencia ficción. Ofrece los niveles inicial, primario y secundario con una propuesta que estimula la imaginación, la curiosidad científica y la exploración del conocimiento. Su nombre evoca la aventura del saber y su proyecto educativo apunta a formar alumnos con espíritu explorador y pasión por descubrir el mundo."
    }
  },
  {
    id: "cmpq2yl6b02afrn5q5jog31o4",
    name: "Instituto Juvenilia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata cuyo nombre evoca la clásica obra de Marco Avellaneda sobre la vida estudiantil porteña. Ofrece los niveles inicial, primario y secundario con una propuesta pedagógica que privilegia la formación humanística, la literatura argentina y la identidad cultural. Una institución con vocación por la educación clásica en el sistema privado marplatense."
    }
  },
  {
    id: "cmpq2yl0h0272rn5qql4azq8v",
    name: "Instituto Minerva",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata cuyo nombre evoca a Minerva, diosa romana de la sabiduría y las artes. Ofrece los niveles inicial, primario y secundario con una propuesta orientada a la excelencia intelectual y el desarrollo de las habilidades artísticas. Su identidad humanística se traduce en una educación que valora tanto el rigor académico como la expresión creativa como dimensiones complementarias de la formación integral."
    }
  },
  {
    id: "cmpq2yldi02e3rn5qkun183t1",
    name: "Instituto Ortega y Gasset",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata que lleva el nombre del filósofo español José Ortega y Gasset, uno de los intelectuales más influyentes del siglo XX en el mundo hispánico. Ofrece los niveles inicial, primario y secundario con una propuesta filosófica y humanística que privilegia el pensamiento crítico, el debate de ideas y la formación ciudadana. Una institución con identidad intelectual clara en el sistema privado marplatense."
    }
  },
  {
    id: "cmpq2ylbp02d6rn5qgc8g3cg3",
    name: "Instituto Peralta Ramos",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata ubicado en el barrio Peralta Ramos, sector residencial al sur de la ciudad. Lleva el nombre del fundador del balneario de Mar del Plata, Patricio Peralta Ramos, y tiene profundo arraigo en la comunidad del sur marplatense. Ofrece los niveles inicial, primario y secundario con una propuesta educativa integral y cercana a las familias de la zona."
    }
  },
  {
    id: "cmpq2yl4p029irn5qw9psyhpg",
    name: "Instituto Rosario de Santa Fe",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata con los niveles inicial, primario y secundario. Su propuesta pedagógica combina formación académica sólida con desarrollo humano y valores. Reconocido en la ciudad por el compromiso de su equipo docente y el acompañamiento personalizado que brinda a cada alumno a lo largo de toda su trayectoria escolar."
    }
  },
  {
    id: "cmpq2ylcu02dsrn5q02qjrqph",
    name: "Instituto San Alberto",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Mar del Plata bajo la advocación de San Alberto Magno, patrono de los científicos y filósofos. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la tradición dominicana del saber con las exigencias pedagógicas contemporáneas. Su enfoque combina rigor intelectual y formación en valores, preparando alumnos para los estudios superiores."
    }
  },
  {
    id: "cmpq2yl470297rn5qdzhuwp2p",
    name: "Instituto Santa Cecilia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Mar del Plata bajo la advocación de Santa Cecilia, patrona de la música. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la formación musical en el proyecto pedagógico institucional. Su identidad artística se traduce en un ambiente educativo que valora la expresión, la sensibilidad estética y el desarrollo de la dimensión creativa de cada alumno."
    }
  },
  {
    id: "cmpq2ylax02cvrn5qnvilonjd",
    name: "Instituto Superior IDRA",
    payload: {
      levels: ["SUPERIOR"],
      description:
        "Instituto de educación superior privado de Mar del Plata que ofrece carreras terciarias con orientación pedagógica y profesional. Su propuesta académica combina formación teórica sólida con práctica intensiva, preparando docentes y profesionales para el mercado laboral. Una opción reconocida en Mar del Plata para quienes buscan formación de nivel superior con identidad local y compromiso con la calidad educativa."
    }
  },
  {
    id: "cmpq2yl9902byrn5qebag9u2l",
    name: "ISNA - Instituto San Nicolás de los Arroyos",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mar del Plata con los niveles inicial, primario y secundario. Su propuesta educativa combina excelencia académica con formación en valores y actividades extracurriculares que enriquecen el desarrollo integral del alumno. Reconocido en la ciudad por el compromiso institucional y el trabajo cercano con las familias marplatenses."
    }
  },
  {
    id: "cmpq2yllk02hgrn5qybntnuw4",
    name: "Jardín Perito Moreno",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes privado de Mar del Plata que lleva el nombre del explorador y naturalista Francisco Moreno, el Perito Moreno. Atiende niños de 2 a 5 años con una propuesta que estimula la curiosidad, la exploración del entorno natural y el amor por la naturaleza. Un ambiente cálido y aventurero donde los más pequeños aprenden a descubrir el mundo con la misma pasión del gran explorador patagónico."
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

console.log(`\n🏫  Curando ${updates.length} colegios de Mar del Plata...\n`);

for (const { id, name, payload } of updates) {
  await patchSchool(id, name, payload);
}

console.log("\n✨  Listo.\n");
