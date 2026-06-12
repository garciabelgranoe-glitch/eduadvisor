/**
 * Curación de colegios de Bernal.
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-bernal.mjs [--dry-run]
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
    id: "cmpq37we1057rrn5qvr1eqgay",
    name: "Colegio Aleman Eduardo L. Holmberg",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Alemán Eduardo L. Holmberg es una institución de larga trayectoria en Bernal que combina la formación académica de excelencia con la enseñanza del idioma alemán desde los primeros años. Su propuesta educativa integra valores humanistas y una sólida base científica, preparando a los alumnos para los desafíos del mundo globalizado. Con instalaciones modernas y un cuerpo docente comprometido, ofrece una experiencia escolar enriquecedora para familias que valoran el plurilingüismo."
    }
  },
  {
    id: "cmpq37wv605hsrn5q794pjxsi",
    name: "Colegio Del Alto Sol",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Del Alto Sol es una institución privada de Bernal que ofrece formación desde el nivel inicial hasta la educación secundaria, brindando continuidad pedagógica en un mismo espacio. Su proyecto educativo se centra en el desarrollo integral de los alumnos, promoviendo valores de convivencia, creatividad y responsabilidad social. La institución destaca por su ambiente familiar y su dedicación al acompañamiento personalizado de cada estudiante."
    }
  },
  {
    id: "cmqaxpwth003e76vhobyelzxd",
    name: "Colegio del Niño Jesus y PATER C.E.",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "El Colegio del Niño Jesús y PATER es una institución de inspiración católica ubicada en Bernal que combina dos proyectos educativos con una visión compartida de formación en valores. Ofrece nivel inicial y primario con un enfoque en el desarrollo espiritual y académico de los niños. Su comunidad educativa destaca por el trabajo conjunto entre familias y docentes en pos del crecimiento integral de los alumnos."
    }
  },
  {
    id: "cmqaxpwo8002676vhrhv1g2lr",
    name: "Colegio Nuestra Señora De La Guardia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Nuestra Señora de la Guardia es una institución católica de Bernal con décadas de historia en la formación de generaciones de familias del sur del Gran Buenos Aires. Ofrece una propuesta educativa integral desde el jardín de infantes hasta el secundario, basada en principios evangélicos y una exigencia académica reconocida por la comunidad local. Su capilla, sus espacios amplios y su tradición salesiana hacen de este colegio un referente en la zona."
    }
  },
  {
    id: "cmqaxpx3g005o76vhlbm9curd",
    name: "Colegio Perito Moreno",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Perito Moreno de Bernal es una institución privada que brinda educación primaria y secundaria con una orientación técnico-humanística. Su nombre rinde homenaje al célebre explorador y científico argentino, valores que se reflejan en una propuesta educativa que estimula la curiosidad intelectual y el amor por el conocimiento. La institución cuenta con una sólida trayectoria en el barrio y es reconocida por su compromiso con la excelencia y la formación ciudadana."
    }
  },
  {
    id: "cmpq37wvw05i3rn5qssvrje0m",
    name: "Colegio Privado Bernal",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Privado Bernal es una institución laica que ofrece cobertura educativa completa desde el nivel inicial hasta la escuela secundaria en el corazón de Bernal. Su propuesta pedagógica combina una enseñanza actualizada con un fuerte trabajo en habilidades socioemocionales y pensamiento crítico. Con grupos reducidos y atención personalizada, garantiza un seguimiento cercano del proceso de aprendizaje de cada alumno."
    }
  },
  {
    id: "cmqaxpwfm000g76vhylqbhmm9",
    name: "Colegio Privado Felix Bernal SRL",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "El Colegio Privado Felix Bernal es una institución de gestión privada orientada a la educación inicial y primaria en la ciudad de Bernal. Con un estilo de enseñanza cercano y personalizado, fomenta la autonomía y el aprendizaje significativo desde los primeros años escolares. Su comunidad educativa valora el vínculo afectivo entre docentes y alumnos como base para un desarrollo cognitivo sólido y duradero."
    }
  },
  {
    id: "cmqaxpww3003y76vhjw3wvfm7",
    name: "Hogar Escuela Don Bosco",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Hogar Escuela Don Bosco de Bernal es una institución salesiana que combina la misión educativa con la acción social, brindando contención y formación a jóvenes en situación de vulnerabilidad. Siguiendo el sistema preventivo de San Juan Bosco, promueve una educación basada en la razón, la religión y el amor, con especial énfasis en la integración social y el desarrollo de oficios. Es un referente comunitario del sur del GBA con décadas de compromiso con los más necesitados."
    }
  },
  {
    id: "cmpq37wu405h6rn5qkdgnv46b",
    name: "INNOVA",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "INNOVA es un colegio privado de Bernal que propone un modelo educativo centrado en la innovación pedagógica y el desarrollo de competencias del siglo XXI. Su enfoque integra la tecnología, el trabajo colaborativo y el pensamiento creativo en todas las etapas de la escolaridad, desde el nivel inicial hasta el secundario. La institución apuesta por una educación que prepara a los alumnos no solo académicamente sino también como ciudadanos capaces de resolver problemas complejos."
    }
  },
  {
    id: "cmqaxpwpj002h76vhnfx9px7b",
    name: "Instituto María Auxiliadora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto María Auxiliadora de Bernal es una institución salesiana femenina con una larga historia de educación en valores cristianos y excelencia académica. Ofrece formación desde el jardín maternal hasta el nivel secundario, con una impronta especial en el desarrollo del liderazgo femenino y la participación comunitaria. Su ambiente de calidez y pertenencia es reconocido por las familias que eligen esta institución generación tras generación."
    }
  },
  {
    id: "cmqaxpwxe004976vhvfgvyjoy",
    name: "Instituto Monseñor Nicolás Esandi",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Monseñor Nicolás Esandi es una institución educativa católica de Bernal que lleva el nombre del primer obispo de la diócesis de Quilmes. Ofrece educación primaria y secundaria con un fuerte componente en la formación en valores, la fe y el compromiso social. Su proyecto educativo busca formar personas íntegras, comprometidas con su comunidad y preparadas para los desafíos de la vida universitaria y profesional."
    }
  },
  {
    id: "cmqaxpwhy000r76vhan2fh90k",
    name: "Instituto Proyección XXI",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Proyección XXI es una institución educativa privada que ofrece educación primaria y secundaria con una visión orientada al futuro y las exigencias del mundo contemporáneo. Su nombre refleja el compromiso con una formación actualizada que incorpora tecnología, idiomas y pensamiento crítico en su currícula. Con sede en la zona sur del GBA, se destaca por su clima institucional ordenado y su propuesta académica exigente."
    }
  },
  {
    id: "cmqaxpwmx001v76vhf6inrzam",
    name: "Instituto República Argentina",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto República Argentina es una institución educativa privada de Bernal con una propuesta laica y patriótica que ofrece formación completa desde el nivel inicial hasta la educación secundaria. Su nombre evoca el compromiso con los valores democráticos y la identidad nacional, presentes en su proyecto educativo cotidiano. La institución se distingue por su infraestructura completa y su equipo docente estable y comprometido con la comunidad escolar."
    }
  },
  {
    id: "cmqaxpwlp001k76vhyrmvrz2n",
    name: "Jardín de Infantes Topo Gigio del Colegio Almafuerte",
    payload: {
      levels: ["INICIAL"],
      description: "El Jardín de Infantes Topo Gigio forma parte de la red educativa del Colegio Almafuerte en Bernal, ofreciendo una propuesta pedagógica lúdica y afectiva para los más pequeños. Con grupos reducidos y un equipo docente especializado en educación temprana, brinda un espacio seguro y estimulante donde los niños desarrollan su autonomía, socialización y habilidades cognitivas básicas. La articulación con los niveles superiores del colegio garantiza una transición fluida y contenida."
    }
  },
  {
    id: "cmqaxpwyn004k76vhvglxkva4",
    name: "Macnab Bernal",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Macnab Bernal es una institución educativa bilingüe de reconocida trayectoria en el sur del Gran Buenos Aires que ofrece formación completa desde el nivel inicial hasta el secundario. Su propuesta pedagógica integra el inglés como lengua de instrucción en diversas materias, preparando a los alumnos para un mundo globalizado. Con instalaciones modernas, actividades extracurriculares variadas y un fuerte vínculo con las familias, Macnab es una opción destacada para quienes buscan educación bilingüe de calidad en Bernal."
    }
  },
  {
    id: "cmqaxpwqu002s76vh3v2z294s",
    name: "NES - Nueva Escuela del Sur",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "NES – Nueva Escuela del Sur es una institución educativa privada de Bernal que ofrece los tres niveles de escolaridad con una propuesta pedagógica innovadora y orientada al desarrollo integral. Su nombre refleja una visión renovada de la educación en el sur del GBA, apostando por metodologías activas, trabajo por proyectos y formación en valores ciudadanos. La institución es una alternativa moderna y comprometida para familias que buscan calidad educativa con identidad comunitaria."
    }
  },
  {
    id: "cmqaxpwzv004v76vh6muajwws",
    name: "Nivel Primario del Colegio Almafuerte",
    payload: {
      levels: ["PRIMARIA"],
      description: "El Nivel Primario del Colegio Almafuerte forma parte de una institución educativa consolidada en Bernal, con una propuesta académica sólida y un ambiente formativo exigente y contenedor. La escuela primaria trabaja en continuidad con los niveles inicial y secundario del colegio, garantizando una coherencia pedagógica a lo largo de toda la escolaridad. Su cuerpo docente estable y comprometido asegura un seguimiento personalizado del aprendizaje de cada alumno."
    }
  },
  {
    id: "cmqaxpws5003376vhbttr1bow",
    name: "Nivel Secundario del Colegio Almafuerte",
    payload: {
      levels: ["SECUNDARIA"],
      description: "El Nivel Secundario del Colegio Almafuerte en Bernal ofrece una formación académica orientada a la preparación universitaria y al desarrollo personal de los jóvenes. Con una currícula completa y actividades extracurriculares que enriquecen la experiencia escolar, el colegio acompaña a sus alumnos en una etapa fundamental de su crecimiento. La institución destaca por sus egresados comprometidos y por una cultura escolar que equilibra exigencia académica con bienestar estudiantil."
    }
  },
  {
    id: "cmpq37wio05airn5q3gftqnc3",
    name: "SANTA TERESITA",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Santa Teresita es una institución educativa católica de Bernal que ofrece formación completa desde el nivel inicial hasta la escuela secundaria. Bajo el patronazgo de Santa Teresa de Lisieux, su proyecto educativo se sustenta en la simplicidad, el amor y la entrega que caracterizaron a su patrona. Con una comunidad educativa unida y una profunda vida espiritual, el colegio forma personas íntegras con sólidos valores humanos y cristianos."
    }
  },
];

console.log(`\n✏️  Curando ${updates.length} colegios de Bernal${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

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
