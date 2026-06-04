/**
 * Curación de colegios de Córdoba
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-cordoba.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY.");
  process.exit(1);
}

const updates = [
  {
    id: "cmpq2syf900n6rn5q6zmilcsz",
    name: "Academia Argüello",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Córdoba ubicada en el barrio Argüello, zona residencial del noroeste de la ciudad. Ofrece los niveles inicial, primario y secundario con una propuesta educativa integral orientada a la excelencia académica y el desarrollo personal. Una institución reconocida en la comunidad cordobesa del noroeste por su clima institucional y su compromiso con cada alumno a lo largo de toda la trayectoria escolar."
    }
  },
  {
    id: "cmpq2syby00l1rn5qn96waxs1",
    name: "Castelfranco Escuela Paritaria Ítalo-Argentina",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada ítalo-argentina de Córdoba que celebra el vínculo histórico entre Italia y la Argentina, dos culturas profundamente entrelazadas en la identidad cordobesa. Ofrece los niveles inicial, primario y secundario con una propuesta bilingüe español-italiano que honra la herencia de los miles de inmigrantes italianos que construyeron la Córdoba moderna. Una escuela con identidad transatlántica y raíces profundas en la comunidad ítalo-cordobesa."
    }
  },
  {
    id: "cmpq2sy7600hzrn5qlq0kupsj",
    name: "Centro Educacional San Jorge",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Córdoba bajo el patronazgo de San Jorge, mártir y patrono de Inglaterra y de numerosas comunidades en el mundo. Ofrece los niveles inicial, primario y secundario con una propuesta que combina la fe cristiana con una formación académica actualizada. Con presencia en la comunidad cordobesa, es una institución reconocida por su clima cálido y su vocación por el desarrollo integral del alumno."
    }
  },
  {
    id: "cmpq2sy8600ilrn5qw6vfsigr",
    name: "Centro Educativo Cristo Rey",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Córdoba bajo la advocación de Cristo Rey. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la fe cristiana y el señorío de Cristo con una formación académica de calidad. Su espiritualidad regia forma alumnos con liderazgo, servicio y valores evangélicos, en una ciudad con profunda tradición católica como Córdoba."
    }
  },
  {
    id: "cmpq2sy4t00ggrn5q55dyt7nu",
    name: "Centro Educativo Santo Domingo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada dominica de Córdoba bajo el patronazgo de Santo Domingo de Guzmán, fundador de la Orden de Predicadores. Ofrece los niveles inicial, primario y secundario con la tradición intelectual dominicana que privilegia el estudio, la contemplación y la predicación de la verdad. En una ciudad universitaria como Córdoba, la espiritualidad dominicana alimenta una propuesta de excelencia académica y vida de fe."
    }
  },
  {
    id: "cmpq2sy8m00iwrn5qhp9qmez7",
    name: "Colegio Alemán Córdoba",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución bilingüe español-alemán de Córdoba con los niveles inicial, primario y secundario, fundada por la comunidad germanoparlante de la ciudad. El Colegio Alemán prepara a sus alumnos para las certificaciones del sistema educativo alemán y ofrece una formación internacional con estándares de excelencia reconocidos globalmente. Una institución con más de un siglo de historia en Córdoba y vínculos directos con el sistema educativo de Alemania."
    }
  },
  {
    id: "cmpq2syde00lyrn5qdyoscq4z",
    name: "Colegio Corazón de María",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Córdoba bajo la advocación del Corazón de María, espiritualidad misionera propia de los Claretianos. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción al Corazón Inmaculado de María con una formación académica sólida. Con tradición claretiana en Córdoba, es una institución reconocida por su clima espiritual y su compromiso con la evangelización."
    }
  },
  {
    id: "cmpq2symt00rrrn5qkid5jwwp",
    name: "Colegio de la Inmaculada",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada jesuita de Córdoba, una de las más prestigiosas y antiguas de la provincia. Fundado por la Compañía de Jesús, el Colegio de la Inmaculada ofrece los niveles inicial, primario y secundario con la pedagogía ignaciana que forma personas para los demás. Con siglos de historia en la ciudad de la Reforma Universitaria, es un referente indiscutible de la educación jesuita en Argentina."
    }
  },
  {
    id: "cmpq2syjc00pmrn5qi8o5dl7m",
    name: "Colegio de la Sagrada Familia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Córdoba bajo la advocación de la Sagrada Familia de Nazaret. Ofrece los niveles inicial, primario y secundario con una propuesta que toma a Jesús, María y José como modelo de vida comunitaria, trabajo y amor. Su espiritualidad familiar se traduce en una educación que involucra activamente a las familias y forma alumnos con valores sólidos y sentido de pertenencia."
    }
  },
  {
    id: "cmpq2syns00sdrn5qierv25wh",
    name: "Colegio del Carmen",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada carmelita de Córdoba bajo la advocación de Nuestra Señora del Carmen. Ofrece los niveles inicial, primario y secundario con la espiritualidad carmelitana centrada en la oración, la interioridad y el amor a María. Con la tradición contemplativa del Carmelo como inspiración, forma alumnos con profundidad espiritual, solidez académica y capacidad de silencio y reflexión en un mundo acelerado."
    }
  },
  {
    id: "cmpq2syee00mkrn5qwn5srvq8",
    name: "Colegio de María",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Córdoba bajo la advocación de la Virgen María. Ofrece los niveles inicial, primario y secundario con una propuesta que pone a María como modelo de escucha, disponibilidad y amor. Con arraigo en la comunidad cordobesa, es una institución valorada por su clima espiritual, el acompañamiento personalizado y el trabajo conjunto entre familias y docentes."
    }
  },
  {
    id: "cmpq2sybi00kqrn5qgxrm1cam",
    name: "Colegio de San José - Hnas. Dominicas",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada dominica de Córdoba dirigida por las Hermanas Dominicas, bajo el patronazgo de San José. Ofrece los niveles inicial, primario y secundario con la tradición intelectual y apostólica de la Orden de Predicadores, orientada a la búsqueda de la verdad y la contemplación. Una institución con doble carisma dominico y josefino que forma alumnos con rigor intelectual y vida espiritual auténtica."
    }
  },
  {
    id: "cmpq2sykt00qjrn5qc4683m3x",
    name: "Colegio e Instituto Nuestra Señora de Loreto",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Córdoba bajo la advocación de Nuestra Señora de Loreto, patrona de la aviación y de los peregrinos. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción lauretana con una formación académica actualizada. Con historia en la comunidad cordobesa, es una institución reconocida por su clima de fe y su compromiso con la formación integral."
    }
  },
  {
    id: "cmpq2syb200kfrn5qip82sts5",
    name: "Colegio Jesús María",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Córdoba con los niveles inicial, primario y secundario. Su nombre une a Jesús y María como corazón de la propuesta educativa, reflejando una espiritualidad centrada en el amor de Cristo y la mediación de su Madre. Una institución con arraigo en la comunidad cordobesa que forma alumnos con fe viva, sólida preparación académica y valores del humanismo cristiano."
    }
  },
  {
    id: "cmpq2sycg00lcrn5qkvkrd5jc",
    name: "Colegio Jockey Club Córdoba",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Córdoba vinculada al Jockey Club, con los niveles inicial, primario y secundario. El Colegio Jockey Club ofrece una propuesta educativa de excelencia con fuerte componente deportivo y formación integral, en consonancia con los valores del club que lo sostiene. Una institución con identidad cordobesa propia, valorada por las familias que buscan educación de calidad con tradición y espíritu de superación."
    }
  },
  {
    id: "cmpq2sycz00lnrn5qf6v1ipa1",
    name: "Colegio Maestro Diehl - Niños Músicos de Córdoba",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Córdoba con una propuesta educativa singular que integra la música como eje pedagógico transversal. El Colegio Maestro Diehl - Niños Músicos de Córdoba ofrece los niveles inicial, primario y secundario con un currículo que desarrolla las capacidades musicales de cada alumno junto con la formación académica tradicional. Una propuesta única en la ciudad para familias que valoran la educación artística."
    }
  },
  {
    id: "cmpq2syit00pbrn5qc86w2h22",
    name: "Colegio Mark Twain",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución bilingüe privada de Córdoba que lleva el nombre del escritor estadounidense Mark Twain, autor de Las aventuras de Tom Sawyer y símbolo del humor, la libertad y la imaginación. Ofrece los niveles inicial, primario y secundario con una propuesta de inmersión en inglés que celebra la literatura y la creatividad como herramientas del aprendizaje. Una institución que forma alumnos con fluidez lingüística y espíritu aventurero."
    }
  },
  {
    id: "cmpq2sy5r00h2rn5qp4s8dxl3",
    name: "Colegio Nacional de Monserrat - U.N.C.",
    payload: {
      levels: ["SECUNDARIA"],
      description:
        "Uno de los colegios secundarios más prestigiosos y antiguos de la Argentina, dependiente de la Universidad Nacional de Córdoba. Fundado en 1687 por los jesuitas, el Monserrat es el colegio secundario más antiguo del país en actividad continua. Su ingreso selectivo, su cuerpo docente universitario y su historia de más de tres siglos lo convierten en un símbolo de la educación argentina y en la institución de referencia de la secundaria cordobesa."
    }
  },
  {
    id: "cmpq2syhs00oprn5qvu45e476",
    name: "Colegio Nuestra Señora de la Merced",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada mercedaria de Córdoba bajo la advocación de Nuestra Señora de la Merced, patrona de la ciudad y de la provincia. Ofrece los niveles inicial, primario y secundario con la espiritualidad mercedaria orientada a la liberación, el servicio y la entrega por los demás. En el corazón de Córdoba, esta institución celebra a la patrona de la ciudad como modelo de generosidad y compromiso."
    }
  },
  {
    id: "cmpq2sygc00nsrn5qtj1kodrd",
    name: "Colegio Nuestra Señora del Huerto",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Córdoba bajo la advocación de Nuestra Señora del Huerto. Ofrece los niveles inicial, primario y secundario con una propuesta que une la devoción mariana con una educación de calidad en la capital mediterránea. Su imagen del huerto como espacio de cultivo paciente refleja una pedagogía que cuida el crecimiento de cada alumno con atención, amor y constancia."
    }
  },
  {
    id: "cmpq2symc00rgrn5qpcy4e7u4",
    name: "Colegio Sagrado Corazón",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Córdoba bajo la advocación del Sagrado Corazón de Jesús. Ofrece los niveles inicial, primario y secundario con una espiritualidad centrada en el amor misericordioso de Cristo como eje de la vida escolar. Con larga trayectoria en la ciudad, es una de las referencias de la educación católica cordobesa, valorada por las familias por su clima espiritual y su propuesta formativa integral."
    }
  },
  {
    id: "cmpq2sya400jtrn5qr16v74qu",
    name: "Colegio San José",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Córdoba bajo el patronazgo de San José, padre adoptivo de Jesús y modelo del trabajo, la familia y la entrega silenciosa. Ofrece los niveles inicial, primario y secundario con una propuesta que combina la espiritualidad josefina con una formación académica actualizada. Con décadas de historia en la ciudad, es una de las instituciones católicas más reconocidas del sistema educativo cordobés."
    }
  },
  {
    id: "cmpq2sy9500j7rn5q6lpz6q2w",
    name: "Colegio San Pedro Apóstol",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Córdoba bajo el patronazgo de San Pedro Apóstol, primer papa y fundador de la Iglesia. Ofrece los niveles inicial, primario y secundario con una propuesta que toma la figura de Pedro —la roca sobre la que se construye— como metáfora de una educación sólida y con fundamentos. Una institución con identidad apostólica y vocación de servicio en la comunidad cordobesa."
    }
  },
  {
    id: "cmpq2syi800p0rn5qvfogmkpv",
    name: "Colegio Syria Poletti",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Córdoba que lleva el nombre de Syria Poletti, escritora ítalo-argentina radicada en la Argentina, autora de obras para adultos y niños reconocidas en toda América Latina. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia la literatura, la narración y la imaginación como herramientas pedagógicas centrales. Una institución con alma literaria en el corazón de Córdoba."
    }
  },
  {
    id: "cmpq2syh900oern5qhq1yrakx",
    name: "Escuela Dante Alighieri - Ítalo Argentina",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución bilingüe ítalo-argentina de Córdoba que lleva el nombre del poeta florentino Dante Alighieri. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra el vínculo cultural entre Italia y Argentina, dos naciones unidas por la historia de la migración. Sus alumnos aprenden español e italiano y se forman en la rica herencia humanística y literaria de la civilización italiana."
    }
  },
  {
    id: "cmpq2sy5a00grrn5qcyu05ieo",
    name: "Escuelas Pías de Córdoba",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de los Padres Escolapios de Córdoba, fundada bajo el carisma de San José de Calasanz, el primer maestro de escuela popular de la historia. Ofrece los niveles inicial, primario y secundario con la pedagogía calasancia que privilegia la educación de los más pobres como acto de piedad y justicia. Con presencia histórica en Córdoba, las Escuelas Pías son una referencia de la educación cristiana en Argentina."
    }
  },
  {
    id: "cmpq2syet00mvrn5qacv27d9b",
    name: "Instituto Católico Superior - INCASUP",
    payload: {
      levels: ["SUPERIOR"],
      description:
        "Instituto de educación superior privado católico de Córdoba. El INCASUP ofrece carreras terciarias con orientación pedagógica y profesional desde una perspectiva de fe y compromiso social. En una ciudad con fuerte tradición universitaria como Córdoba, el INCASUP forma profesionales y docentes con sólida base académica, valores católicos y vocación de servicio a la comunidad."
    }
  },
  {
    id: "cmpq2sydx00m9rn5q14zmgmqg",
    name: "Instituto de Educación Córdoba",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Córdoba con los niveles inicial, primario y secundario. El Instituto de Educación Córdoba lleva el nombre de la ciudad como señal de arraigo e identidad local, ofreciendo una propuesta educativa actualizada y orientada a la excelencia. En la capital mediterránea de Argentina, esta institución forma alumnos con el perfil que demanda la dinámica cultural, industrial y universitaria de Córdoba."
    }
  },
  {
    id: "cmpq2sy6800hdrn5q7j4pyafp",
    name: "Instituto del Inmaculado Corazón de María - Adoratrices",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de las Esclavas del Santísimo Sacramento y de la Caridad (Adoratrices) en Córdoba, bajo la advocación del Inmaculado Corazón de María. Ofrece los niveles inicial, primario y secundario con una espiritualidad eucarística y mariana que pone la adoración y el servicio como pilares de la vida escolar. Una institución con carisma propio y presencia consolidada en la comunidad educativa cordobesa."
    }
  },
  {
    id: "cmpq2sykc00q8rn5q7dpnubom",
    name: "Instituto Juvenilia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Córdoba cuyo nombre evoca la novela autobiográfica Juvenilia de Miguel Cané, clásico de la literatura argentina que narra la vida estudiantil del siglo XIX. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia la cultura humanística, la literatura y la formación ciudadana. Una institución con identidad literaria y vocación por el pensamiento crítico en la ciudad de la Reforma."
    }
  },
  {
    id: "cmpq2syju00pxrn5qf1gjbzgr",
    name: "Instituto Nuestra Madre de la Merced",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada mercedaria de Córdoba bajo la advocación de Nuestra Madre de la Merced, patrona de la provincia. Ofrece los niveles inicial, primario y secundario con el carisma mercedario orientado a la liberación, la entrega y el amor incondicional. En la capital provincial que lleva el nombre de la Virgen de la Merced, esta institución celebra la devoción local con una educación comprometida y de calidad."
    }
  },
  {
    id: "cmpq2sygs00o3rn5quz9gmcic",
    name: "Instituto Nuestra Señora del Sagrado Corazón",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Córdoba bajo la doble advocación de Nuestra Señora y el Sagrado Corazón de Jesús. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción mariana y la espiritualidad del Corazón de Cristo como ejes complementarios de la formación. Una institución con identidad espiritual sólida y compromiso con el desarrollo integral del alumno cordobés."
    }
  },
  {
    id: "cmpq2sy9l00jirn5qd2wpnlp5",
    name: "Instituto Nuestra Señora de Nieva",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Córdoba bajo la advocación de Nuestra Señora de Nieva. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción mariana con una formación académica actualizada. Con arraigo en la comunidad cordobesa, es una institución valorada por su clima espiritual, el acompañamiento familiar y el compromiso de sus docentes con cada alumno."
    }
  },
  {
    id: "cmpq2sylu00r5rn5qtduvbbap",
    name: "Instituto Privado de Enseñanza San Agustín",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada agustiniana de Córdoba bajo el patronazgo de San Agustín de Hipona, Doctor de la Iglesia y uno de los grandes intelectuales de la historia del pensamiento. Ofrece los niveles inicial, primario y secundario con la tradición agustiniana que privilegia la búsqueda de la verdad y la interioridad. En Córdoba, ciudad de intensa vida intelectual, el carisma agustiniano alimenta una propuesta de excelencia y profundidad."
    }
  },
  {
    id: "cmpq2sy7p00iarn5qtpsr10j0",
    name: "Instituto Privado Jean Piaget",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Córdoba que lleva el nombre del psicólogo y epistemólogo suizo Jean Piaget, padre del constructivismo y referente fundamental de la pedagogía del siglo XX. Ofrece los niveles inicial, primario y secundario con una propuesta inspirada en la psicología del desarrollo que pone al alumno como constructor activo de su propio conocimiento. Una institución con identidad pedagógica científica en la capital universitaria argentina."
    }
  },
  {
    id: "cmpq2syl900qurn5qrg07kwjb",
    name: "Instituto Privado Labat",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Córdoba con los niveles inicial, primario y secundario. El Instituto Privado Labat lleva el nombre de su fundador y ofrece una propuesta educativa con historia y arraigo en la comunidad cordobesa. Con décadas de trayectoria, es una institución reconocida por las familias por su compromiso con la calidad educativa, la formación en valores y el acompañamiento personalizado de cada alumno."
    }
  },
  {
    id: "cmpq2sy6p00horn5q9qpaa2id",
    name: "Instituto Privado Mixto San Agustín",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada agustiniana mixta de Córdoba bajo el patronazgo de San Agustín. Ofrece los niveles inicial, primario y secundario en un modelo de educación mixta que celebra la diversidad y la complementariedad. Con el pensamiento agustiniano —inquieto hasta encontrar en Dios su descanso— como inspiración, forma alumnos con curiosidad intelectual, apertura al otro y búsqueda auténtica de sentido."
    }
  },
  {
    id: "cmpq2syfq00nhrn5qpxvdnn47",
    name: "Instituto Salesiano Pío X",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución salesiana de Córdoba que lleva el nombre del Papa Pío X, pontífice de la comunión frecuente y la renovación litúrgica de comienzos del siglo XX. Ofrece los niveles inicial, primario y secundario con el sistema preventivo de Don Bosco basado en razón, religión y amor. Con presencia salesiana consolidada en Córdoba, forma jóvenes con fe, preparación académica y vocación de servicio."
    }
  },
  {
    id: "cmpq2syal00k4rn5qp9r6ua31",
    name: "Instituto Santa Ana",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Córdoba bajo el patronazgo de Santa Ana, madre de la Virgen María y abuela de Jesús. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra la sabiduría, la paciencia y el amor familiar que representa Santa Ana. Una institución con identidad maternal y calor comunitario, valorada por las familias cordobesas por su clima acogedor y su compromiso educativo."
    }
  },
  {
    id: "cmpq2syna00s2rn5qjw6pfcin",
    name: "San Isidro Colegio Privado",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Córdoba bajo el patronazgo de San Isidro Labrador, patrono de los agricultores y de la ciudad de Buenos Aires. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra el trabajo, la sencillez y la fe como valores fundantes. Una institución con arraigo en la comunidad cordobesa que forma alumnos con vocación de servicio, amor a la tierra y compromiso con su entorno."
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

console.log(`\n🏫  Curando ${updates.length} colegios de Córdoba...\n`);

for (const { id, name, payload } of updates) {
  await patchSchool(id, name, payload);
}

console.log("\n✨  Listo.\n");
