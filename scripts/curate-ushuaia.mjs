/**
 * Curación de colegios de Ushuaia.
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-ushuaia.mjs [--dry-run]
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
    id: "cmqb4k82v011t76vhingfiert",
    name: "Centro Polivalente de Arte Prof. Inés María Bustelo",
    payload: {
      levels: ["SECUNDARIA"],
      description: "El Centro Polivalente de Arte Prof. Inés María Bustelo es la escuela de artes de referencia en Ushuaia, la ciudad más austral del mundo. Ofrece formación secundaria con orientaciones artísticas en artes visuales, música y expresión corporal, preparando a jóvenes fueguinos para estudios superiores de arte. Su nombre honra a una destacada docente y promotora cultural de la provincia, y su propuesta integra la identidad cultural fueguina y patagónica en todas sus expresiones artísticas."
    }
  },
  {
    id: "cmqb4k7ni00xj76vhbl8gvnt7",
    name: "C.I.E.U - Libertador Gral. San Martín",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Centro Integral de Educación Ushuaia Libertador General San Martín es una institución educativa de Ushuaia que ofrece formación primaria y secundaria en la capital de Tierra del Fuego. Con una propuesta actualizada y adaptada al contexto fueguino, prepara a sus alumnos para los desafíos académicos y profesionales en una de las regiones más dinámicas del país por su desarrollo industrial y turístico. La institución integra la identidad patagónica y el orgullo por el territorio austral argentino en su proyecto educativo."
    }
  },
  {
    id: "cmqb4k7sz00z276vhb8hyfk6z",
    name: "Colegio de Educación Secundaria BICONTINENTAL Juana Azurduy",
    payload: {
      levels: ["SECUNDARIA"],
      description: "El Colegio Bicontinental Juana Azurduy de Ushuaia lleva el nombre de la heroína mestiza que luchó por la independencia americana, como símbolo de resistencia y soberanía. Su nombre bicontinental refleja la posición única de Ushuaia como puerta a dos continentes y evoca la conexión de la Argentina con la Antártida. Con una propuesta de bachillerato orientado, prepara a los jóvenes fueguinos para asumir con orgullo la identidad y las responsabilidades históricas del extremo sur del mundo."
    }
  },
  {
    id: "cmqb4k7hp00w076vh4jttvp26",
    name: "Colegio del Sur",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "El Colegio del Sur de Ushuaia es una institución educativa privada que reivindica en su nombre la identidad austral de la ciudad más meridional del mundo. Ofrece formación inicial y primaria con una propuesta pedagógica adaptada a las particularidades climáticas y culturales de Tierra del Fuego. Con un equipo docente comprometido y un ambiente cálido que contrasta con el riguroso clima fueguino, el colegio brinda a los niños de Ushuaia una experiencia educativa de calidad en el fin del mundo."
    }
  },
  {
    id: "cmqb4k7u300zd76vhklqi1zm4",
    name: "Colegio del Sur - Secundaria",
    payload: {
      levels: ["SECUNDARIA"],
      description: "El Colegio del Sur Secundaria de Ushuaia es la continuación del nivel primario de esta institución privada, completando la formación de los jóvenes fueguinos hasta el egreso del bachillerato. Con una propuesta orientada a la preparación universitaria y al desarrollo de competencias para el mercado laboral fueguino, acompaña a sus alumnos en una etapa fundamental de su crecimiento personal y académico. La institución mantiene el espíritu austral que define su identidad, preparando ciudadanos orgullosos de su origen en el extremo sur de la Argentina."
    }
  },
  {
    id: "cmqb4k7k100wm76vh1jm9yomp",
    name: "Colegio Julio Verne",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Julio Verne de Ushuaia lleva el nombre del visionario escritor francés que imaginó mundos extraordinarios, incluyendo el extremo sur del planeta donde está ubicada la institución. Su propuesta educativa completa —desde el nivel inicial hasta el secundario— integra la ciencia, la imaginación y la aventura del conocimiento como valores centrales. En la ciudad más austral del mundo, el Colegio Julio Verne forma exploradores del saber, preparados para descubrir y transformar el mundo con la misma audacia del Capitán Nemo."
    }
  },
  {
    id: "cmqb4k7iu00wb76vhm1ovfss7",
    name: "Colegio Nacional de Ushuaia",
    payload: {
      levels: ["SECUNDARIA"],
      description: "El Colegio Nacional de Ushuaia es la institución secundaria pública más emblemática de la capital de Tierra del Fuego, con una historia paralela al desarrollo de la provincia. Con un bachillerato completo y una sólida formación humanística, el Colegio Nacional prepara a generaciones de jóvenes fueguinos para los estudios superiores y para asumir roles protagónicos en el desarrollo de la provincia más joven del país. Su carácter nacional y su arraigo comunitario lo convierten en un símbolo de la educación pública en el fin del mundo."
    }
  },
  {
    id: "cmqb4k7l700wx76vhox6tarb2",
    name: "Colegio Provincial Dr. José M. Sobral",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Provincial Dr. José María Sobral de Ushuaia lleva el nombre del primer argentino en llegar a la Antártida, en homenaje al espíritu explorador y científico que define a Tierra del Fuego. Su propuesta educativa para los niveles primario y secundario integra el conocimiento de la geografía austral, la historia provincial y las ciencias naturales como ejes transversales. Una institución que forma ciudadanos orgullosos de su tierra y conscientes del rol estratégico que ocupa la Argentina en el extremo sur del mundo."
    }
  },
  {
    id: "cmqb4k80r011776vhy3o9t0ww",
    name: "Colegio Provincial Ernesto Sabato",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Provincial Ernesto Sábato de Ushuaia lleva el nombre del célebre escritor y humanista argentino como homenaje a la cultura, la ciencia y la reflexión crítica. Con una propuesta educativa que abarca los niveles primario y secundario, la institución promueve el amor por la lectura, la escritura y el pensamiento independiente entre los jóvenes fueguinos. En la ciudad del fin del mundo, el Colegio Sábato forma ciudadanos reflexivos y comprometidos con la construcción de una sociedad más justa y humanista."
    }
  },
  {
    id: "cmqb4k7xh010a76vhwzfh3he5",
    name: "Colegio Provincial Eva Duarte de Perón",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Provincial Eva Duarte de Perón de Ushuaia lleva el nombre de la Primera Dama más icónica de la Argentina, símbolo de la justicia social y el derecho a la educación para todos. Con una propuesta educativa inclusiva para los niveles primario y secundario, la institución encarna los valores de igualdad y oportunidad que caracterizaron la obra de Evita. En Ushuaia, este colegio forma ciudadanos con conciencia social y vocación de servicio hacia su comunidad en el extremo sur del país."
    }
  },
  {
    id: "cmqb4k7pp00y576vhjn393y3g",
    name: "Colegio Provincial José Martí",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Provincial José Martí de Ushuaia lleva el nombre del poeta y patriota cubano como símbolo de la lucha por la libertad y la dignidad de los pueblos americanos. Con una propuesta educativa que abarca los niveles primario y secundario, la institución promueve los valores de la solidaridad latinoamericana y el compromiso con los derechos humanos. En la ciudad más austral del continente, el Colegio Martí forma ciudadanos con una visión continental y un profundo sentido de pertenencia a la patria grande americana."
    }
  },
  {
    id: "cmqb4k7qt00yg76vh9zi3s2gz",
    name: "Colegio Provincial Kloketen",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Provincial Kloketen de Ushuaia toma su nombre de la ceremonia de iniciación del pueblo Selknam, los habitantes originarios de Tierra del Fuego, reivindicando la identidad y la memoria de los pueblos originarios fueguinos. Con una propuesta educativa intercultural para los niveles primario y secundario, la institución integra la historia y la cultura selknam en su currícula, rescatando un legado que es patrimonio de la humanidad. Un colegio que forma ciudadanos orgullosos de la historia completa de su tierra."
    }
  },
  {
    id: "cmqb4k7v800zo76vhnr9gwdpt",
    name: "Colegio Salesiano Don Bosco",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Salesiano Don Bosco de Ushuaia es la institución salesiana más austral del mundo, con una historia profundamente ligada a la presencia de los misioneros salesianos que evangelizaron y educaron a los pueblos originarios de Tierra del Fuego. Ofrece formación completa desde el nivel inicial hasta el secundario con la impronta característica de Don Bosco: razón, religión y amor. Con más de un siglo de presencia en el fin del mundo, es un símbolo de la educación y de la identidad cultural de Ushuaia."
    }
  },
  {
    id: "cmqb4k7wc00zz76vhsg3v4p02",
    name: "Colegio Técnico Provincial Antonio Martín Marte",
    payload: {
      levels: ["SECUNDARIA"],
      description: "El Colegio Técnico Provincial Antonio Martín Marte de Ushuaia es la institución de referencia en formación técnica de Tierra del Fuego, preparando a los jóvenes para las industrias clave de la provincia como la electrónica, la manufactura y el turismo. Con orientaciones técnicas actualizadas y una infraestructura de talleres y laboratorios modernos, la institución forma técnicos altamente capacitados que contribuyen al desarrollo productivo de una de las provincias más dinámicas de la Argentina. Sus egresados son altamente requeridos por las industrias radicadas en el polo industrial de Ushuaia."
    }
  },
  {
    id: "cmqb4k7mc00x876vhhh93d0eb",
    name: "Col. Monseñor Alemán",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Monseñor Alemán de Ushuaia lleva el nombre de uno de los primeros obispos que trabajó por la evangelización y la educación en Tierra del Fuego, reconociendo la labor de la Iglesia Católica en la historia de la provincia. Ofrece formación completa desde el jardín de infantes hasta el secundario con una propuesta educativa que combina la fe, la cultura fueguina y la excelencia académica. La institución es un referente de la educación católica en Ushuaia con generaciones de familias que han formado parte de su comunidad educativa."
    }
  },
  {
    id: "cmqb4k7om00xu76vhaqb6at33",
    name: "Col. Prov. Los Andes",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Provincial Los Andes de Ushuaia lleva en su nombre la majestuosidad de la cordillera que define el perfil geográfico de la Argentina, incluyendo el imponente paisaje montañoso que rodea a la capital fueguina. Con una propuesta educativa para los niveles primario y secundario, la institución integra el conocimiento del entorno natural patagónico-fueguino como parte fundamental de la formación de sus alumnos. Un colegio que forma ciudadanos con profundo amor y respeto por el territorio más salvaje y hermoso del país."
    }
  },
  {
    id: "cmqb4k7zn010w76vhyc3bv8mu",
    name: "CTP Olga Bronzovich de Arko",
    payload: {
      levels: ["SECUNDARIA"],
      description: "El Centro de Terminalidad Primaria Olga Bronzovich de Arko de Ushuaia es una institución educativa que lleva el nombre de una destacada educadora fueguina en reconocimiento a su labor con los sectores más vulnerables de la comunidad. Con una propuesta de terminalidad y formación secundaria orientada a adultos y jóvenes que no pudieron completar sus estudios en tiempo y forma, el CTP garantiza el derecho a la educación de todos los ciudadanos de Ushuaia sin distinción de edad ni condición social."
    }
  },
  {
    id: "cmqb4k7rw00yr76vhcmuf1rz5",
    name: "Emei - Escuela Modelo de Educación Integral",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "EMEI – Escuela Modelo de Educación Integral de Ushuaia es una institución educativa que propone una alternativa pedagógica innovadora en la ciudad más austral del mundo. Con una propuesta que abarca todos los niveles de escolaridad, el EMEI integra metodologías constructivistas, trabajo por proyectos y educación socioemocional en un modelo que busca el desarrollo pleno de cada alumno. Su carácter de 'escuela modelo' refleja el compromiso con la búsqueda permanente de la excelencia y la innovación pedagógica en el contexto fueguino."
    }
  },
  {
    id: "cmqb4k7yj010l76vh3rdikgsm",
    name: "Escuela Experimental Los Alakalufes",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "La Escuela Experimental Los Alakalufes de Ushuaia lleva el nombre del pueblo canoero que habitó los canales fueguinos, rescatando la memoria de los primeros habitantes del fin del mundo. Con un carácter experimental que le permite desarrollar propuestas pedagógicas innovadoras, la institución integra la historia y la cultura de los pueblos originarios de Tierra del Fuego en su currícula como elemento central de la identidad fueguina. Una escuela única que combina la vanguardia pedagógica con el respeto por las raíces más profundas del territorio austral."
    }
  },
  {
    id: "cmqb4k81t011i76vhw741p6dt",
    name: "Fundacion Maria Auxiliadora",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "La Fundación María Auxiliadora de Ushuaia es una institución educativa salesiana que ofrece educación inicial y primaria con una propuesta centrada en el amor, la contención y la formación en valores inspirada en la Virgen María Auxiliadora, patrona de las instituciones salesianas. Con una trayectoria ligada a la misión salesiana en Tierra del Fuego, la fundación brinda educación de calidad a familias de Ushuaia en el contexto de la ciudad más austral del mundo. Su ambiente cálido y su compromiso con cada alumno reflejan el espíritu de Don Bosco de dar todo por los jóvenes."
    }
  },
];

console.log(`\n✏️  Curando ${updates.length} colegios de Ushuaia${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

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
