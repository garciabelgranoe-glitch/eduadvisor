/**
 * Curación de colegios de Wilde.
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-wilde.mjs [--dry-run]
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
    id: "cmqb4gxwf007876vh5zgd2feo",
    name: "Colegio Mariano Moreno",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Mariano Moreno de Wilde es una institución educativa privada que honra la memoria del prócer e impulsor de la educación pública argentina. Ofrece formación primaria y secundaria con un enfoque en el pensamiento crítico, la formación ciudadana y la excelencia académica. Su propuesta educativa combina tradición y modernidad, preparando a los alumnos para los desafíos universitarios y profesionales con una sólida base de valores democráticos."
    }
  },
  {
    id: "cmqb4gxr8006076vh0hdnmil7",
    name: "Colegio Modelo John F. Kennedy",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Modelo John F. Kennedy de Wilde es una institución educativa que lleva el nombre del emblemático presidente norteamericano como símbolo de liderazgo y compromiso con el bien común. Ofrece los tres niveles educativos con una propuesta académica actualizada y una fuerte orientación hacia el inglés y las competencias del siglo XXI. Su clima institucional ordenado y su equipo docente comprometido lo posicionan como una de las opciones más reconocidas de la localidad."
    }
  },
  {
    id: "cmqb4gy2h008r76vh83s35g9g",
    name: "Colegio Modelo Pablo Picasso",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "El Colegio Modelo Pablo Picasso de Wilde es una institución que lleva el nombre del genial artista español como bandera de creatividad e innovación en la educación. Con niveles inicial y primario, su propuesta pedagógica integra las artes, la expresión y la imaginación como herramientas centrales del aprendizaje. Un espacio donde los niños descubren el mundo a través de múltiples lenguajes y desarrollan su potencial en un ambiente estimulante y contenedor."
    }
  },
  {
    id: "cmqb4gxtu006m76vhvfquq9lj",
    name: "Colegio Modelo Sara Eccleston",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Modelo Sara Eccleston de Wilde rinde homenaje a la pionera de la educación normalista argentina, reflejando en su propuesta un compromiso con la enseñanza de calidad. Ofrece formación completa desde el nivel inicial hasta el secundario con metodologías actualizadas y un fuerte trabajo en la formación docente interna. La institución es reconocida en Wilde por su seriedad institucional, su participación comunitaria y los logros académicos de sus egresados."
    }
  },
  {
    id: "cmqb4gya800aj76vhbb29this",
    name: "Colegio Primario San Diego",
    payload: {
      levels: ["PRIMARIA"],
      description: "El Colegio Primario San Diego es una institución de gestión privada ubicada en Wilde que ofrece educación primaria con una orientación en valores y una sólida formación académica. Su propuesta pedagógica pone énfasis en el acompañamiento individual de cada alumno, favoreciendo un clima de aprendizaje positivo y estimulante. La institución integra actividades físicas, artísticas y tecnológicas complementando la currícula para lograr una formación más completa."
    }
  },
  {
    id: "cmqb4gy3t009276vhavvf198f",
    name: "Colegio San Ignacio",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio San Ignacio de Wilde es una institución de inspiración ignaciana que ofrece formación integral desde el nivel inicial hasta la educación secundaria. Siguiendo el carisma de la Compañía de Jesús, su propuesta educativa busca formar hombres y mujeres íntegros, cultos, humanos y para los demás. Con una fuerte vida espiritual y comunitaria, el colegio prepara a sus alumnos para asumir roles de liderazgo responsable en la sociedad."
    }
  },
  {
    id: "cmqb4gy9000a876vhl1vef8i9",
    name: "Colegio San Miguel Arcangel",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio San Miguel Arcángel de Wilde es una institución católica que ofrece educación completa desde el jardín de infantes hasta la escuela secundaria. Bajo el patronazgo del arcángel guerrero, su proyecto educativo promueve la fortaleza espiritual, la defensa de los valores y la formación académica rigurosa. La institución cuenta con una comunidad educativa cohesionada y una propuesta extracurricular que enriquece la experiencia escolar de sus alumnos."
    }
  },
  {
    id: "cmqb4gy14008g76vhy0tyrhij",
    name: "Colegio Secundario San Diego",
    payload: {
      levels: ["SECUNDARIA"],
      description: "El Colegio Secundario San Diego de Wilde ofrece educación media con una propuesta académica orientada a la preparación universitaria y al desarrollo de competencias profesionales. Su bachillerato combina una currícula completa con actividades de orientación vocacional que acompañan a los jóvenes en la definición de su futuro. La institución se destaca por el compromiso de sus docentes y por el alto porcentaje de egresados que continúan estudios superiores."
    }
  },
  {
    id: "cmqb4gyes00bn76vh18v1bbyt",
    name: "Escuela de Educación Secundaria Técnica (EEST) Nº3",
    payload: {
      levels: ["SECUNDARIA"],
      description: "La Escuela de Educación Secundaria Técnica N°3 de Wilde ofrece formación técnica y profesional de nivel medio con orientaciones que preparan a los egresados para el mundo del trabajo y los estudios superiores tecnológicos. Su infraestructura de talleres y laboratorios permite a los alumnos adquirir habilidades prácticas en disciplinas técnicas con alto valor en el mercado laboral. La institución combina la formación académica general con especialidades técnicas que responden a las necesidades productivas de la región."
    }
  },
  {
    id: "cmqb4gybg00au76vhdpf6nuqg",
    name: "Escuela Especial Mi Camino",
    payload: {
      levels: ["INICIAL"],
      description: "La Escuela Especial Mi Camino de Wilde es una institución dedicada a la educación y formación de personas con necesidades educativas especiales, brindando atención personalizada y acompañamiento interdisciplinario. Su equipo de profesionales especializados —docentes, psicólogos, fonoaudiólogos y terapistas— trabaja coordinadamente para potenciar las capacidades de cada alumno. Con un enfoque inclusivo y humanista, la escuela garantiza el derecho a una educación de calidad para todos, respetando los tiempos y singularidades de cada persona."
    }
  },
  {
    id: "cmqb4gxxl007j76vh0da3so8f",
    name: "Instituto Integral Wilde De Enseñanza Y Nivelación",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Integral Wilde de Enseñanza y Nivelación es una institución educativa privada que ofrece formación primaria y secundaria con especial atención a la nivelación y el fortalecimiento de los aprendizajes. Su propuesta está orientada a acompañar a los alumnos que requieren un seguimiento más cercano, con grupos reducidos y atención personalizada. La institución es reconocida en Wilde por su vocación integradora y su capacidad para potenciar el desarrollo académico de cada estudiante."
    }
  },
  {
    id: "cmqb4gxzy008576vhm58cldf9",
    name: "Instituto Mariano Moreno",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Mariano Moreno de Wilde es una institución educativa laica que lleva el nombre del prócer patrio como símbolo de compromiso con la educación y la justicia. Con una trayectoria consolidada en la comunidad de Wilde, ofrece educación primaria y secundaria con una propuesta que equilibra exigencia académica y formación en valores ciudadanos. Su cuerpo docente estable y su proyecto educativo coherente lo convierten en una referencia para las familias de la zona."
    }
  },
  {
    id: "cmqb4gxv3006x76vh8dt2pa4j",
    name: "Instituto Salvador Soreda",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Salvador Soreda es una institución educativa privada de Wilde con una larga historia de formación académica en el partido de Avellaneda. Su propuesta pedagógica abarca los niveles primario y secundario con un enfoque en la formación integral y la preparación para los estudios superiores. La institución es valorada por las familias locales por su clima ordenado, su equipo docente comprometido y la sólida formación que brindan a sus egresados."
    }
  },
  {
    id: "cmqb4gxso006b76vh42bwlval",
    name: "Instituto San Pablo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto San Pablo de Wilde es una institución educativa cristiana que ofrece formación completa desde el nivel inicial hasta la escuela secundaria. Inspirado en la figura del apóstol Pablo, su proyecto educativo promueve el aprendizaje como camino de transformación personal y social, con fuerte énfasis en la formación en valores y la fe. La institución cuenta con una comunidad activa de familias y docentes comprometidos con el crecimiento integral de cada alumno."
    }
  },
  {
    id: "cmq15vv0j00g5qi31cm4i45ai",
    name: "Instituto Victoria Ocampo",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Victoria Ocampo de Wilde lleva el nombre de la gran intelectual y escritora argentina como homenaje al pensamiento libre y la cultura. Su propuesta educativa integra la literatura, las artes y las humanidades en una formación académica rigurosa que prepara a los alumnos para los estudios superiores y el ejercicio pleno de la ciudadanía. La institución promueve el pensamiento crítico, la lectura y la participación activa como pilares de una educación de calidad."
    }
  },
  {
    id: "cmqb4gy7t009x76vhgald7hkp",
    name: "Jardín Infantes Sara Eccleston",
    payload: {
      levels: ["INICIAL"],
      description: "El Jardín de Infantes Sara Eccleston de Wilde es el nivel inicial del colegio homónimo, ofreciendo una propuesta pedagógica lúdica y estimulante para los primeros años de escolaridad. Con docentes especializadas en educación inicial y espacios diseñados para el juego y el aprendizaje, brinda un ambiente seguro y afectuoso donde los niños dan sus primeros pasos educativos. Su articulación con los niveles superiores del colegio garantiza una transición natural y acompañada."
    }
  },
  {
    id: "cmq15vv5h00hmqi316nh7krrm",
    name: "Loreto Educational Center",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Loreto Educational Center es una institución bilingüe de Wilde que ofrece formación completa desde el nivel inicial hasta la escuela secundaria con énfasis en el idioma inglés. Su propuesta académica integra la metodología de las instituciones Loreto, reconocidas internacionalmente por su excelencia educativa y su enfoque humanista. Con un ambiente multicultural y docentes nativos y bilingües, prepara a sus alumnos para desenvolverse con fluidez en el mundo globalizado."
    }
  },
];

console.log(`\n✏️  Curando ${updates.length} colegios de Wilde${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

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
