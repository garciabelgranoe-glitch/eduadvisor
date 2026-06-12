/**
 * Curación de colegios de Formosa.
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-formosa.mjs [--dry-run]
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
    id: "cmqb4krcb013276vhcuxvd7el",
    name: "Colegio de la Ribera",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio de la Ribera es una institución educativa de Formosa que toma su nombre del Río Pilcomayo, cuyas riberas definen el paisaje y la identidad de la provincia. Ofrece formación completa desde el nivel inicial hasta la educación secundaria con una propuesta que integra la riqueza cultural, natural y étnica del Gran Chaco en el aprendizaje cotidiano. La institución valora profundamente la diversidad cultural formoseña y prepara a sus alumnos para ser ciudadanos respetuosos y comprometidos con su territorio."
    }
  },
  {
    id: "cmqb4kr8w012576vh7qr4miql",
    name: "Colegio Privado Alas",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Privado Alas de Formosa es una institución educativa que eleva en su nombre la aspiración de brindar a sus alumnos las herramientas para volar alto en la vida. Con una propuesta educativa completa que abarca los tres niveles de escolaridad, Alas combina la exigencia académica con el acompañamiento afectivo en el cálido clima formoseño. Su proyecto institucional fomenta la ambición por el conocimiento, la solidaridad y el compromiso con el desarrollo de la provincia del norte argentino."
    }
  },
  {
    id: "cmqb4kra1012g76vh696h9h11",
    name: "Colegio Privado Dr. Esteban Laureano Maradona",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Privado Dr. Esteban Laureano Maradona de Formosa lleva el nombre del célebre médico misionero que dedicó su vida a atender a los pueblos originarios del Chaco, convirtiéndose en un símbolo del servicio humanitario. Su propuesta educativa para los niveles primario y secundario está permeada por los valores de solidaridad, vocación de servicio y compromiso con los más necesitados que caracterizaron al legendario doctor. En Formosa, este colegio forma ciudadanos con conciencia social y vocación de transformar su comunidad."
    }
  },
  {
    id: "cmqb4krdk013d76vhsajnb6oe",
    name: "Colegio Privado Espacios",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Privado Espacios de Formosa propone, como su nombre lo indica, una educación con amplitud de miras: espacios para aprender, crear, reflexionar y crecer. Con una propuesta completa desde el nivel inicial hasta el secundario, la institución ofrece un ambiente educativo estimulante y diverso adaptado al contexto cultural y climático del norte argentino. Espacios es una opción valorada por las familias formoseñas que buscan una educación integral con sensibilidad por las particularidades del noroeste argentino."
    }
  },
  {
    id: "cmqb4kreo013o76vh729l7ee4",
    name: "E.P.E.T N°1",
    payload: {
      levels: ["SECUNDARIA"],
      description: "La Escuela Provincial de Educación Técnica N°1 de Formosa es la institución técnica más antigua y reconocida de la capital provincial, formando técnicos calificados para los sectores productivos de la provincia. Con orientaciones en construcciones, electrotecnia, química y otras especialidades, prepara a los jóvenes formoseños para el mercado laboral regional y para la continuación de estudios superiores en ingeniería y tecnología. La EPET N°1 es un símbolo del desarrollo educativo y productivo de Formosa desde hace décadas."
    }
  },
  {
    id: "cmqb4krb8012r76vh6xp5y4s6",
    name: "Escuela Evangélica Privada Juan Enrique Dring",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "La Escuela Evangélica Privada Juan Enrique Dring de Formosa lleva el nombre de uno de los misioneros anglicanos que trabajaron en la evangelización del Gran Chaco, reconociendo el aporte de las iglesias evangélicas a la educación formoseña. Con una propuesta educativa completa basada en valores cristianos evangélicos, ofrece formación desde el nivel inicial hasta el secundario con un fuerte compromiso con las comunidades indígenas y criollas de la región. La institución es un referente de la educación religiosa protestante en el norte argentino."
    }
  },
  {
    id: "cmqb4krre016z76vho6u44jwg",
    name: "Escuela Privada Católica María Auxiliadora Paredes",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "La Escuela Privada Católica María Auxiliadora Paredes de Formosa es una institución salesiana que lleva el doble patrocinio de la Virgen María Auxiliadora y del barrio Paredes donde está ubicada, reflejando su arraigo comunitario. Ofrece formación completa desde el nivel inicial hasta el secundario con una propuesta salesiana centrada en la prevención, la alegría y la formación integral de los jóvenes formoseños. La institución es un pilar educativo y social de su barrio, con una comunidad educativa cohesionada y comprometida."
    }
  },
  {
    id: "cmqb4krlk015i76vhd8sansvt",
    name: "Escuela Privada San José Obrero",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "La Escuela Privada San José Obrero de Formosa lleva el nombre de San José en su faceta de trabajador y padre, como modelo de responsabilidad, trabajo honrado y vida familiar. Con una propuesta educativa completa desde el jardín de infantes hasta el secundario, la institución forma a sus alumnos en el valor del trabajo, la familia y la fe como pilares de una vida plena. En el contexto cultural del norte argentino, la escuela es un referente de la educación católica con fuerte inserción en la comunidad formoseña."
    }
  },
  {
    id: "cmqb4krqb016o76vhozwkx3zg",
    name: "Hogar Don Bosco",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Hogar Don Bosco de Formosa es una institución salesiana que combina la misión educativa con la atención social de jóvenes en situación de vulnerabilidad en el norte argentino. Siguiendo el sistema preventivo de Don Bosco, la institución ofrece no solo educación formal sino también contención, formación laboral y acompañamiento integral a jóvenes que necesitan una oportunidad para desarrollar su potencial. El Hogar es un ejemplo del compromiso salesiano con los más vulnerables en una de las provincias con mayor índice de pobreza del país."
    }
  },
  {
    id: "cmqb4krje014w76vh3qackb19",
    name: "Instituto Adventista",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Adventista de Formosa es una institución educativa de la Iglesia Adventista del Séptimo Día que ofrece formación completa desde el nivel inicial hasta el secundario con valores cristianos adventistas. Su propuesta educativa integra el cuidado del cuerpo, la mente y el espíritu como aspectos inseparables de la formación integral, con especial atención a la alimentación saludable y los estilos de vida saludables. La institución es parte de la red educativa adventista que tiene presencia en todo el norte argentino."
    }
  },
  {
    id: "cmqb4krfu013z76vhqz3zp7w0",
    name: "Instituto Privado Gral San Martín",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Privado General San Martín de Formosa es una institución educativa laica que lleva el nombre del Libertador como símbolo de los valores patrios que guían su proyecto educativo. Con educación primaria y secundaria, la institución prepara a sus alumnos para los desafíos académicos y profesionales en el contexto del norte argentino. Su propuesta combina la formación académica rigurosa con el trabajo en ciudadanía, historia nacional y el orgullo por la identidad argentina."
    }
  },
  {
    id: "cmqb4kri4014l76vhy4q3l62l",
    name: "Instituto Privado San Francisco de Asís",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Privado San Francisco de Asís de Formosa es una institución franciscana que ofrece formación completa desde el nivel inicial hasta el secundario en la capital de la provincia. Inspirado en el espíritu de Francisco de Asís, la institución promueve el amor por la naturaleza —especialmente relevante en una provincia con una rica biodiversidad como Formosa— y la solidaridad con los más humildes. Su propuesta educativa combina la tradición franciscana con una currícula actualizada y comprometida con el desarrollo de la provincia."
    }
  },
  {
    id: "cmqb4kruu017w76vhal3wvb6g",
    name: "Instituto San Francisco de Asís Nivel Secundario",
    payload: {
      levels: ["SECUNDARIA"],
      description: "El Instituto San Francisco de Asís Nivel Secundario de Formosa es la continuación de la propuesta educativa franciscana para los jóvenes que completan su formación en el bachillerato. Con una currícula orientada a la preparación universitaria y al desarrollo de competencias para el mercado laboral formoseño, acompaña a los alumnos en la última etapa de su escolarización con el espíritu de alegría, servicio y amor a la naturaleza que caracteriza al carisma franciscano."
    }
  },
  {
    id: "cmqb4krgy014a76vhoz8hsrvm",
    name: "Instituto Santa Isabel",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Santa Isabel de Formosa lleva el nombre de la reina de Portugal y patrona de la paz, que dedicó su vida a reconciliar disputas y servir a los pobres. Con una propuesta educativa completa desde el nivel inicial hasta el secundario, la institución integra los valores de la paz, la justicia y la caridad en una formación académica sólida adaptada al contexto del norte argentino. La institución es un referente de la educación católica en Formosa con un fuerte compromiso con la comunidad local."
    }
  },
  {
    id: "cmqb4krkf015776vhmm6uuthw",
    name: "Instituto S P R Macedo Martinez",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto SPR Macedo Martínez de Formosa es una institución educativa privada que ofrece educación primaria y secundaria en la capital de la provincia. Con una trayectoria consolidada en la comunidad formoseña, la institución desarrolla una propuesta pedagógica que combina la solidez académica con el acompañamiento personalizado de sus alumnos. Su nombre honra a figuras destacadas de la historia local, reflejando el arraigo institucional con la identidad y la cultura de Formosa."
    }
  },
  {
    id: "cmqb4krms015t76vhkyrosgef",
    name: "Instituto Superior Santa Rita",
    payload: {
      levels: ["SUPERIOR"],
      description: "El Instituto Superior Santa Rita de Formosa lleva el nombre de la santa de los casos imposibles, patrona de quienes superan adversidades, como símbolo de perseverancia en la formación profesional. Ofrece carreras de nivel terciario para la formación de docentes y profesionales en diversas áreas, contribuyendo al desarrollo del capital humano de la provincia. Su propuesta de educación superior está orientada a las necesidades del mercado laboral formoseño, con especial atención a la formación docente para los niveles inicial y primario."
    }
  },
  {
    id: "cmqb4krp7016d76vhc65e6522",
    name: "Jardín de Infantes Privado Las Ardillitas",
    payload: {
      levels: ["INICIAL"],
      description: "El Jardín de Infantes Privado Las Ardillitas de Formosa es un espacio educativo especializado en la primera infancia que brinda un ambiente lúdico, seguro y estimulante para los niños más pequeños de la capital formoseña. Con la imagen de las ardillitas como símbolo de curiosidad, energía y aprendizaje, el jardín ofrece una propuesta pedagógica centrada en el juego y la exploración. Su equipo de docentes especializadas en educación inicial garantiza el acompañamiento afectivo y pedagógico que los niños necesitan en sus primeros años de escolaridad."
    }
  },
];

console.log(`\n✏️  Curando ${updates.length} colegios de Formosa${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

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
