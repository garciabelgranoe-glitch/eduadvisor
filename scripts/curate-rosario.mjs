/**
 * Curación de colegios de Rosario
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-rosario.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY.");
  process.exit(1);
}

const updates = [
  {
    id: "cmpq2u8c800v5rn5q8p2e7vbx",
    name: "Casa Salesiana San José",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución salesiana de Rosario bajo el patronazgo de San José, padre adoptivo de Jesús y patrono de la familia y los trabajadores. Ofrece los niveles inicial, primario y secundario con el sistema preventivo de Don Bosco basado en razón, religión y amor. Con larga presencia de los Salesianos en la ciudad, es una referencia de la educación católica rosarina por su clima fraterno y su compromiso con la juventud."
    }
  },
  {
    id: "cmpq2u8mp0119rn5qznbdjrnp",
    name: "Centro Educativo Dante Alighieri",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario que lleva el nombre del poeta florentino Dante Alighieri, autor de la Divina Comedia y padre de la lengua italiana. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra el vínculo entre la Argentina y la cultura italiana, tan presente en la identidad rosarina. Una institución con fuerte raíz itálica que forma alumnos con sensibilidad humanística y literaria."
    }
  },
  {
    id: "cmpq2u8kk0101rn5qyk7ozrmk",
    name: "Centro Educativo Vida",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario con los niveles inicial, primario y secundario. Su nombre, Vida, refleja una propuesta pedagógica centrada en el desarrollo integral de la persona y la celebración de la vida en todas sus dimensiones. Con un clima institucional cálido y comprometido, el Centro Educativo Vida forma alumnos con sentido de la existencia, vocación de servicio y alegría de vivir."
    }
  },
  {
    id: "cmpq2u8dp00w2rn5q5swadjmf",
    name: "Colegio Boneo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario con los niveles inicial, primario y secundario. El Colegio Boneo lleva el nombre de una figura vinculada a la historia rosarina y ofrece una propuesta educativa con arraigo en la ciudad y compromiso con la formación integral. Reconocido en la comunidad rosarina por su trayectoria y por el trabajo cercano entre docentes y familias en cada etapa de la escolaridad."
    }
  },
  {
    id: "cmpq2u8no011vrn5qxvtohxuy",
    name: "Colegio Cristo Rey",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Rosario bajo la advocación de Cristo Rey, fiesta que cierra el año litúrgico y celebra el señorío universal de Jesucristo. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la fe cristiana con una formación académica sólida. Su espiritualidad regia y su compromiso con la excelencia forman alumnos con liderazgo, servicio y valores del evangelio."
    }
  },
  {
    id: "cmpq2u87v00sprn5qmq9t771d",
    name: "Colegio del Sol - Rosario",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario con los niveles inicial, primario y secundario. Su nombre, Del Sol, evoca la energía, la luz y la vitalidad como metáforas del aprendizaje. En una ciudad bañada por el Paraná y conocida por su vida cultural intensa, el Colegio del Sol propone una educación que ilumina el potencial de cada alumno con calidez, creatividad y rigor académico."
    }
  },
  {
    id: "cmpq2u8b900ujrn5qv8zepccy",
    name: "Colegio del Sur - Rosario",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario con los niveles inicial, primario y secundario, con arraigo en el sector sur de la ciudad. El Colegio del Sur ofrece una propuesta educativa integral orientada a la formación académica y personal de sus alumnos. Reconocido en su comunidad de referencia por el clima institucional cercano y el compromiso docente con cada familia."
    }
  },
  {
    id: "cmpq2u8ha00y7rn5qedxz03g6",
    name: "Colegio Edmondo De Amicis",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario que lleva el nombre del escritor italiano Edmondo De Amicis, autor de Corazón, el clásico de la literatura escolar del siglo XIX leído por generaciones de niños argentinos. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra la amistad, la solidaridad y el amor al conocimiento, valores que inspiran la obra más famosa de su patrono literario."
    }
  },
  {
    id: "cmpq2u8br00uurn5qseipzmyf",
    name: "Colegio Español de Rosario",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario con los niveles inicial, primario y secundario, fundada por la comunidad española de la ciudad. El Colegio Español celebra el vínculo histórico y cultural entre España y Rosario, ciudad que recibió miles de inmigrantes hispanos. Su propuesta integra la identidad hispanoamericana con una formación académica actualizada, en una ciudad que es capital cultural de la Argentina."
    }
  },
  {
    id: "cmpq2u8ry0147rn5qe20epyco",
    name: "Colegio Juan Díaz de Solís",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario que lleva el nombre del navegante español Juan Díaz de Solís, descubridor del Río de la Plata en 1516. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica el espíritu explorador y la valentía como valores formativos. En una ciudad ribereña como Rosario, su nombre evoca el vínculo histórico entre el Río Paraná y la historia de la Argentina."
    }
  },
  {
    id: "cmpq2u8f900wzrn5q5xei1qke",
    name: "Colegio La Salle Rosario",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de los Hermanos de las Escuelas Cristianas de Rosario, fundada bajo el carisma de San Juan Bautista de La Salle, patrono de los maestros. Ofrece los niveles inicial, primario y secundario con la pedagogía lasallana que privilegia la fe, el servicio y la excelencia académica. Con presencia en más de 80 países, La Salle Rosario es parte de una red educativa global con profundas raíces locales."
    }
  },
  {
    id: "cmpq2u8ih00ytrn5qnegsgfx5",
    name: "Colegio Los Arroyos",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario con los niveles inicial, primario y secundario. Su nombre evoca los arroyos que atraviesan el territorio santafesino, símbolo de la vida, el movimiento y la conexión con la naturaleza. El Colegio Los Arroyos ofrece una propuesta educativa que valora el entorno natural y la identidad territorial de la región pampeana, formando alumnos con arraigo y conciencia ambiental."
    }
  },
  {
    id: "cmpq2u88i00t0rn5q2zix2kzz",
    name: "Colegio María Auxiliadora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución salesiana femenina de Rosario dirigida por las Hijas de María Auxiliadora. Ofrece los niveles inicial, primario y secundario con la espiritualidad de Don Bosco y la devoción a María Auxiliadora como ejes de la vida escolar. Con décadas de presencia salesiana en Rosario, forma alumnas con sólida preparación académica, fe viva y compromiso con los valores del evangelio."
    }
  },
  {
    id: "cmpq2u8e700wdrn5qswj3q02z",
    name: "Colegio Marista Nuestra Señora del Rosario",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada marista de Rosario fundada bajo el carisma del Beato Marcelino Champagnat y la devoción a Nuestra Señora del Rosario, patrona de la ciudad. Ofrece los niveles inicial, primario y secundario con la pedagogía marista que forma personas de bien y buenos ciudadanos. En el corazón de la ciudad que lleva el nombre de la Virgen del Rosario, esta institución une fe, tradición y excelencia."
    }
  },
  {
    id: "cmpq2u8g800xlrn5q7gh6ggmj",
    name: "Colegio Mirasoles",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario con los niveles inicial, primario y secundario. Su nombre evoca al girasol, flor que siempre busca la luz, metáfora de una propuesta pedagógica orientada al crecimiento, la alegría y la esperanza. El Colegio Mirasoles forma alumnos que, como los girasoles, aprenden a orientarse hacia lo mejor de sí mismos y de su comunidad."
    }
  },
  {
    id: "cmpq2u89100tbrn5qg5itxgww",
    name: "Colegio Nuestra Señora de la Asunción",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Rosario bajo la advocación de Nuestra Señora de la Asunción. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la espiritualidad mariana y el misterio de la Asunción con una formación académica actualizada. Una institución valorada en la comunidad rosarina por su clima de fe y su compromiso con el desarrollo integral de cada alumno."
    }
  },
  {
    id: "cmpq2u8a500txrn5qpa6r6yd6",
    name: "Colegio Nuestra Señora del Huerto",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Rosario bajo la advocación de Nuestra Señora del Huerto. Ofrece los niveles inicial, primario y secundario con una propuesta que une la devoción mariana con una educación sólida y abierta al mundo. Su comunidad educativa valora el vínculo entre la fe, la naturaleza y el crecimiento personal, en consonancia con la imagen del huerto como espacio de cultivo y fruto."
    }
  },
  {
    id: "cmpq2u89k00tmrn5qzyovdswv",
    name: "Colegio Nuestra Señora de Luján Rosario",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Rosario bajo la advocación de Nuestra Señora de Luján, patrona de la Argentina. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la fe popular y la devoción a la Virgen de Luján con una formación académica de calidad. Una institución con identidad mariana y nacional arraigada en la comunidad educativa rosarina."
    }
  },
  {
    id: "cmpq2u8qd013crn5qek1bm335",
    name: "Colegio Nuestra Señora de la Misericordia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Rosario bajo la advocación de Nuestra Señora de la Misericordia. Ofrece los niveles inicial, primario y secundario con una espiritualidad centrada en la misericordia como actitud fundamental ante la vida. Su propuesta forma alumnos sensibles al sufrimiento ajeno, comprometidos con la justicia y capaces de construir vínculos desde la compasión y la generosidad."
    }
  },
  {
    id: "cmpq2u8cq00vgrn5q96gwzsmb",
    name: "Colegio Parque de España",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario con los niveles inicial, primario y secundario, cuyo nombre evoca el emblemático Parque de España a orillas del Paraná, símbolo del vínculo entre Rosario y la madre patria española. Su propuesta educativa celebra la herencia hispana en la cultura argentina y forma alumnos con identidad iberoamericana, apertura al mundo y arraigo en la rica historia rosarina."
    }
  },
  {
    id: "cmpq2u8si014irn5qalz0o6i5",
    name: "Colegio Pedro J. Cristiá",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario que lleva el nombre de Pedro J. Cristiá, figura vinculada a la historia educativa de la ciudad. Ofrece los niveles inicial, primario y secundario con una propuesta que honra la memoria de su fundador a través de una educación comprometida con la calidad, el servicio y el desarrollo integral de cada alumno en la comunidad rosarina."
    }
  },
  {
    id: "cmpq2u8iy00z4rn5qmyngemiy",
    name: "Colegio Rosario",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario con los niveles inicial, primario y secundario. El Colegio Rosario lleva con orgullo el nombre de la ciudad que lo alberga, una de las más dinámicas y culturalmente ricas de la Argentina. Su propuesta educativa está profundamente ligada a la identidad rosarina: su historia, su espíritu industrial y comercial, y su vocación por la cultura y las artes."
    }
  },
  {
    id: "cmpq2u8fr00xarn5qczz3g3ze",
    name: "Colegio Sagrado Corazón de Rosario",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Rosario bajo la advocación del Sagrado Corazón de Jesús. Ofrece los niveles inicial, primario y secundario con una espiritualidad centrada en el amor de Cristo como motor de la comunidad escolar. Con larga tradición en la ciudad, es una referencia de la educación católica rosarina, valorada por las familias por su clima espiritual y su propuesta formativa integral."
    }
  },
  {
    id: "cmpq2u8l6010crn5qh5abhjlf",
    name: "Colegio San Bartolomé",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario bajo el patronazgo de San Bartolomé, apóstol de Jesucristo. Ofrece los niveles inicial, primario y secundario con una propuesta que combina la fe cristiana con una formación académica actualizada. Con presencia en la ciudad y una comunidad educativa comprometida, el Colegio San Bartolomé es una institución con historia y arraigo en el sistema educativo rosarino."
    }
  },
  {
    id: "cmpq2u8jg00zfrn5qgvxamsk8",
    name: "Colegio San Bartolomé - Sede Fisherton",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Sede del Colegio San Bartolomé en el barrio Fisherton de Rosario, zona residencial del noroeste de la ciudad conocida por sus colegios bilingües y su perfil anglosajón. Ofrece los niveles inicial, primario y secundario con la misma propuesta educativa de la sede central, adaptada al contexto y la comunidad del barrio Fisherton."
    }
  },
  {
    id: "cmpq2u8o70126rn5qotshgdl6",
    name: "Colegio San Miguel Garicoits",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario que lleva el nombre de San Miguel Garicoits, fundador de los Sacerdotes del Sagrado Corazón de Jesús (Betharramitas). Ofrece los niveles inicial, primario y secundario con la espiritualidad betharramita centrada en la docilidad a la voluntad de Dios. Una institución con identidad espiritual marcada que forma alumnos con vida interior sólida y entrega generosa."
    }
  },
  {
    id: "cmpq2u8m7010yrn5qgirad1ud",
    name: "Colegio Santísimo Rosario",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Rosario bajo la advocación del Santísimo Rosario de la Virgen María, devoción que da nombre a la propia ciudad. Ofrece los niveles inicial, primario y secundario con una propuesta que hace de la oración del Rosario un eje de la espiritualidad escolar. En la ciudad que lleva su nombre, esta institución celebra la devoción mariana como parte de la identidad local."
    }
  },
  {
    id: "cmpq2u8gs00xwrn5qqs6jalj2",
    name: "Complejo Educativo Brigadier López",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa de Rosario que lleva el nombre del Brigadier Estanislao López, el Patriarca de la Federación y gobernador de Santa Fe en la época de la organización nacional. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica la figura de López como defensor de la autonomía provincial y los valores federales que dieron forma a la Argentina."
    }
  },
  {
    id: "cmpq2u8n6011krn5qkopu3cp9",
    name: "Complejo Educativo de Alberdi",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa de Rosario con los niveles inicial, primario y secundario, con arraigo en el barrio de Alberdi, uno de los más históricos y populares de la ciudad. Su nombre honra al barrio que recuerda al jurista Juan Bautista Alberdi, autor de las bases constitucionales argentinas. Una institución con identidad barrial y compromiso con la comunidad del oeste rosarino."
    }
  },
  {
    id: "cmpq2u8re013wrn5qle8bycea",
    name: "Complejo Educativo Leloir",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa de Rosario que lleva el nombre del bioquímico argentino Luis Federico Leloir, Premio Nobel de Química 1970. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica la ciencia y la investigación como valores centrales de la educación. En una ciudad con fuerte vocación universitaria, el Complejo Leloir inspira a sus alumnos con el ejemplo del mayor científico argentino."
    }
  },
  {
    id: "cmpq2u8d700vrrn5qxo7jw6nk",
    name: "Escuela Goethe Rosario",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario que lleva el nombre del poeta y pensador alemán Johann Wolfgang von Goethe, figura cumbre de la cultura universal. Ofrece los niveles inicial, primario y secundario con una propuesta bilingüe español-alemán que conecta a sus alumnos con la cultura germanoparlante. Parte de la red de escuelas Goethe en Argentina, forma alumnos con certificaciones internacionales de alemán y una mirada cosmopolita."
    }
  },
  {
    id: "cmpq2u8k000zqrn5q2najexfi",
    name: "Escuela Nuestra Señora de Guadalupe",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Rosario bajo la advocación de Nuestra Señora de Guadalupe, la Virgen Morena que se apareció al indio Juan Diego en México y es patrona de América. Ofrece los niveles inicial, primario y secundario con una espiritualidad guadalupana que celebra la identidad latinoamericana y el mestizaje cultural como riqueza. Una institución con profunda raíz americana en el corazón de Rosario."
    }
  },
  {
    id: "cmpq2u8lo010nrn5q6l9fdzfj",
    name: "Escuela Particular N°1376 San Antonio",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description:
        "Institución privada de Rosario bajo el patronazgo de San Antonio de Padua, doctor de la Iglesia y patrono de los pobres. Ofrece los niveles inicial y primario con una propuesta que integra la devoción a San Antonio con una educación primaria de calidad. Su carisma franciscano se traduce en un ambiente escolar sencillo, cercano y comprometido con las familias de la comunidad rosarina."
    }
  },
  {
    id: "cmpq2u8pu0131rn5qggldarj4",
    name: "Instituto de Inglés Saint Paul's Fisherton",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto bilingüe privado de Rosario ubicado en el barrio Fisherton, zona históricamente asociada a la comunidad anglófona de la ciudad. Ofrece los niveles inicial, primario y secundario con una propuesta de educación en inglés con estándares internacionales. Saint Paul's Fisherton prepara a sus alumnos para certificaciones Cambridge y para desenvolverse con fluidez en el mundo de habla inglesa."
    }
  },
  {
    id: "cmpq2u8ap00u8rn5qnhilzwc0",
    name: "Instituto de la Sagrada Familia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Rosario bajo la advocación de la Sagrada Familia de Nazaret. Ofrece los niveles inicial, primario y secundario con una propuesta que toma a la familia de Jesús, María y José como modelo de vida comunitaria, trabajo y amor. Su espiritualidad familiar se traduce en una educación que involucra activamente a las familias como primeras educadoras de sus hijos."
    }
  },
  {
    id: "cmpq2u8er00worn5qksvselnd",
    name: "Instituto Superior General San Martín",
    payload: {
      levels: ["SUPERIOR"],
      description:
        "Instituto de educación superior privado de Rosario que lleva el nombre del Libertador General José de San Martín. Ofrece carreras terciarias con orientación pedagógica y profesional, formando docentes y técnicos para el mercado laboral santafesino. Su nombre evoca el legado del Libertador como modelo de servicio, sacrificio y entrega a una causa que trasciende el interés personal."
    }
  },
  {
    id: "cmpq2u8pa012qrn5q1bxplffr",
    name: "Instituto Zona Oeste",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Rosario con los niveles inicial, primario y secundario, con arraigo en la zona oeste de la ciudad. El Instituto Zona Oeste ofrece una propuesta educativa integral orientada a las familias del sector occidental rosarino, combinando calidad académica con cercanía comunitaria. Una institución comprometida con el desarrollo de su barrio y con la formación de sus alumnos como ciudadanos activos."
    }
  },
  {
    id: "cmpq2u8hw00yirn5q1wtw6spt",
    name: "JICE | Jardín de Infantes Colegio Español",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes privado de Rosario perteneciente al Colegio Español, institución fundada por la comunidad hispana de la ciudad. Atiende niños de 2 a 5 años con una propuesta de nivel inicial que integra la herencia cultural española con el juego, la creatividad y el desarrollo afectivo en la primera infancia. Un espacio cálido donde los más pequeños descubren la alegría de aprender en un ambiente de raíz ibérica."
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

console.log(`\n🏫  Curando ${updates.length} colegios de Rosario...\n`);

for (const { id, name, payload } of updates) {
  await patchSchool(id, name, payload);
}

console.log("\n✨  Listo.\n");
