/**
 * Curación de colegios de Bahía Blanca
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-bahia-blanca.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY.");
  process.exit(1);
}

const updates = [
  {
    id: "cmpq35lzw04v1rn5qg6ifzzds",
    name: "At Home School Of English",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Bahía Blanca con fuerte énfasis en la enseñanza del inglés desde los primeros años. Su nombre evoca la metodología de inmersión natural en el idioma, como si el inglés fuera el idioma del hogar. Ofrece los niveles inicial, primario y secundario con un modelo que privilegia la fluidez oral y la comunicación auténtica en inglés como lengua cotidiana."
    }
  },
  {
    id: "cmpq35lgm04kcrn5q06uzg5p2",
    name: "Casa Salesiana Colegio Don Bosco",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description:
        "Institución salesiana de Bahía Blanca fundada bajo el carisma de San Juan Bosco. La Casa Salesiana ofrece los niveles primario y secundario con el sistema preventivo que combina razón, religión y amor como pilares de la formación. Con vocación especial por los jóvenes más necesitados, el Don Bosco bahiense tiene décadas de historia educativa y comunitaria en el sur de la provincia."
    }
  },
  {
    id: "cmpq35lli04nern5q3bdhgxxd",
    name: "Colegio Americano",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Bahía Blanca con tradición y arraigo en la ciudad. Ofrece los niveles inicial, primario y secundario con una propuesta educativa integral orientada a la excelencia académica y la formación en valores democráticos. Reconocido en la comunidad bahiense por su trayectoria y por el compromiso de sus docentes con el desarrollo integral de cada alumno."
    }
  },
  {
    id: "cmpq35lm404nprn5qvi1pb02w",
    name: "Colegio Claret",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución claretiana de Bahía Blanca que lleva el nombre de San Antonio María Claret. Los Misioneros Claretianos conducen una propuesta que integra los niveles inicial, primario y secundario con una espiritualidad misionera orientada al servicio y la evangelización. Una institución con presencia histórica en el sur de la provincia y compromiso con la formación integral de la juventud bahiense."
    }
  },
  {
    id: "cmpq35lnr04omrn5quzmcyo0j",
    name: "Colegio José de San Martín",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Bahía Blanca que lleva el nombre del Libertador General José de San Martín. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica los valores patrióticos y la identidad nacional argentina. Su formación combina rigor académico con educación cívica y el cultivo del orgullo por la historia y la cultura del país."
    }
  },
  {
    id: "cmpq35li304l9rn5qh2dnxi1a",
    name: "Colegio Juan José Paso",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Bahía Blanca que lleva el nombre del prócer Juan José Paso, abogado y político que firmó el Acta de la Independencia Argentina. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia la formación ciudadana, la historia patria y los valores de la democracia. Una institución con identidad histórica arraigada en la comunidad bahiense."
    }
  },
  {
    id: "cmpq35lmr04o0rn5q5t2dekcf",
    name: "Colegio La Asunción",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Bahía Blanca bajo la advocación de la Asunción de la Virgen María. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la tradición mariana con una formación académica actualizada. Su comunidad educativa valora el clima de fe, el acompañamiento espiritual y el trabajo conjunto entre familias, docentes y alumnos."
    }
  },
  {
    id: "cmpq35lik04lkrn5q1w2bpg2w",
    name: "Colegio La Inmaculada",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Bahía Blanca bajo la advocación de la Inmaculada Concepción. Ofrece los niveles inicial, primario y secundario con una propuesta que combina excelencia académica y formación en valores marianos. Con décadas de historia en la ciudad, es una de las instituciones más reconocidas de la comunidad católica bahiense por su clima institucional y su compromiso educativo."
    }
  },
  {
    id: "cmpq35lpx04purn5qaaxnwphf",
    name: "Colegio La Pequeña Obra",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución orionista de Bahía Blanca perteneciente a la Pequeña Obra de la Divina Providencia fundada por San Luis Orione. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la formación académica con la atención preferencial a los más vulnerables. Su carisma orionista de caridad y servicio se traduce en una educación abierta e inclusiva para la comunidad bahiense."
    }
  },
  {
    id: "cmpq35lh404knrn5q8t3c071g",
    name: "Colegio La Piedad",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Bahía Blanca con los niveles inicial, primario y secundario. Su nombre evoca la piedad y la misericordia como valores fundantes de la propuesta educativa. Con larga trayectoria en la ciudad, el Colegio La Piedad es una referencia del sistema privado bahiense, valorado por las familias por su clima institucional cálido y su compromiso con la formación integral."
    }
  },
  {
    id: "cmpq35ll004n3rn5q8ur77nu6",
    name: "Colegio María Auxiliadora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución salesiana femenina de Bahía Blanca dirigida por las Hijas de María Auxiliadora. Ofrece los niveles inicial, primario y secundario con la espiritualidad de Don Bosco y la devoción mariana como ejes formativos. Con décadas de presencia salesiana en el sur bonaerense, forma alumnas con sólida preparación académica, valores humanos y apertura al mundo."
    }
  },
  {
    id: "cmpq35lel04j4rn5q88cs8g3z",
    name: "Colegio Martín Miguel de Güemes",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Bahía Blanca que lleva el nombre del héroe de la independencia argentina Martín Miguel de Güemes, defensor de la frontera norte. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica el coraje, el sacrificio y el amor a la patria. Su identidad histórica se traduce en una educación ciudadana comprometida con los valores de la Argentina independiente."
    }
  },
  {
    id: "cmpq35lww04t7rn5q3uhooobo",
    name: "Colegio Presidente Sarmiento",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Bahía Blanca que lleva el nombre del prócer Domingo Faustino Sarmiento, padre de la educación pública argentina. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica los valores sarmientinos del esfuerzo, el conocimiento y la educación como herramienta de progreso social. Una institución con arraigo histórico en la comunidad bahiense."
    }
  },
  {
    id: "cmpq35lf504jfrn5qe82iw71q",
    name: "Colegio Puerto del Sur",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Bahía Blanca cuyo nombre evoca el carácter portuario e industrial de la ciudad. Ofrece los niveles inicial, primario y secundario con una propuesta pedagógica que conecta la formación académica con la identidad territorial bahiense. Su nombre refleja el orgullo por una ciudad que es puerta de salida al mundo, y su proyecto forma ciudadanos con arraigo local y proyección global."
    }
  },
  {
    id: "cmpq35lhl04kyrn5qjl4o2yo6",
    name: "Colegio Rosario Vera Peñaloza",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Bahía Blanca que lleva el nombre de la gran educadora argentina Rosario Vera Peñaloza, pionera de la pedagogía activa en la Argentina. Ofrece los niveles inicial, primario y secundario con una propuesta inspirada en los principios del aprendizaje por la experiencia y el desarrollo integral del niño. Una institución que honra la memoria de una de las maestras más importantes de la historia educativa argentina."
    }
  },
  {
    id: "cmpq35lfm04jqrn5q0q43nfcx",
    name: "Colegios del Solar",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Bahía Blanca con los niveles inicial, primario y secundario. Con una propuesta educativa que privilegia el entorno natural y la conexión con el medio ambiente como recursos pedagógicos, los Colegios del Solar ofrecen una alternativa educativa diferenciada en la ciudad. Valorados por las familias bahienses por su ambiente tranquilo y su enfoque en el desarrollo integral del alumno."
    }
  },
  {
    id: "cmpq35lki04msrn5qxbv2e1nh",
    name: "Colegio Victoria Ocampo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Bahía Blanca que lleva el nombre de Victoria Ocampo, escritora, editora y fundadora de la revista Sur, una de las figuras más importantes de la cultura argentina del siglo XX. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia la literatura, las artes y la formación humanística. Una institución con identidad cultural marcada en el sistema educativo bahiense."
    }
  },
  {
    id: "cmpq35lyw04ufrn5qtx93t54g",
    name: "Escuela de Educación Secundaria Nº14 Eduardo Mallea",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Institución secundaria de Bahía Blanca que lleva el nombre del escritor bahiense Eduardo Mallea, uno de los narradores más importantes de la literatura argentina del siglo XX. Ofrece el bachillerato con una propuesta curricular que rinde homenaje al vínculo entre Bahía Blanca y la literatura nacional. Su identidad local se traduce en una educación comprometida con la cultura y la historia de la ciudad."
    }
  },
  {
    id: "cmpq35luc04sarn5q9xue5b0p",
    name: "Escuela de Educación Secundaria Técnica Nº4 Antártida",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Institución de educación secundaria técnica de Bahía Blanca que lleva el nombre del territorio antártico argentino. Ofrece formación técnica especializada que habilita a los egresados tanto para el ingreso a la universidad como para el mercado laboral. Su perfil técnico responde a las necesidades productivas de Bahía Blanca, ciudad portuaria e industrial con alta demanda de técnicos calificados."
    }
  },
  {
    id: "cmpq35lji04m6rn5qdccsd252",
    name: "Escuela de la Ciudad",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Bahía Blanca con los niveles inicial, primario y secundario. Su nombre refleja una identidad arraigada en la ciudad y su propuesta pedagógica apunta a formar ciudadanos comprometidos con la comunidad bahiense. Reconocida por su clima institucional cercano y por el trabajo colaborativo entre docentes y familias en la construcción del proyecto educativo."
    }
  },
  {
    id: "cmpq35lvx04slrn5qg1m5bq14",
    name: "Escuela del Libertador",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Bahía Blanca que lleva el nombre del Libertador San Martín. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia los valores patrióticos, la historia argentina y la formación ciudadana. Su identidad histórica se traduce en una educación que forma alumnos con sentido de pertenencia nacional y compromiso con la democracia."
    }
  },
  {
    id: "cmpq35lsg04rdrn5quqpxkef1",
    name: "Escuela Marina Coppa",
    payload: {
      levels: ["PRIMARIA"],
      description:
        "Escuela privada de educación primaria de Bahía Blanca. Brinda formación primaria integral con una propuesta centrada en el acompañamiento personalizado y el desarrollo de las capacidades de cada alumno. Reconocida en la comunidad bahiense por el compromiso docente y el trabajo cercano con las familias en los años fundamentales de la escolaridad."
    }
  },
  {
    id: "cmpq35lxh04tirn5qb8nk89j8",
    name: "Escuela N°5 Provincia de Buenos Aires",
    payload: {
      levels: ["PRIMARIA"],
      description:
        "Institución de educación primaria de Bahía Blanca con dependencia provincial. Brinda educación primaria con el currículo oficial de la Provincia de Buenos Aires, formando a los alumnos en las competencias básicas para la continuidad educativa. Una institución con historia en el sistema educativo bahiense al servicio de la comunidad."
    }
  },
  {
    id: "cmpq35lk004mhrn5q11kvr9dr",
    name: "Escuela Primaria Jacarandá",
    payload: {
      levels: ["PRIMARIA"],
      description:
        "Escuela de educación primaria privada de Bahía Blanca. Su nombre evoca al jacarandá, árbol característico del paisaje urbano bonaerense que florece en primavera. Ofrece una propuesta de nivel primario centrada en la formación integral del niño, con énfasis en los vínculos afectivos, el aprendizaje significativo y el desarrollo de la creatividad en los años fundamentales de la escolaridad."
    }
  },
  {
    id: "cmpq35lor04p8rn5qozafwdlu",
    name: "Escuela San Cayetano",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description:
        "Institución educativa católica de Bahía Blanca bajo la advocación de San Cayetano, patrono del trabajo y el pan. Ofrece los niveles inicial y primario con una propuesta que integra la fe, el trabajo y la solidaridad como valores fundantes. Su carisma teatino —la orden de San Cayetano— se traduce en una educación comprometida con los sectores más vulnerables de la comunidad bahiense."
    }
  },
  {
    id: "cmpq35lqz04qgrn5qay9owc5h",
    name: "Escuela San Francisco de Asís",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa franciscana de Bahía Blanca bajo el patronazgo de San Francisco de Asís. Ofrece los niveles inicial, primario y secundario con la espiritualidad franciscana centrada en el amor a la naturaleza, la pobreza evangélica y la fraternidad universal. Su propuesta forma alumnos con sensibilidad ecológica, espíritu de servicio y valores del humanismo cristiano franciscano."
    }
  },
  {
    id: "cmpq35lqh04q5rn5qq1y6hn9p",
    name: "Escuela San Vicente de Paúl",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa vicentina de Bahía Blanca bajo el patronazgo de San Vicente de Paúl, apóstol de la caridad. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la formación académica con la espiritualidad vicentina orientada al servicio de los pobres. Su carisma se traduce en una educación sensible a la vulnerabilidad social y comprometida con la justicia."
    }
  },
  {
    id: "cmpq35lj204lvrn5q35hv7g67",
    name: "Instituto Adventista Bahía Blanca",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa adventista de Bahía Blanca perteneciente a la Iglesia Adventista del Séptimo Día. Ofrece los niveles inicial, primario y secundario con una propuesta que integra formación académica, valores bíblicos y estilo de vida saludable. Con presencia global en más de 150 países, la educación adventista en Bahía Blanca ofrece una alternativa integral orientada al desarrollo holístico de la persona."
    }
  },
  {
    id: "cmpq35ltp04rzrn5ql5u0hw0j",
    name: "Instituto Regional del Sur",
    payload: {
      levels: ["SECUNDARIA", "SUPERIOR"],
      description:
        "Instituto privado de Bahía Blanca con oferta de nivel secundario y superior. Como institución regional, su propuesta responde a las necesidades formativas del sur de la provincia de Buenos Aires, articulando la educación media con carreras terciarias que habilitan para el mercado laboral local. Una referencia en la formación profesional del sur bonaerense."
    }
  },
  {
    id: "cmpq35lt404rorn5qfvlntroj",
    name: "Instituto Superior Dr. Pedro Goyena",
    payload: {
      levels: ["SUPERIOR"],
      description:
        "Instituto de educación superior privado de Bahía Blanca que lleva el nombre del político y periodista bahiense Pedro Goyena. Ofrece carreras terciarias con orientación pedagógica y profesional, formando docentes y profesionales para el sistema educativo y el mercado laboral del sur bonaerense. Una institución con identidad local y compromiso con la calidad de la formación de nivel superior."
    }
  },
  {
    id: "cmpq35lrz04r2rn5q1cvuyhvu",
    name: "Instituto Superior Juan XXIII",
    payload: {
      levels: ["SUPERIOR"],
      description:
        "Instituto de educación superior privado católico de Bahía Blanca que lleva el nombre del Papa Juan XXIII, impulsor del Concilio Vaticano II. Ofrece carreras terciarias orientadas a la formación docente y profesional desde una perspectiva de apertura y diálogo con el mundo contemporáneo. Su espíritu conciliar se traduce en una institución abierta, plural y comprometida con la formación de calidad."
    }
  },
  {
    id: "cmpq35lna04obrn5qdm4ohruh",
    name: "Instituto Técnico La Piedad",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Instituto de educación secundaria técnica de Bahía Blanca vinculado al Colegio La Piedad. Ofrece el bachillerato técnico con especialización que habilita a los egresados para el ingreso a la universidad y el mercado laboral. Su perfil técnico responde a las necesidades industriales y portuarias de Bahía Blanca, formando técnicos con sólida base académica y competencias prácticas."
    }
  },
  {
    id: "cmpq35lze04uqrn5qqew584yz",
    name: "Jardín de Infantes Colorín Colorado",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes privado de Bahía Blanca cuyo nombre evoca el mundo de los cuentos y la narrativa infantil. Atiende niños de 2 a 5 años con una propuesta centrada en la literatura, el juego simbólico y la expresión creativa como ejes del aprendizaje en la primera infancia. Un espacio cálido y estimulante donde los más pequeños descubren el placer de las palabras y la imaginación."
    }
  },
  {
    id: "cmpq35lo704oxrn5qa6dba1zg",
    name: "Jardín de Infantes San Cayetano",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes privado católico de Bahía Blanca bajo la advocación de San Cayetano. Atiende niños de 2 a 5 años con una propuesta de nivel inicial que integra el juego, la espiritualidad y el desarrollo afectivo como pilares de la primera infancia. Su ambiente cálido y familiar, guiado por la devoción al santo del trabajo, lo convierte en un espacio de confianza para las familias bahienses."
    }
  },
  {
    id: "cmpq35lpg04pjrn5qxr6hfk2q",
    name: "Jardín de Infantes y Maternal Abuela Aurea Bilingüe",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín maternal y de infantes bilingüe de Bahía Blanca que honra la memoria de la Abuela Aurea. Atiende niños desde los primeros meses hasta los 5 años con una propuesta de inmersión temprana en inglés y español. Su modelo bilingüe desde la primera infancia sienta las bases para un desarrollo lingüístico sólido en ambas lenguas, en un ambiente cálido y afectivo que evoca el calor del hogar."
    }
  },
  {
    id: "cmpq35lwg04swrn5q49c1hnqt",
    name: "Jardín de Infantes y Maternal Puerto Infancia",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín maternal y de infantes privado de Bahía Blanca cuyo nombre evoca el puerto como punto de partida para grandes aventuras. Atiende niños desde los primeros meses hasta los 5 años con una propuesta que privilegia la exploración, el movimiento y el vínculo afectivo seguro. Un espacio donde los más pequeños zarpen hacia el aprendizaje en un ambiente cálido y estimulante."
    }
  },
  {
    id: "cmpq35lye04u4rn5qqmbjaou7",
    name: "Marina Coppa No. 113",
    payload: {
      levels: ["PRIMARIA"],
      description:
        "Institución de educación primaria de Bahía Blanca. Brinda formación primaria completa con el currículo oficial, acompañando a los alumnos en los años fundamentales de su desarrollo académico y personal. Una institución con historia en el sistema educativo bahiense al servicio de las familias de la ciudad."
    }
  },
  {
    id: "cmpq35lg304k1rn5qcjf1zpkm",
    name: "Nuestra Señora de Pompeya",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Bahía Blanca bajo la advocación de Nuestra Señora del Rosario de Pompeya. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción a la Virgen de Pompeya con una formación académica sólida. Su comunidad educativa valora el clima espiritual y el acompañamiento personal que distingue a esta institución en el sistema educativo bahiense."
    }
  },
  {
    id: "cmpq35lxy04ttrn5qy8zscpuz",
    name: "OneSchool Global Bahía Blanca Campus",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description:
        "Campus local de OneSchool Global, red educativa internacional con presencia en más de 20 países. Ofrece los niveles primario y secundario con un currículo integrado y estándares internacionales que permiten a los alumnos continuar sus estudios en cualquier campus del mundo. Una propuesta educativa única en Bahía Blanca para familias con proyección global y movilidad internacional."
    }
  },
  {
    id: "cmpq35lrg04qrrn5q0xgtnuip",
    name: "Santa María de los Apóstoles",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Bahía Blanca bajo la advocación de Santa María de los Apóstoles. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la misión apostólica con una formación académica actualizada. Su espíritu misionero se traduce en una educación comprometida con el servicio, la apertura al otro y la construcción de una comunidad educativa fraterna."
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

console.log(`\n🏫  Curando ${updates.length} colegios de Bahía Blanca...\n`);

for (const { id, name, payload } of updates) {
  await patchSchool(id, name, payload);
}

console.log("\n✨  Listo.\n");
