/**
 * Curación de colegios de Lomas de Zamora
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-lomas-de-zamora.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY.");
  process.exit(1);
}

const updates = [
  {
    id: "cmpq36vtr0516rn5q42aiodw2",
    name: "Balmoral College",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Lomas de Zamora con impronta británica. Ofrece los niveles inicial, primario y secundario con una propuesta de inmersión en inglés que prepara a los alumnos para un contexto globalizado. Su nombre evoca la tradición escocesa del castillo de Balmoral y su propuesta educativa combina rigor académico anglosajón con los valores de la educación argentina."
    }
  },
  {
    id: "cmpq36vkm04vorn5q1szzq2oy",
    name: "Barker College",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe de Lomas de Zamora con tradición anglófona. Ofrece los niveles inicial, primario y secundario con enseñanza intensiva del inglés y una propuesta pedagógica que integra lo mejor de la tradición educativa británica con el currículo argentino. Valorado por las familias del sur del conurbano por su exigencia académica y el clima institucional ordenado y afectuoso."
    }
  },
  {
    id: "cmpq36vv90523rn5q20yxub66",
    name: "Colegio Bertrand Russell",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico de Lomas de Zamora que lleva el nombre del filósofo y matemático Bertrand Russell. Ofrece los niveles inicial, primario y secundario con una propuesta orientada al pensamiento crítico, la ciencia y la formación ciudadana. Su perfil laico y racional se traduce en una educación que privilegia la razón, la curiosidad intelectual y el respeto por la diversidad de ideas."
    }
  },
  {
    id: "cmpq36vsv050krn5q7ol667dm",
    name: "Colegio Colinas Verdes - Nivel Secundario",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Nivel secundario del Colegio Colinas Verdes de Lomas de Zamora, parte de un complejo educativo que abarca desde el nivel inicial. Ofrece el bachillerato con una propuesta que combina formación académica sólida con actividades extracurriculares y orientación vocacional. La continuidad institucional con los niveles inferiores del mismo complejo facilita el desarrollo integral del alumno a lo largo de toda su escolaridad."
    }
  },
  {
    id: "cmpq36w3x056irn5qbe84kju3",
    name: "Colegio Corazonista Sagrado Corazón",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa de la congregación de los Misioneros del Sagrado Corazón en Lomas de Zamora. Ofrece los niveles inicial, primario y secundario con una espiritualidad centrada en el amor al Sagrado Corazón de Jesús. Su propuesta pedagógica integra la excelencia académica con la formación en valores evangélicos, el servicio comunitario y el desarrollo de la dimensión espiritual de cada alumno."
    }
  },
  {
    id: "cmpq36vre04znrn5q3ot38tzj",
    name: "Colegio Evangélico Príncipe de Paz",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa evangélica de Lomas de Zamora bajo la advocación del Príncipe de Paz. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la fe cristiana evangélica con una sólida formación académica. Su proyecto educativo promueve valores bíblicos como el respeto, la tolerancia y el servicio, formando alumnos comprometidos con su comunidad y con una visión de paz y reconciliación."
    }
  },
  {
    id: "cmpq36vmo04wwrn5qk99leyfy",
    name: "Colegio Inmaculada Concepción",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Lomas de Zamora bajo la advocación de la Inmaculada Concepción de María. Ofrece los niveles inicial, primario y secundario con una propuesta que combina rigor académico y formación en valores marianos. Con décadas de historia en el distrito, es una de las instituciones más reconocidas de Lomas de Zamora por su comunidad activa y su compromiso con la educación integral."
    }
  },
  {
    id: "cmpq36vnn04xirn5qaq30v2td",
    name: "Colegio Modelo Lomas - Instituto Superior",
    payload: {
      levels: ["SUPERIOR"],
      description:
        "Instituto de educación superior del Colegio Modelo Lomas en Lomas de Zamora. Ofrece carreras terciarias que articulan con el proyecto educativo del complejo Modelo, garantizando continuidad formativa para los egresados del nivel secundario. Una opción conveniente para las familias del distrito que priorizan la formación de nivel superior dentro de una institución de confianza con historia en la zona."
    }
  },
  {
    id: "cmpq36vqx04zcrn5qh0dxn8ch",
    name: "Colegio Modelo Lomas - Jardín Maternal",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín maternal del Colegio Modelo Lomas, parte del complejo educativo más importante de Lomas de Zamora. Atiende niños desde los primeros meses hasta los 3 años con una propuesta de estimulación temprana que prioriza el vínculo afectivo, el juego y el desarrollo integral. El ingreso al jardín maternal del Modelo garantiza la continuidad educativa dentro del mismo complejo hasta el nivel superior."
    }
  },
  {
    id: "cmpq36vk404vdrn5qqmnzmo0n",
    name: "Colegio Modelo Lomas - Nivel Inicial",
    payload: {
      levels: ["INICIAL"],
      description:
        "Nivel inicial del Colegio Modelo Lomas en Lomas de Zamora. Ofrece jardín de infantes para niños de 3 a 5 años dentro del proyecto educativo integral del complejo Modelo. Su propuesta pedagógica estimula el desarrollo cognitivo, emocional y social desde los primeros años, preparando a los niños para una transición exitosa al nivel primario dentro de la misma institución."
    }
  },
  {
    id: "cmpq36vln04warn5qgrd26be2",
    name: "Colegio Modelo Lomas - Nivel Primario",
    payload: {
      levels: ["PRIMARIA"],
      description:
        "Nivel primario del Colegio Modelo Lomas, referente educativo de Lomas de Zamora. Ofrece educación primaria dentro del complejo Modelo con una propuesta sólida que combina formación académica, valores y actividades extracurriculares. La continuidad con los demás niveles del complejo —desde maternal hasta superior— es uno de los aspectos más valorados por las familias que eligen este recorrido educativo completo."
    }
  },
  {
    id: "cmpq36w0i054orn5q3waic8j5",
    name: "Colegio Modelo Lomas - Nivel Secundario",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Nivel secundario del Colegio Modelo Lomas, la institución educativa privada más reconocida de Lomas de Zamora. Ofrece el bachillerato con una propuesta académica exigente que prepara a los egresados para el ingreso a la universidad. Con décadas de historia en el distrito, el Modelo Lomas es sinónimo de calidad educativa en el sur del conurbano bonaerense."
    }
  },
  {
    id: "cmpq36vo404xtrn5q9yflmp46",
    name: "Colegio Modelo Parque Barón",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Sede del Colegio Modelo ubicada en el barrio Parque Barón de Lomas de Zamora. Parte del reconocido complejo educativo Modelo, ofrece los niveles inicial, primario y secundario con la misma propuesta de calidad que caracteriza a la institución. Su ubicación en Parque Barón lo convierte en la opción natural para familias de esa zona que buscan la trayectoria completa dentro del proyecto Modelo."
    }
  },
  {
    id: "cmpq36vm704wlrn5qrc5nvlht",
    name: "Colegio Sagrado Corazón",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Lomas de Zamora consagrada al Sagrado Corazón de Jesús. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la tradición católica con una educación académica actualizada. Su comunidad de familias y egresados valora el clima institucional cálido, el acompañamiento espiritual y la formación en valores que distingue a esta institución en el partido."
    }
  },
  {
    id: "cmpq36vl304vzrn5qko29cria",
    name: "Colegio San Albano - St. Alban's College",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe de tradición anglicana en Lomas de Zamora, fundado bajo el patronazgo de San Albano, primer mártir de Gran Bretaña. Ofrece los niveles inicial, primario y secundario con una propuesta que combina el rigor académico británico con valores humanistas y una sólida enseñanza del inglés. Reconocido en el sur del conurbano por su excelencia académica y su ambiente formativo ordenado."
    }
  },
  {
    id: "cmpq36vzy054drn5qxdz1r9nh",
    name: "Colegio San Andrés",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Lomas de Zamora con los niveles inicial, primario y secundario. Su propuesta pedagógica combina formación académica sólida con el desarrollo de valores humanos y habilidades para la vida. Reconocido por las familias del partido por el trato personalizado y el compromiso del equipo docente con el crecimiento integral de cada alumno a lo largo de su trayectoria escolar."
    }
  },
  {
    id: "cmpq36vpf04yfrn5qouartzxx",
    name: "Colegio San Francisco Javier de Lomas de Zamora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución jesuita de Lomas de Zamora bajo el patronazgo de San Francisco Javier, uno de los fundadores de la Compañía de Jesús. Ofrece los niveles inicial, primario y secundario con la pedagogía ignaciana que combina excelencia académica, desarrollo de la conciencia social y búsqueda espiritual. La tradición jesuita de más de cuatro siglos se traduce en un proyecto educativo que forma personas íntegras y comprometidas."
    }
  },
  {
    id: "cmpq36vzh0542rn5qz41ponx7",
    name: "Colegio Tiempos Modernos",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico de Lomas de Zamora con una propuesta pedagógica contemporánea. Ofrece los niveles inicial, primario y secundario con metodologías activas, tecnología educativa y un enfoque orientado a las competencias del siglo XXI. Su nombre refleja una visión educativa actualizada que prepara a los alumnos para los desafíos del mundo contemporáneo con herramientas prácticas y pensamiento crítico."
    }
  },
  {
    id: "cmpq36w4u0574rn5q7rc64cqs",
    name: "Colegio Westminster - Nivel Secundario",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Nivel secundario del Colegio Westminster de Lomas de Zamora, institución con tradición británica en el distrito. Ofrece el bachillerato con una propuesta que combina la exigencia académica anglosajona con una sólida enseñanza del inglés. Su nombre evoca el icónico palacio londinense y su proyecto educativo apunta a formar egresados con perfil internacional y capacidad para acceder a las mejores universidades."
    }
  },
  {
    id: "cmpq36vrv04zyrn5q2956ryha",
    name: "Colinas Verdes Nivel Inicial",
    payload: {
      levels: ["INICIAL"],
      description:
        "Nivel inicial del Colegio Colinas Verdes en Lomas de Zamora. Ofrece jardín de infantes para niños de 3 a 5 años dentro del proyecto educativo del complejo Colinas Verdes, que abarca hasta el nivel secundario. Un ambiente cálido y estimulante que facilita la transición al nivel primario dentro de la misma institución, garantizando continuidad pedagógica y vínculos afectivos estables."
    }
  },
  {
    id: "cmpq36w0z054zrn5qw8smvc4b",
    name: "El Mariano Moreno - Lomas de Zamora",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Instituto de educación secundaria a distancia de Lomas de Zamora que permite terminar el bachillerato con flexibilidad horaria. Una opción para adultos y jóvenes que no pudieron completar sus estudios secundarios en el sistema presencial. Su propuesta combina la educación a distancia con instancias presenciales de seguimiento, adaptando el ritmo de aprendizaje a las necesidades de cada alumno."
    }
  },
  {
    id: "cmpq36vvq052ern5qh1gi26yb",
    name: "Escuela Hogar Amor Maternal / Instituto San José",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description:
        "Institución educativa con vocación social en Lomas de Zamora que combina la función de escuela hogar con la propuesta del Instituto San José. Atiende niños en situación de vulnerabilidad ofreciendo no solo educación formal sino también contención, alimentación y acompañamiento integral. Su trabajo con las familias más necesitadas del partido la convierte en una institución de profundo arraigo comunitario."
    }
  },
  {
    id: "cmpq36w1k055arn5q363e7rge",
    name: "Instituto A. Mentruyt",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Lomas de Zamora con los niveles inicial, primario y secundario. Con una trayectoria consolidada en el distrito, el Instituto Mentruyt ofrece una propuesta educativa integral que combina formación académica sólida con el desarrollo de valores y habilidades sociales. Reconocido por su comunidad activa y por el compromiso de sus docentes con el aprendizaje significativo de cada alumno."
    }
  },
  {
    id: "cmpq36vn704x7rn5q9no0hj52",
    name: "Instituto Corazón Inmaculado de María",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa católica de Lomas de Zamora consagrada al Corazón Inmaculado de María. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción mariana con una formación académica actualizada. Su espiritualidad se traduce en un ambiente educativo cálido, familiar y comprometido con el desarrollo integral de cada alumno en la fe y en el conocimiento."
    }
  },
  {
    id: "cmpq36vpv04yqrn5qe0fa3gs8",
    name: "Instituto José Hernández",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Lomas de Zamora que lleva el nombre del autor del Martín Fierro, símbolo de la identidad nacional argentina. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica los valores de la cultura y la identidad argentina. Su proyecto educativo combina la tradición humanista con las demandas pedagógicas contemporáneas, formando alumnos con raíces culturales sólidas."
    }
  },
  {
    id: "cmpq36w370567rn5qjoke8ajz",
    name: "Instituto Lomas de Zamora Cooperativa Limitada de Enseñanza",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto educativo organizado bajo el modelo de cooperativa de enseñanza en Temperley, partido de Lomas de Zamora. Ofrece los niveles inicial, primario y secundario con un modelo de gestión participativa donde la comunidad educativa tiene voz activa en las decisiones institucionales. La solidaridad, la democracia y el trabajo colectivo son los valores que distinguen a esta propuesta educativa única en la zona."
    }
  },
  {
    id: "cmpq36w2o055wrn5q1blqxwww",
    name: "Instituto Manuel Quintana",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Lomas de Zamora que lleva el nombre del ex presidente argentino Manuel Quintana. Ofrece los niveles inicial, primario y secundario con una propuesta educativa que combina tradición y modernidad. Su nombre rinde homenaje a un referente de la historia política argentina y su proyecto institucional busca formar ciudadanos comprometidos con los valores democráticos y la cultura del esfuerzo."
    }
  },
  {
    id: "cmpq36von04y4rn5qyjivscsg",
    name: "Instituto Nuestra Señora del Carmen",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Lomas de Zamora bajo la advocación de Nuestra Señora del Carmen, patrona de los navegantes. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la espiritualidad carmelita con una formación académica sólida. Su comunidad educativa valora el clima de fe, el acompañamiento personal y la tradición institucional que caracteriza a esta escuela en el partido."
    }
  },
  {
    id: "cmpq36vtb050vrn5q67245zxr",
    name: "Instituto Nuevo Día",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Lomas de Zamora con los niveles inicial, primario y secundario. Su nombre evoca el comienzo y la renovación permanente, valores que se traducen en una propuesta pedagógica orientada al crecimiento personal, la superación y el aprendizaje continuo. Valorado por las familias de la zona por su ambiente inclusivo y el compromiso del equipo docente con el desarrollo integral de cada alumno."
    }
  },
  {
    id: "cmpq36vse0509rn5qc8hm8ogj",
    name: "Instituto Pbro. Dr. A. M. Sáenz",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado católico de Lomas de Zamora que lleva el nombre del Pbro. Dr. Antonio Sáenz, primer rector de la Universidad de Buenos Aires. Ofrece los niveles inicial, primario y secundario rindiendo homenaje a uno de los educadores más importantes de la historia argentina. Su propuesta combina la tradición católica con una formación académica de calidad orientada a la excelencia y al servicio."
    }
  },
  {
    id: "cmpq36vqb04z1rn5q8636wg92",
    name: "Instituto Provincia de San Juan",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Lomas de Zamora con los tres niveles educativos. Su nombre rinde homenaje a la provincia argentina de San Juan, cuna de Domingo Faustino Sarmiento. Con una propuesta pedagógica que valora la educación como herramienta de progreso social, el instituto ofrece una formación integral que prepara a sus alumnos para los desafíos académicos y laborales del mundo contemporáneo."
    }
  },
  {
    id: "cmpq36vxb0537rn5qmoj01z57",
    name: "Instituto Técnico Dr. Emilio Lamarca",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Instituto de educación secundaria técnica de Lomas de Zamora que lleva el nombre del jurista y político argentino Emilio Lamarca. Ofrece la modalidad técnica con formación especializada que habilita a los egresados tanto para el ingreso a la universidad como para el mercado laboral. Su perfil técnico responde a las necesidades productivas del distrito y del sur del conurbano bonaerense."
    }
  },
  {
    id: "cmpq36w24055lrn5qbpopg4li",
    name: "Jardín de Infantes Nuestra Señora del Carmen",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes privado católico de Lomas de Zamora bajo la advocación de Nuestra Señora del Carmen. Atiende niños de 2 a 5 años con una propuesta de nivel inicial que combina estimulación temprana, juego y formación en valores marianos. Su ambiente cálido y familiar, conducido por docentes comprometidas con la primera infancia, lo convierte en una opción querida por las familias del partido."
    }
  },
  {
    id: "cmpq36vyz053rrn5q1hgdnb46",
    name: "Lomas High School",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución bilingüe privada de Lomas de Zamora con fuerte impronta anglosajona. Ofrece los niveles inicial, primario y secundario con enseñanza intensiva del inglés y una propuesta pedagógica que integra metodologías internacionales con el currículo argentino. Una de las referencias educativas más reconocidas del partido para familias que priorizan el bilingüismo y la preparación para un entorno globalizado."
    }
  },
  {
    id: "cmpq36w4e056trn5q3a56hczq",
    name: "Modern School",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Lomas de Zamora con enfoque moderno e internacional. Ofrece los niveles inicial, primario y secundario con un modelo educativo que incorpora tecnología, inglés intensivo y metodologías activas. Su nombre refleja una propuesta orientada a la innovación pedagógica y a la preparación de alumnos capaces de desenvolverse con competencia en el mundo contemporáneo."
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

console.log(`\n🏫  Curando ${updates.length} colegios de Lomas de Zamora...\n`);

for (const { id, name, payload } of updates) {
  await patchSchool(id, name, payload);
}

console.log("\n✨  Listo.\n");
