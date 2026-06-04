/**
 * Curación de colegios de La Plata
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-la-plata.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY.");
  process.exit(1);
}

const updates = [
  {
    id: "cmpq2wo0b01krrn5qjgtj18zd",
    name: "Colegio Bosque del Plata",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de La Plata con los niveles inicial, primario y secundario. Su nombre evoca el entorno natural que rodea a la capital bonaerense y refleja una propuesta pedagógica que valora el contacto con la naturaleza y el aprendizaje en ambientes abiertos. Reconocida por su clima institucional cálido y por el acompañamiento cercano a cada alumno a lo largo de toda la trayectoria escolar."
    }
  },
  {
    id: "cmpq2wo3z01mwrn5qbem3gya2",
    name: "Colegio Club Universitario de La Plata",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa privada de La Plata vinculada al Club Universitario, con los niveles inicial, primario y secundario. Su pertenencia a la comunidad universitaria platense imprime una identidad académica y deportiva particular, combinando la excelencia formativa con el desarrollo de valores como el trabajo en equipo, la competencia sana y el espíritu de superación."
    }
  },
  {
    id: "cmpq2wo7r01p1rn5q7mc9j0xi",
    name: "Colegio Corazón Eucarístico de Jesús",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata bajo la advocación del Corazón Eucarístico de Jesús. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la espiritualidad eucarística y la devoción al Sagrado Corazón con una sólida formación académica. Su comunidad educativa valora el encuentro con Cristo en la liturgia como eje de la vida escolar cotidiana."
    }
  },
  {
    id: "cmpq2wo8u01pnrn5q5q0kxx7q",
    name: "Colegio del Centenario - Primaria",
    payload: {
      levels: ["PRIMARIA"],
      description:
        "Institución de educación primaria privada de La Plata. El Colegio del Centenario brinda formación primaria completa con un currículo actualizado y énfasis en el desarrollo de competencias básicas para la continuidad educativa. Con historia en la ciudad, es una institución reconocida en la comunidad platense por la calidad de su propuesta y el compromiso de sus docentes."
    }
  },
  {
    id: "cmpq2wo8a01pcrn5qv5lkjw6d",
    name: "Colegio e Instituto Nuestra Señora de Luján",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata bajo la advocación de Nuestra Señora de Luján, patrona de la Argentina. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción mariana y la identidad nacional con una formación académica integral. Su comunidad educativa se caracteriza por el vínculo con la fe popular y el amor a la Virgen de Luján."
    }
  },
  {
    id: "cmpq2wodu01scrn5qmwsyfgi3",
    name: "Colegio Galileo La Plata",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de La Plata que lleva el nombre del astrónomo y físico Galileo Galilei. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia el pensamiento científico, la curiosidad y el método como pilares del aprendizaje. En una ciudad universitaria como La Plata, el Colegio Galileo apuesta por la ciencia y la investigación como herramientas de comprensión del mundo."
    }
  },
  {
    id: "cmpq2wo0u01l2rn5qda1czijl",
    name: "Colegio Jacarandá",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de La Plata cuyo nombre evoca al jacarandá, árbol emblemático del paisaje platense que florece en primavera con sus flores violetas. Ofrece los niveles inicial, primario y secundario con una propuesta pedagógica que combina calidez, creatividad y excelencia académica. Su identidad está ligada a la ciudad de La Plata y a sus calles arboladas, símbolo de belleza y renovación."
    }
  },
  {
    id: "cmpq2woco01rqrn5qga8vp9ew",
    name: "Colegio Lincoln",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de La Plata que lleva el nombre del presidente estadounidense Abraham Lincoln, símbolo de la lucha por la igualdad y la democracia. Ofrece los niveles inicial, primario y secundario con una propuesta que valora la libertad, la justicia y los derechos civiles como ejes formativos. Una institución con perfil humanístico y compromiso con los valores democráticos en la capital bonaerense."
    }
  },
  {
    id: "cmpq2wnuv01hprn5qfvv3tsln",
    name: "Colegio Manantiales La Plata",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de La Plata con los niveles inicial, primario y secundario. Su nombre evoca los manantiales como fuente de vida y renovación permanente, metáfora de una educación que nutre y transforma. Con una propuesta centrada en el desarrollo integral del alumno, el Colegio Manantiales es una institución valorada por las familias platenses por su clima de cercanía y excelencia."
    }
  },
  {
    id: "cmpq2woaf01qkrn5q36xk493o",
    name: "Colegio María Auxiliadora Obra de Don Bosco",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución salesiana femenina de La Plata dirigida por las Hijas de María Auxiliadora, perteneciente a la Obra de Don Bosco. Ofrece los niveles inicial, primario y secundario con el sistema preventivo salesiano basado en razón, religión y amor. Con presencia histórica en la ciudad, es una referencia de la educación católica platense y del carisma salesiano en el sur de la provincia."
    }
  },
  {
    id: "cmpq2woeg01snrn5qz2up0268",
    name: "Colegio María de Luján Sierra",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata bajo la advocación de María de Luján. Ofrece los niveles inicial, primario y secundario con una propuesta que combina la devoción mariana con una formación académica actualizada. Su comunidad educativa valora el acompañamiento espiritual y el clima de fraternidad que caracteriza a esta institución en el sistema educativo platense."
    }
  },
  {
    id: "cmpq2wod701s1rn5q9rn8xwzv",
    name: "Colegio Mater Dei",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata cuyo nombre, Mater Dei —Madre de Dios—, expresa la advocación mariana central de su espiritualidad. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la fe, la excelencia académica y la formación en valores evangélicos. Una institución con arraigo en la comunidad católica platense y compromiso con el desarrollo integral del alumno."
    }
  },
  {
    id: "cmpq2wo7601oqrn5q1ahs6qk0",
    name: "Colegio Monseñor Federico J. Rasore",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata que lleva el nombre del Monseñor Federico J. Rasore, figura relevante de la historia eclesiástica de la diócesis platense. Ofrece los niveles inicial, primario y secundario con una propuesta que honra la memoria de su fundador a través de una educación comprometida con la fe, el servicio y la formación integral de los alumnos."
    }
  },
  {
    id: "cmpq2wo9w01q9rn5qcdwsy2rb",
    name: "Colegio Nacional Rafael Hernández",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Colegio secundario dependiente de la Universidad Nacional de La Plata, uno de los establecimientos educativos más prestigiosos de la Argentina. Fundado en 1884 junto con la propia UNLP, el Nacional Rafael Hernández ofrece una formación bachiller de excelencia con fuerte vocación universitaria. Su ingreso selectivo, su cuerpo docente universitario y su tradición de más de un siglo lo convierten en una institución de referencia ineludible en La Plata."
    }
  },
  {
    id: "cmpq2wnvk01i0rn5qiid75m4w",
    name: "Colegio Nuestra Señora de Luján - Nivel Inicial",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes privado católico de La Plata bajo la advocación de Nuestra Señora de Luján. Atiende niños de 2 a 5 años con una propuesta de nivel inicial que integra la espiritualidad mariana con el juego, el desarrollo afectivo y la exploración creativa. Un espacio cálido y de fe donde los más pequeños dan sus primeros pasos escolares acompañados por la Virgen de Luján."
    }
  },
  {
    id: "cmpq2wo5401nirn5q53bnyfxv",
    name: "Colegio Nuestra Señora del Valle",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata bajo la advocación de Nuestra Señora del Valle, patrona de Catamarca. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción a la Virgen del Valle con una formación académica sólida y comprometida con los valores del humanismo cristiano. Una institución con identidad espiritual marcada en la comunidad educativa platense."
    }
  },
  {
    id: "cmpq2wobi01r4rn5qhvf3zi5g",
    name: "Colegio Quinquela",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de La Plata que lleva el nombre del gran pintor argentino Benito Quinquela Martín, símbolo del arte popular y del barrio de La Boca. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia las artes, la creatividad y la expresión como dimensiones centrales de la educación. Una institución con identidad artística y humanística en la capital bonaerense."
    }
  },
  {
    id: "cmpq2wo3h01mlrn5qdbin56vm",
    name: "Colegio Río de la Plata Sur",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de La Plata cuyo nombre evoca el Río de la Plata, que da nombre a la región y a la propia ciudad. Ofrece los niveles inicial, primario y secundario con una propuesta educativa que conecta la formación académica con la identidad territorial del litoral bonaerense. Su nombre refleja el orgullo por la geografía y la historia de una región que es corazón de la Argentina."
    }
  },
  {
    id: "cmpq2wo1y01lorn5qpwgno8jv",
    name: "Colegio Sagrado Corazón de Jesús",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata bajo la advocación del Sagrado Corazón de Jesús. Ofrece los niveles inicial, primario y secundario con una espiritualidad centrada en el amor misericordioso de Cristo como eje de la vida escolar. Con larga trayectoria en la ciudad, es una referencia de la educación católica platense valorada por las familias por su clima espiritual y su propuesta integral."
    }
  },
  {
    id: "cmpq2wnx301ixrn5qim154isp",
    name: "Colegio San José - La Plata",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata bajo el patronazgo de San José, padre adoptivo de Jesús y modelo del trabajo honrado. Ofrece los niveles inicial, primario y secundario con una propuesta que combina la espiritualidad josefina con una formación académica actualizada. Con décadas de historia en la ciudad, es una de las instituciones católicas más reconocidas del sistema educativo platense."
    }
  },
  {
    id: "cmpq2wnzr01kgrn5qtvvy4u5l",
    name: "Colegio San Luis",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de La Plata con los niveles inicial, primario y secundario. El Colegio San Luis ofrece una propuesta educativa integral orientada al desarrollo académico, personal y espiritual de sus alumnos. Reconocido en la comunidad platense por su clima institucional y por el compromiso de sus docentes con el crecimiento de cada estudiante en las distintas etapas de la escolaridad."
    }
  },
  {
    id: "cmpq2wo5m01ntrn5qka7hsy6o",
    name: "Colegio Santa María de los Ángeles",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata bajo la advocación de Santa María de los Ángeles. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción mariana y la protección angélica con una formación académica sólida. Su comunidad educativa valora el clima de fe y el acompañamiento espiritual que distingue a esta institución en el sistema educativo platense."
    }
  },
  {
    id: "cmpq2wnuc01hern5qk40ds5ht",
    name: "Colegio Santa Marta",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata bajo el patronazgo de Santa Marta, figura evangélica del servicio y la hospitalidad. Ofrece los niveles inicial, primario y secundario con una propuesta que combina la fe, la acogida y el servicio con una formación académica de calidad. Su carisma de hospitalidad se traduce en un clima institucional cálido y abierto a las familias de la comunidad platense."
    }
  },
  {
    id: "cmpq2wntn01h3rn5qipd6299g",
    name: "Colegio Santo Tomás Moro",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata que lleva el nombre de Santo Tomás Moro, humanista, estadista y mártir inglés del siglo XVI. Ofrece los niveles inicial, primario y secundario con una propuesta que integra el humanismo cristiano, la conciencia cívica y la integridad moral como pilares formativos. Una institución que honra al patrono de los gobernantes y los abogados con una educación comprometida con la justicia."
    }
  },
  {
    id: "cmpq2wnxn01j8rn5qbxm7lmr8",
    name: "Colegio Secundario Nuestra Señora del Valle",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Institución de educación secundaria privada de La Plata bajo la advocación de Nuestra Señora del Valle. Ofrece el nivel secundario completo con una propuesta académica orientada al ingreso universitario y la formación integral del adolescente. En una ciudad universitaria como La Plata, esta institución prepara a sus egresados para los desafíos de la vida académica y profesional desde una perspectiva de fe y valores."
    }
  },
  {
    id: "cmpq2wnz901k5rn5q42trq07k",
    name: "Colegio Secundario San Miguel Garicoits La Plata",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Institución de educación secundaria privada de La Plata que lleva el nombre de San Miguel Garicoits, fundador de los Sacerdotes del Sagrado Corazón de Jesús. Ofrece el nivel secundario con una espiritualidad betharramita centrada en la docilidad a la voluntad de Dios y el servicio apostólico. Una institución con identidad espiritual marcada que forma adolescentes con solidez académica y vida interior."
    }
  },
  {
    id: "cmpq2wnwk01imrn5qj6bs1l8h",
    name: "Colegio York",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de La Plata con los niveles inicial, primario y secundario. El Colegio York ofrece una propuesta educativa bilingüe o con fuerte componente en inglés, orientada a la formación de alumnos con competencias comunicativas globales. Reconocido en la comunidad platense por su perfil moderno y su apuesta por la integración del idioma inglés en la vida escolar cotidiana."
    }
  },
  {
    id: "cmpq2woc201rfrn5qpda98rva",
    name: "Escuela Técnica San Vicente de Paúl",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Institución de educación secundaria técnica de La Plata bajo el patronazgo de San Vicente de Paúl. Ofrece formación técnica especializada que combina el carisma vicentino del servicio a los pobres con la preparación profesional para el mercado laboral. Sus egresados obtienen el título de técnico habilitante para ejercer en las industrias y servicios de la región platense y el sur bonaerense."
    }
  },
  {
    id: "cmpq2wo1e01ldrn5qt857nyrj",
    name: "Instituto Arzobispo Juan Chimento",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata que lleva el nombre del Arzobispo Juan Chimento, figura pastoral relevante de la diócesis platense. Ofrece los niveles inicial, primario y secundario con una propuesta que honra la memoria de su patrono a través de una educación comprometida con la fe, la comunidad y la formación integral. Una institución con identidad diocesana en la capital bonaerense."
    }
  },
  {
    id: "cmpq2wo2g01lzrn5qghilvpxz",
    name: "Instituto de Enseñanza La Plata",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de La Plata con los niveles inicial, primario y secundario. El Instituto de Enseñanza La Plata ofrece una propuesta educativa actualizada y orientada a la excelencia académica en la capital bonaerense. Su nombre refleja el arraigo local y el compromiso con la formación de las generaciones platenses, en una ciudad reconocida por su alta densidad universitaria y cultural."
    }
  },
  {
    id: "cmpq2wny701jjrn5q1pw905x2",
    name: "Instituto José Manuel Estrada",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de La Plata que lleva el nombre del pensador, político y periodista católico José Manuel Estrada, figura clave del catolicismo liberal argentino del siglo XIX. Ofrece los niveles inicial, primario y secundario con una propuesta que integra el legado intelectual y cívico de Estrada con una formación académica de calidad. Una institución con identidad histórica y compromiso con los valores democráticos y la fe."
    }
  },
  {
    id: "cmpq2wo6n01ofrn5qk8asm46w",
    name: "Instituto Santa Teresa de Jesús",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata bajo el patronazgo de Santa Teresa de Jesús, doctora de la Iglesia y mística carmelita española del siglo XVI. Ofrece los niveles inicial, primario y secundario con una espiritualidad teresiana centrada en la oración, la interioridad y el amor a Dios. Una institución que forma alumnos con vida espiritual profunda y sólida preparación académica en la capital bonaerense."
    }
  },
  {
    id: "cmpq2wo4j01n7rn5qnmqu3623",
    name: "La Cueva de Osofete",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín maternal y de infantes privado de La Plata cuyo nombre evoca el mundo de la fantasía y los personajes queribles de la literatura infantil. Atiende niños desde los primeros meses hasta los 5 años con una propuesta lúdica y creativa que privilegia la imaginación, el juego simbólico y el desarrollo afectivo. Un espacio mágico y cálido donde los más pequeños platenses descubren el placer de aprender."
    }
  },
  {
    id: "cmpq2wo6501o4rn5qes23oafn",
    name: "Los Ceibos - Jardín de Infantes y Nivel Primario",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description:
        "Institución privada de La Plata con los niveles inicial y primario. Su nombre evoca al ceibo, flor nacional argentina, símbolo de identidad y arraigo en la tierra bonaerense. Ofrece una propuesta que integra los primeros años de escolaridad con continuidad pedagógica, acompañando a los niños desde el jardín hasta el fin de la primaria en un ambiente familiar y estimulante."
    }
  },
  {
    id: "cmpq2wnw201ibrn5qab072aix",
    name: "NEA Sede Centro",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Sede central del NEA (Nuevo Espacio de Aprendizaje) en La Plata, institución privada con los niveles inicial, primario y secundario. El NEA propone una pedagogía innovadora orientada al desarrollo de las capacidades individuales, el aprendizaje colaborativo y la autonomía del alumno. Con varias sedes en la ciudad, es una propuesta diferenciada para las familias platenses que buscan una educación contemporánea y personalizada."
    }
  },
  {
    id: "cmpq2wnys01jurn5q51ti0d68",
    name: "NEA Sede Norte",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Sede norte del NEA (Nuevo Espacio de Aprendizaje) en La Plata, institución privada con los niveles inicial, primario y secundario. Comparte la propuesta pedagógica innovadora del NEA orientada al aprendizaje personalizado, la creatividad y el pensamiento crítico, adaptada a las familias del sector norte de la ciudad. Una alternativa educativa diferenciada con arraigo en la comunidad platense."
    }
  },
  {
    id: "cmpq2wo2x01marn5q0ej0jvox",
    name: "San Benjamín",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata bajo el patronazgo de San Benjamín. Ofrece los niveles inicial, primario y secundario con una propuesta que integra los valores del humanismo cristiano con una formación académica sólida. Su comunidad educativa valora el clima espiritual, el acompañamiento personalizado y el trabajo conjunto entre familias y docentes en la construcción del proyecto de vida de cada alumno."
    }
  },
  {
    id: "cmpq2wo9d01pyrn5q68hiugtu",
    name: "UCALP Colegio Ministro Luis R. Mac Kay",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio dependiente de la Universidad Católica de La Plata (UCALP), que lleva el nombre del Ministro Luis R. Mac Kay. Ofrece los niveles inicial, primario y secundario dentro del sistema educativo universitario católico platense. Su pertenencia a la UCALP le otorga una identidad académica y espiritual singular, articulando la educación media con la vida universitaria y la tradición del catolicismo en La Plata."
    }
  },
  {
    id: "cmpq2woez01syrn5qz6s2ebci",
    name: "Unidad Educativa Nuestra Señora la Anunciación",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de La Plata bajo la advocación de Nuestra Señora la Anunciación. Ofrece los niveles inicial, primario y secundario con una propuesta que integra el misterio de la Anunciación —la apertura de María al plan de Dios— como modelo de escucha, disponibilidad y servicio. Una institución con espiritualidad mariana marcada y compromiso con la formación integral de sus alumnos."
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

console.log(`\n🏫  Curando ${updates.length} colegios de La Plata...\n`);

for (const { id, name, payload } of updates) {
  await patchSchool(id, name, payload);
}

console.log("\n✨  Listo.\n");
