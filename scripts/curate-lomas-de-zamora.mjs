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
        "Colegio bilingüe privado de Lomas de Zamora con los niveles inicial, primario y secundario. Balmoral College ofrece una propuesta de inmersión en inglés con estándares internacionales, formando alumnos con fluidez lingüística y competencias para desenvolverse en entornos globales. Una opción consolidada en el sur del Gran Buenos Aires para familias que valoran la educación bilingüe de calidad."
    }
  },
  {
    id: "cmpq36vkm04vorn5q1szzq2oy",
    name: "Barker College",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Lomas de Zamora con los niveles inicial, primario y secundario. Barker College propone una educación en inglés con sólida formación académica y valores humanistas, preparando a sus alumnos para los desafíos de un mundo interconectado. Con reconocimiento en el sur del GBA, es una institución de referencia para las familias que priorizan el bilingüismo y la excelencia."
    }
  },
  {
    id: "cmpq36vv90523rn5q20yxub66",
    name: "Colegio Bertrand Russell",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Lomas de Zamora que lleva el nombre del filósofo y matemático británico Bertrand Russell, Nobel de Literatura y símbolo del pensamiento crítico y el pacifismo. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia el razonamiento lógico, la filosofía y la ciencia como herramientas de comprensión del mundo. Una institución con identidad intelectual marcada en el sur del GBA."
    }
  },
  {
    id: "cmpq36vsv050krn5q7ol667dm",
    name: "Colegio Colinas Verdes - Nivel Secundario",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Institución de educación secundaria privada de Lomas de Zamora. El Colegio Colinas Verdes ofrece el bachillerato con una propuesta orientada al ingreso universitario y la formación integral del adolescente. Su nombre evoca el entorno verde del sur bonaerense, y su propuesta combina rigor académico con el desarrollo de las habilidades sociales y emocionales de los jóvenes."
    }
  },
  {
    id: "cmpq36w3x056irn5qbe84kju3",
    name: "Colegio Corazonista Sagrado Corazón",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Lomas de Zamora dirigida por los Corazonistas, congregación religiosa española con fuerte presencia en la Argentina. Ofrece los niveles inicial, primario y secundario con la espiritualidad del Sagrado Corazón de Jesús como eje formativo. Con décadas de tradición en el sur del GBA, es una institución reconocida por su clima espiritual, su excelencia académica y su comunidad educativa comprometida."
    }
  },
  {
    id: "cmpq36vre04znrn5q3ot38tzj",
    name: "Colegio Evangélico Príncipe de Paz",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa evangélica de Lomas de Zamora bajo el nombre de Príncipe de Paz, título bíblico de Jesucristo. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la fe evangélica, el estudio de las Escrituras y los valores del evangelio con una formación académica actualizada. Una alternativa educativa cristiana consolidada en el sur del Gran Buenos Aires."
    }
  },
  {
    id: "cmpq36vmo04wwrn5qk99leyfy",
    name: "Colegio Inmaculada Concepción",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Lomas de Zamora bajo la advocación de la Inmaculada Concepción de la Virgen María. Ofrece los niveles inicial, primario y secundario con una propuesta que combina la devoción mariana con una sólida formación académica y en valores. Con historia en el sur del GBA, es una referencia de la educación católica en Lomas de Zamora y sus alrededores."
    }
  },
  {
    id: "cmpq36vnn04xirn5qaq30v2td",
    name: "Colegio Modelo Lomas - Instituto Superior",
    payload: {
      levels: ["SUPERIOR"],
      description:
        "Instituto de educación superior privado de Lomas de Zamora perteneciente a la red del Colegio Modelo Lomas. Ofrece carreras terciarias con orientación pedagógica y profesional, formando docentes y técnicos para el mercado laboral del sur del GBA. Su pertenencia a la red Modelo Lomas garantiza continuidad de calidad educativa desde el nivel inicial hasta el superior en la misma institución."
    }
  },
  {
    id: "cmpq36vqx04zcrn5qh0dxn8ch",
    name: "Colegio Modelo Lomas - Jardín Maternal",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín maternal privado de Lomas de Zamora perteneciente a la red del Colegio Modelo Lomas. Atiende niños desde los primeros meses hasta los 2 años con una propuesta de estimulación temprana, vínculo afectivo seguro y desarrollo integral. Su pertenencia a la red Modelo Lomas ofrece a las familias la tranquilidad de una trayectoria educativa continua y coherente desde la primera infancia."
    }
  },
  {
    id: "cmpq36vk404vdrn5qqmnzmo0n",
    name: "Colegio Modelo Lomas - Nivel Inicial",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes privado de Lomas de Zamora perteneciente a la red del Colegio Modelo Lomas. Atiende niños de 2 a 5 años con una propuesta de nivel inicial que combina el juego, la exploración y el desarrollo de la autonomía como ejes del aprendizaje en la primera infancia. Forma parte de un sistema educativo integrado que acompaña a los alumnos hasta el nivel superior."
    }
  },
  {
    id: "cmpq36vln04warn5qgrd26be2",
    name: "Colegio Modelo Lomas - Nivel Primario",
    payload: {
      levels: ["PRIMARIA"],
      description:
        "Institución de educación primaria privada de Lomas de Zamora perteneciente a la red del Colegio Modelo Lomas. Ofrece la educación primaria completa con un currículo actualizado y articulado con los demás niveles de la red. Su propuesta privilegia el aprendizaje significativo, la formación en valores y la preparación sólida para la continuidad educativa en el nivel secundario."
    }
  },
  {
    id: "cmpq36w0i054orn5q3waic8j5",
    name: "Colegio Modelo Lomas - Nivel Secundario",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Institución de educación secundaria privada de Lomas de Zamora perteneciente a la red del Colegio Modelo Lomas. Ofrece el bachillerato con una propuesta orientada al ingreso universitario y la formación integral del joven. La articulación con el instituto superior de la red ofrece a los egresados una transición natural hacia la educación terciaria dentro del mismo sistema institucional."
    }
  },
  {
    id: "cmpq36vo404xtrn5q9yflmp46",
    name: "Colegio Modelo Parque Barón",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Lomas de Zamora con los niveles inicial, primario y secundario, ubicada en el barrio Parque Barón. Pertenece a la red del Colegio Modelo Lomas y ofrece la misma propuesta pedagógica de calidad en un entorno residencial del sur del GBA. Una opción de proximidad para las familias del barrio que buscan excelencia educativa cerca de su hogar."
    }
  },
  {
    id: "cmpq36vm704wlrn5qrc5nvlht",
    name: "Colegio Sagrado Corazón",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Lomas de Zamora bajo la advocación del Sagrado Corazón de Jesús. Ofrece los niveles inicial, primario y secundario con una espiritualidad centrada en el amor de Cristo como motor de la vida escolar. Con larga presencia en la comunidad, es una referencia de la educación católica en el sur del Gran Buenos Aires, valorada por su clima espiritual y su compromiso con la formación integral."
    }
  },
  {
    id: "cmpq36vl304vzrn5qko29cria",
    name: "Colegio San Albano - St. Alban's College",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Lomas de Zamora con los niveles inicial, primario y secundario. San Albano - St. Alban's College ofrece una propuesta de educación en inglés con estándares internacionales, preparando alumnos para certificaciones reconocidas globalmente. Una de las instituciones bilingües más consolidadas del sur del GBA, con tradición y comunidad educativa comprometida con la excelencia."
    }
  },
  {
    id: "cmpq36vzy054drn5qxdz1r9nh",
    name: "Colegio San Andrés",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Lomas de Zamora con los niveles inicial, primario y secundario. El Colegio San Andrés ofrece una propuesta educativa integral en un clima institucional cálido y cercano. Con el apóstol Andrés como patrono, símbolo de la llamada a seguir sin vacilar, la institución forma alumnos con convicción, compromiso y capacidad para asumir desafíos en su vida personal y académica."
    }
  },
  {
    id: "cmpq36vpf04yfrn5qouartzxx",
    name: "Colegio San Francisco Javier de Lomas de Zamora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada jesuita de Lomas de Zamora bajo el patronazgo de San Francisco Javier, el gran misionero de la Compañía de Jesús. Ofrece los niveles inicial, primario y secundario con la pedagogía ignaciana que forma personas para los demás, con excelencia académica, libertad de pensamiento y compromiso con la justicia social. Una referencia de la educación jesuita en el sur del Gran Buenos Aires."
    }
  },
  {
    id: "cmpq36vzh0542rn5qz41ponx7",
    name: "Colegio Tiempos Modernos",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Lomas de Zamora con los niveles inicial, primario y secundario. Su nombre, Tiempos Modernos, refleja una propuesta pedagógica actualizada y orientada a las demandas del mundo contemporáneo. Con énfasis en la tecnología, la creatividad y el pensamiento crítico, el colegio prepara a sus alumnos para los desafíos de una sociedad en permanente transformación."
    }
  },
  {
    id: "cmpq36w4u0574rn5q7rc64cqs",
    name: "Colegio Westminster - Nivel Secundario",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Institución de educación secundaria bilingüe privada de Lomas de Zamora. Westminster, nombre que evoca la tradición educativa británica, ofrece el bachillerato con fuerte componente en inglés y estándares internacionales. Prepara a sus egresados para el ingreso a universidades nacionales y extranjeras con una formación académica rigurosa y competencias comunicativas en inglés de alto nivel."
    }
  },
  {
    id: "cmpq36vrv04zyrn5q2956ryha",
    name: "Colinas Verdes - Nivel Inicial",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes privado de Lomas de Zamora perteneciente a la institución Colinas Verdes. Atiende niños de 2 a 5 años con una propuesta de nivel inicial centrada en el juego, la naturaleza y el desarrollo integral en la primera infancia. Su nombre evoca el entorno verde del sur bonaerense, y su propuesta conecta a los más pequeños con el medio natural como primer espacio de aprendizaje."
    }
  },
  {
    id: "cmpq36w0z054zrn5qw8smvc4b",
    name: "El Mariano Moreno - Lomas de Zamora",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Institución de educación secundaria a distancia de Lomas de Zamora bajo el nombre del prócer Mariano Moreno. Ofrece el bachillerato en modalidad flexible para adultos y jóvenes que por razones laborales o personales no pudieron completar sus estudios secundarios en tiempo y forma. Una propuesta inclusiva que democratiza el acceso al título secundario en el sur del Gran Buenos Aires."
    }
  },
  {
    id: "cmpq36vvq052ern5qh1gi26yb",
    name: "Escuela Hogar Amor Maternal / Instituto San José",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description:
        "Institución educativa privada de Lomas de Zamora con los niveles inicial y primario. La Escuela Hogar Amor Maternal / Instituto San José combina la función educativa con el acompañamiento social, ofreciendo un espacio de contención y formación para los niños de la comunidad. Su vocación de servicio y su carisma de amor maternal y josefino se traducen en una propuesta educativa comprometida con los más vulnerables."
    }
  },
  {
    id: "cmpq36w1k055arn5q363e7rge",
    name: "Instituto A. Mentruyt",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Lomas de Zamora con los niveles inicial, primario y secundario. El Instituto A. Mentruyt lleva el nombre de su fundador y ofrece una propuesta educativa con historia y arraigo en la comunidad del sur del GBA. Con décadas de trayectoria, es una institución reconocida por las familias de la zona por su compromiso con la calidad educativa y el acompañamiento personalizado."
    }
  },
  {
    id: "cmpq36vn704x7rn5q9no0hj52",
    name: "Instituto Corazón Inmaculado de María",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Lomas de Zamora bajo la advocación del Corazón Inmaculado de María. Ofrece los niveles inicial, primario y secundario con una espiritualidad mariana centrada en la pureza, la entrega y el amor de la Virgen como modelo de vida. Su propuesta integra la devoción al Corazón Inmaculado con una formación académica actualizada y valores del humanismo cristiano."
    }
  },
  {
    id: "cmpq36vpv04yqrn5qe0fa3gs8",
    name: "Instituto José Hernández",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Lomas de Zamora que lleva el nombre de José Hernández, autor del Martín Fierro, poema épico nacional y obra cumbre de la literatura gauchesca argentina. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica la identidad cultural argentina, la literatura y los valores del trabajo y la libertad que inspiran la obra de Hernández."
    }
  },
  {
    id: "cmpq36w2o055wrn5q1blqxwww",
    name: "Instituto Manuel Quintana",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Lomas de Zamora que lleva el nombre del presidente argentino Manuel Quintana, nacido en Buenos Aires y mandatario entre 1904 y 1906. Ofrece los niveles inicial, primario y secundario con una propuesta que combina la educación cívica y la historia argentina con una formación académica integral. Una institución con identidad histórica en el corazón del sur bonaerense."
    }
  },
  {
    id: "cmpq36von04y4rn5qyjivscsg",
    name: "Instituto Nuestra Señora del Carmen",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Lomas de Zamora bajo la advocación de Nuestra Señora del Carmen, patrona de la Marina Argentina. Ofrece los niveles inicial, primario y secundario con una propuesta que combina la devoción carmelitana con una formación académica de calidad. Su comunidad educativa valora el clima espiritual, el acompañamiento familiar y los valores del humanismo cristiano."
    }
  },
  {
    id: "cmpq36vtb050vrn5q67245zxr",
    name: "Instituto Nuevo Día",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Lomas de Zamora con los niveles inicial, primario y secundario. Su nombre, Nuevo Día, refleja una propuesta educativa orientada a la renovación, la esperanza y el crecimiento permanente. Una institución que invita a cada alumno a comenzar cada jornada con energía y motivación, formando personas con optimismo, resiliencia y compromiso con su propio desarrollo."
    }
  },
  {
    id: "cmpq36vse0509rn5qc8hm8ogj",
    name: "Instituto Pbro. Dr. A. M. Sáenz",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Lomas de Zamora que lleva el nombre del Presbítero Doctor Antonio Martín Sáenz, sacerdote y jurista rioplatense del siglo XIX vinculado a la gesta independentista. Ofrece los niveles inicial, primario y secundario con una propuesta que honra la figura de su patrono a través de una educación comprometida con la fe, el saber y el servicio a la patria."
    }
  },
  {
    id: "cmpq36vqb04z1rn5q8636wg92",
    name: "Instituto Provincia de San Juan",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Lomas de Zamora que lleva el nombre de la provincia de San Juan, cuna del prócer Domingo Faustino Sarmiento. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica los valores sarmientinos del esfuerzo, la educación y el progreso. Una institución con identidad histórica y arraigo en la comunidad del sur del Gran Buenos Aires."
    }
  },
  {
    id: "cmpq36vxb0537rn5qmoj01z57",
    name: "Instituto Técnico Dr. Emilio Lamarca",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Instituto de educación secundaria técnica de Lomas de Zamora que lleva el nombre del jurista y político argentino Emilio Lamarca. Ofrece formación técnica especializada que habilita a los egresados tanto para el ingreso a la universidad como para el mercado laboral del sur del GBA. Su perfil técnico responde a las necesidades productivas e industriales de la región metropolitana bonaerense."
    }
  },
  {
    id: "cmpq36w24055lrn5qbpopg4li",
    name: "Jardín de Infantes Nuestra Señora del Carmen",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes privado católico de Lomas de Zamora bajo la advocación de Nuestra Señora del Carmen. Atiende niños de 2 a 5 años con una propuesta de nivel inicial que integra la devoción mariana carmelitana con el juego, el afecto y el desarrollo integral en la primera infancia. Un espacio cálido y de fe donde los más pequeños dan sus primeros pasos escolares acompañados por la Virgen del Carmen."
    }
  },
  {
    id: "cmpq36vyz053rrn5q1hgdnb46",
    name: "Lomas High School",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Lomas de Zamora con los niveles inicial, primario y secundario. Lomas High School ofrece una propuesta de educación en inglés con estándares internacionales, formando alumnos con alta competencia lingüística y preparación para el mundo globalizado. Una institución de referencia en bilingüismo en el sur del GBA, con comunidad educativa exigente y comprometida con la excelencia."
    }
  },
  {
    id: "cmpq36w4e056trn5q3a56hczq",
    name: "Modern School",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Lomas de Zamora con los niveles inicial, primario y secundario. Modern School propone una educación contemporánea con fuerte componente en inglés, tecnología y pensamiento creativo. Su nombre refleja una visión pedagógica actualizada y orientada a formar alumnos preparados para los desafíos del siglo XXI en un entorno de aprendizaje dinámico y estimulante."
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
