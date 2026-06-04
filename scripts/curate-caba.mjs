/**
 * Curación de colegios de Buenos Aires (CABA)
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-caba.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY.");
  process.exit(1);
}

const updates = [
  {
    id: "cmpq2nmkl0022rn5q81kpdztj",
    name: "Argentina School",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución bilingüe privada de Buenos Aires con los niveles inicial, primario y secundario. Su propuesta combina el currículo argentino con una sólida enseñanza del inglés y metodologías de vanguardia. Una opción reconocida en la ciudad para familias que priorizan el bilingüismo y la formación integral con proyección internacional."
    }
  },
  {
    id: "cmpq2nmm1002zrn5qwb4d4wxy",
    name: "Colegio Aletheia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico de Buenos Aires cuyo nombre —aletheia, verdad en griego— refleja una propuesta pedagógica centrada en la búsqueda del conocimiento genuino. Ofrece los niveles inicial, primario y secundario con un enfoque que privilegia el pensamiento crítico, la autonomía intelectual y la formación ética. Una institución valorada por familias que buscan una educación con identidad propia en la ciudad."
    }
  },
  {
    id: "cmpq2r2jy00c5rn5qi3p7vkxz",
    name: "Colegio Bayard",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico de Buenos Aires con los niveles inicial, primario y secundario. Con una propuesta educativa centrada en la excelencia académica y el desarrollo integral del alumno, el Colegio Bayard es una referencia en el sistema educativo privado porteño. Su comunidad activa de familias y egresados refleja décadas de compromiso con la calidad educativa en la ciudad."
    }
  },
  {
    id: "cmpq2r2rq00g4rn5q9kdeg2ox",
    name: "Colegio Bilingüe St. Gregory's School",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Buenos Aires con tradición anglosajona. Ofrece los niveles inicial, primario y secundario con un modelo de inmersión en inglés que permite a los alumnos alcanzar fluidez genuina. Su propuesta pedagógica combina lo mejor de la tradición educativa británica con el currículo argentino, formando egresados con competencias para desenvolverse en contextos globales."
    }
  },
  {
    id: "cmpq2r2gb00abrn5qms9qrv4k",
    name: "Colegio Buen Consejo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Buenos Aires bajo la advocación de Nuestra Señora del Buen Consejo. Ofrece los niveles inicial, primario y secundario con una propuesta que integra formación académica sólida y valores del humanismo cristiano. Su comunidad educativa se destaca por el clima de pertenencia, el acompañamiento espiritual y el seguimiento personalizado de cada alumno."
    }
  },
  {
    id: "cmpq2nmjr001rrn5qcjyixl83",
    name: "Colegio Buenos Aires",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada porteña con los niveles inicial, primario y secundario. Su nombre refleja el arraigo profundo con la ciudad y su propuesta pedagógica apunta a formar ciudadanos comprometidos con la cultura, la historia y los valores de Buenos Aires. Reconocido en el sistema educativo porteño por su trayectoria y por el vínculo cercano entre docentes, alumnos y familias."
    }
  },
  {
    id: "cmpq2r2hr00b8rn5qdsf3i602",
    name: "Colegio de la Ciudad",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico de Buenos Aires con una propuesta pedagógica innovadora y marcada identidad porteña. Ofrece los niveles inicial, primario y secundario con metodologías activas que privilegian la creatividad, el trabajo colaborativo y el pensamiento crítico. Su proyecto educativo incluye espacios de arte, expresión corporal y tecnología, y es reconocido por su clima institucional plural e inclusivo."
    }
  },
  {
    id: "cmpq2r2p000ewrn5qdbi4pewe",
    name: "Colegio del Libertador",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Buenos Aires que lleva el nombre del General José de San Martín, el Libertador de América. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica los valores de la historia y la identidad nacional argentina. Su formación combina rigor académico con educación en valores cívicos y compromiso social, formando alumnos con sentido de pertenencia y responsabilidad."
    }
  },
  {
    id: "cmpq2nmqh005frn5qxfbmgkpy",
    name: "Colegio del Salvador",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa jesuita de Buenos Aires con más de un siglo de historia, considerada una de las más prestigiosas de la Argentina. Fundada por la Compañía de Jesús, ofrece los niveles primario y secundario con la pedagogía ignaciana que combina excelencia académica, formación espiritual y compromiso con la justicia social. Sus egresados ocupan posiciones de liderazgo en los principales ámbitos de la sociedad argentina."
    }
  },
  {
    id: "cmpq2r2kf00cgrn5qurp7zakc",
    name: "Colegio de Nuestra Señora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Buenos Aires bajo la advocación de Nuestra Señora. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la tradición mariana con una formación académica actualizada. Su comunidad educativa valora el clima espiritual, el acompañamiento individual y la formación en valores que distingue a esta institución en el sistema educativo porteño."
    }
  },
  {
    id: "cmpq2r2j900burn5q7k3ae09r",
    name: "Colegio Esclavas del Sagrado Corazón de Jesús",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa de la congregación de las Esclavas del Sagrado Corazón de Jesús en Buenos Aires. Ofrece los niveles inicial, primario y secundario con una espiritualidad centrada en el amor al Sagrado Corazón y el servicio generoso. Su propuesta pedagógica forma alumnos con sólida preparación académica, valores evangélicos y vocación de servicio a la comunidad."
    }
  },
  {
    id: "cmpq2nmlk002orn5qr54gvol9",
    name: "Colegio Euskal Echea - Sede CABA",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Sede porteña del Colegio Euskal Echea, institución de la comunidad vasca en Argentina con más de un siglo de historia. Ofrece los niveles inicial, primario y secundario integrando el currículo argentino con la enseñanza del euskera y la cultura vasca. Una de las instituciones de comunidades europeas más reconocidas de Buenos Aires, con una tradición educativa que combina identidad cultural y excelencia académica."
    }
  },
  {
    id: "cmpq2nmog0047rn5qn961vzqy",
    name: "Colegio Franco Argentino",
    payload: {
      levels: ["MATERNAL", "INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución bilingüe franco-argentina de Buenos Aires con una tradición de más de 100 años. Ofrece desde el nivel maternal hasta el secundario con un programa bilingüe francés-español que otorga el Baccalauréat français además del título argentino. Reconocido como uno de los colegios bilingües más prestigiosos de Buenos Aires, forma alumnos con identidad bicultural y competencias para desenvolverse en Europa y América."
    }
  },
  {
    id: "cmpq2r2ns00earn5q6oh854b3",
    name: "Colegio Guadalupe",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Buenos Aires bajo la advocación de Nuestra Señora de Guadalupe, patrona de América Latina. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción guadalupana con una formación académica sólida. Su identidad latinoamericana se traduce en una educación abierta, inclusiva y comprometida con los valores del humanismo cristiano."
    }
  },
  {
    id: "cmpq2nmmx003arn5qmp46il9x",
    name: "Colegio La Anunciata",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa católica de Buenos Aires de la congregación de las Hermanas de la Anunciata. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la espiritualidad de la Anunciación con una formación académica de calidad. Su proyecto educativo privilegia el desarrollo integral de la persona, la apertura al otro y el compromiso con la comunidad desde una perspectiva de fe."
    }
  },
  {
    id: "cmpq2nmnv003wrn5qte6u2h8l",
    name: "Colegio Lange Ley",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Buenos Aires con los niveles inicial, primario y secundario. Con décadas de trayectoria en el sistema educativo porteño, el Colegio Lange Ley ofrece una formación integral que combina exigencia académica con desarrollo humano. Su comunidad de familias valora el trato personalizado y el seguimiento individual que caracterizan a esta institución."
    }
  },
  {
    id: "cmpq2nmii0015rn5qreocz0hm",
    name: "Colegio La Salle Buenos Aires",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description:
        "Institución lasallana de Buenos Aires fundada por los Hermanos de las Escuelas Cristianas, congregación creada por San Juan Bautista de La Salle en el siglo XVII. Ofrece los niveles primario y secundario con una propuesta que combina excelencia académica, educación en la fe y compromiso con los más necesitados. La red mundial lasallana garantiza estándares educativos de primer nivel con presencia en más de 80 países."
    }
  },
  {
    id: "cmpq2nmgs0008rn5qyg8z05vw",
    name: "Colegio Las Cumbres",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico de Buenos Aires con amplia trayectoria en el sistema educativo porteño. Ofrece los niveles inicial, primario y secundario con una propuesta pedagógica que equilibra exigencia académica con formación humana integral. Las Cumbres es reconocido por su comunidad activa, sus espacios extracurriculares y por el seguimiento personalizado que brinda a sus alumnos a lo largo de toda la escolaridad."
    }
  },
  {
    id: "cmpq2r2oa00elrn5qogqh6g1j",
    name: "Colegio León XIII - Obra de Don Bosco",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description:
        "Institución salesiana de Buenos Aires que lleva el nombre del Papa León XIII, gran impulsor de la doctrina social de la Iglesia. Parte de la Obra de Don Bosco, ofrece los niveles primario y secundario con el sistema preventivo salesiano que combina razón, religión y amor. Con vocación por la educación de los sectores populares, León XIII forma jóvenes con valores, oficio y fe."
    }
  },
  {
    id: "cmpq2nmne003lrn5q8evn8otk",
    name: "Colegio Logosófico González Pecotche",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa única en Argentina basada en la Logosofia, sistema de conocimiento y evolución consciente fundado por Carlos Bernardo González Pecotche. Ofrece los niveles inicial, primario y secundario con una propuesta que integra el currículo oficial con principios logosóficos orientados al autoconocimiento y el desarrollo de las potencialidades del ser humano. Una alternativa educativa con identidad filosófica propia."
    }
  },
  {
    id: "cmpq2r2mc00dorn5qg47tj4dp",
    name: "Colegio Los Robles - sede Centro",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description:
        "Sede Centro del Colegio Los Robles, institución privada laica con varias sedes en Buenos Aires. Ofrece los niveles primario y secundario con una propuesta pedagógica que prioriza la formación integral, el pensamiento crítico y el trabajo en valores. Su continuidad entre niveles y el clima institucional cercano son aspectos valorados por las familias porteñas que eligen esta institución."
    }
  },
  {
    id: "cmpq2r2n900dzrn5q6m0cx1h5",
    name: "Colegio Mallinckrodt",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa privada de Buenos Aires con los niveles inicial, primario y secundario. El Colegio Mallinckrodt combina una propuesta académica sólida con formación en valores y actividades extracurriculares enriquecedoras. Valorado por las familias porteñas por su ambiente ordenado, el compromiso de su equipo docente y la atención personalizada que brinda a cada alumno."
    }
  },
  {
    id: "cmpq2nmqz005qrn5quuz8vx3t",
    name: "Colegio Mater Ter Admirabilis",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución católica de Buenos Aires bajo la advocación de Mater Ter Admirabilis (Madre Tres Veces Admirable), título mariano vinculado a la congregación de los Padres Pallotinos. Ofrece los niveles inicial, primario y secundario con una formación que integra el rigor académico con la espiritualidad mariana. Su propuesta educativa busca formar personas íntegras, comprometidas con su fe y con la sociedad."
    }
  },
  {
    id: "cmpq2r2gt00amrn5qzk9tsf87",
    name: "Colegio Nacional de Buenos Aires",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Institución secundaria de gestión nacional dependiente de la Universidad de Buenos Aires, fundada en 1863 y considerada una de las más prestigiosas del país. Su bachillerato humanístico de 5 años forma a los alumnos con una preparación académica de excelencia que habilita el ingreso a las mejores universidades del mundo. Sus egresados incluyen presidentes, premios Nobel y figuras destacadas de la cultura argentina."
    }
  },
  {
    id: "cmpq2r2qy00ftrn5qr8wz8qjn",
    name: "Colegio New Model International",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Buenos Aires con enfoque internacional. Ofrece los niveles inicial, primario y secundario con un modelo educativo que integra el currículo argentino con estándares internacionales y enseñanza intensiva del inglés. Su propuesta apunta a formar alumnos con competencias globales, capacidad de adaptación a distintos contextos culturales y herramientas para acceder a universidades del exterior."
    }
  },
  {
    id: "cmpq2nmpj004trn5qcfuqn1wc",
    name: "Colegio Palermo Chico",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico ubicado en el exclusivo barrio de Palermo Chico, uno de los más cotizados de Buenos Aires. Ofrece los niveles inicial, primario y secundario con una propuesta pedagógica de alta calidad en un entorno privilegiado. Su ubicación y propuesta lo convierten en una de las opciones más elegidas por familias del norte de la ciudad que buscan educación privada de excelencia."
    }
  },
  {
    id: "cmpq2nmi0000urn5qx6cn4h9o",
    name: "Colegio San Agustín",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa agustiniana de Buenos Aires fundada bajo el patronazgo de San Agustín de Hipona, uno de los Doctores más influyentes de la Iglesia. Los Padres Agustinos conducen una propuesta que combina la tradición intelectual agustiniana —la búsqueda de la verdad y el amor— con una formación académica actualizada. Una institución con presencia histórica en Buenos Aires y vocación por la excelencia humana e intelectual."
    }
  },
  {
    id: "cmpq2nmj2001grn5qcydv6dbc",
    name: "Colegio San Eduardo - Colegio Bilingüe Privado",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Buenos Aires bajo la advocación de San Eduardo. Ofrece los niveles inicial, primario y secundario con una propuesta de enseñanza intensiva del inglés integrada al currículo. Su modelo bilingüe genuino permite a los alumnos desarrollar fluidez real en inglés desde los primeros años, preparándolos para acceder a universidades y entornos laborales internacionales."
    }
  },
  {
    id: "cmpq2r2q600firn5qhk2nppp2",
    name: "Colegio San Marón",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa de la comunidad maronita de Buenos Aires, fundada bajo el patronazgo de San Marón, monje sirio del siglo V y padre espiritual de la Iglesia Maronita. Ofrece los niveles inicial, primario y secundario integrando el currículo argentino con la cultura, la espiritualidad y el idioma árabe de la tradición libanesa. Una institución con profundo arraigo en la comunidad árabe-argentina de Buenos Aires."
    }
  },
  {
    id: "cmpq2r2ha00axrn5qqeopfkt3",
    name: "Escuela Argentina Modelo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Escuela bilingüe privada de Buenos Aires con los niveles inicial, primario y secundario. Su propuesta combina el currículo oficial con enseñanza intensiva del inglés y metodologías activas que privilegian el aprendizaje significativo. La Escuela Argentina Modelo es reconocida en el sistema educativo porteño por su búsqueda permanente de la excelencia pedagógica y por la formación de alumnos competentes y comprometidos."
    }
  },
  {
    id: "cmpq2nmrf0061rn5qgf611j11",
    name: "Instituto Amanecer",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Buenos Aires con los niveles inicial, primario y secundario. Su nombre evoca el comienzo y la esperanza, valores que se traducen en una propuesta pedagógica orientada al acompañamiento integral del alumno. El Instituto Amanecer es valorado por las familias porteñas por su clima institucional cálido, el seguimiento personalizado y el compromiso docente con el desarrollo de cada estudiante."
    }
  },
  {
    id: "cmpq2r2ie00bjrn5qqbspb78e",
    name: "Instituto Buenos Aires",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado porteño con los niveles inicial, primario y secundario. Con una propuesta educativa integral y arraigo en la ciudad, el Instituto Buenos Aires combina formación académica sólida con actividades extracurriculares y desarrollo humano. Su identidad porteña se traduce en una educación conectada con la cultura y la historia de la ciudad, formando ciudadanos comprometidos con Buenos Aires."
    }
  },
  {
    id: "cmpq2nmp0004irn5qjf6eqayc",
    name: "Instituto Don Orione",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución orionista de Buenos Aires fundada bajo el carisma de San Luis Orione, apóstol de la caridad. Los Padres de la Pequeña Obra de la Divina Providencia conducen una propuesta que integra la formación académica con la educación en valores evangélicos y la atención preferencial a los más necesitados. Con presencia en más de 30 países, la obra orionista en Buenos Aires tiene décadas de historia educativa."
    }
  },
  {
    id: "cmpq2r2lf00d2rn5qcguy0o4i",
    name: "Instituto Español Virgen del Pilar",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto de la comunidad española de Buenos Aires bajo la advocación de la Virgen del Pilar de Zaragoza, patrona de la hispanidad. Ofrece los niveles inicial, primario y secundario integrando el currículo argentino con la enseñanza del español peninsular, la historia y la cultura de España. Una institución con profundo arraigo en la comunidad española de Buenos Aires y en la historia de la inmigración ibérica en Argentina."
    }
  },
  {
    id: "cmpq2nmq00054rn5q3kiqji0s",
    name: "Instituto María Auxiliadora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución salesiana femenina de Buenos Aires dirigida por las Hijas de María Auxiliadora. Ofrece los niveles inicial, primario y secundario con el sistema preventivo de Don Bosco y la espiritualidad mariana de María Auxiliadora como ejes formativos. Su propuesta integra excelencia académica, formación artística y humana en una comunidad educativa con más de un siglo de presencia salesiana en Argentina."
    }
  },
  {
    id: "cmpq2r2po00f7rn5qll68n9jd",
    name: "Instituto Sudamericano Modelo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Buenos Aires con los niveles inicial, primario y secundario. Su nombre refleja una vocación de excelencia con proyección continental, ofreciendo una formación que prepara a los alumnos para los desafíos educativos y laborales de América del Sur. Reconocido en el sistema educativo porteño por su propuesta integral y el compromiso de su comunidad docente."
    }
  },
  {
    id: "cmpq2r2lw00ddrn5qax2ht4tz",
    name: "Jardín Los Robles",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes del Colegio Los Robles en Buenos Aires, orientado a niños de 2 a 5 años. Parte del proyecto educativo integral del complejo Los Robles, ofrece un ambiente cálido y estimulante donde el juego, la exploración y el vínculo afectivo son los ejes del aprendizaje. Su continuidad con los niveles superiores de la misma institución facilita la transición al primario en una comunidad conocida y confiable."
    }
  },
  {
    id: "cmpq2r2ky00crrn5qveq1mjao",
    name: "St. Matthew's College",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Buenos Aires con tradición anglicana. Ofrece los niveles inicial, primario y secundario con una propuesta de inmersión en inglés y una sólida formación en valores humanistas. St. Matthew's es uno de los colegios bilingües más reconocidos de Buenos Aires, valorado por las familias por su exigencia académica, su ambiente ordenado y la preparación de sus egresados para el mundo universitario internacional."
    }
  },
  {
    id: "cmpq2nml5002drn5qkpdejsiz",
    name: "Washington School",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Buenos Aires con impronta norteamericana. Ofrece los niveles inicial, primario y secundario con un modelo educativo inspirado en la tradición educativa anglosajona y una propuesta bilingüe que privilegia la fluidez comunicativa en inglés. Su nombre rinde homenaje al primer presidente de los Estados Unidos y su proyecto apunta a formar alumnos con competencias globales y valores democráticos."
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

console.log(`\n🏫  Curando ${updates.length} colegios de Buenos Aires (CABA)...\n`);

for (const { id, name, payload } of updates) {
  await patchSchool(id, name, payload);
}

console.log("\n✨  Listo.\n");
