/**
 * Curación de colegios de Corrientes
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-corrientes.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY.");
  process.exit(1);
}

const updates = [
  {
    id: "cmpq34qnm04ajrn5qxad92vu4",
    name: "Colegio Bilingüe Saint Patrick",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe privada de Corrientes con los niveles inicial, primario y secundario, bajo el patronazgo de San Patricio, apóstol de Irlanda. Su propuesta de inmersión en inglés combina los estándares internacionales con la identidad cultural correntina, formando alumnos bilingües capaces de desenvolverse en el mundo globalizado. Una referencia del bilingüismo en el nordeste argentino."
    }
  },
  {
    id: "cmpq34qtf04dwrn5qkve4dwqa",
    name: "Colegio Del Sagrado Corazón",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Corrientes bajo la advocación del Sagrado Corazón de Jesús. Ofrece los niveles inicial, primario y secundario con una espiritualidad centrada en el amor misericordioso de Cristo como motor de la comunidad escolar. Con larga tradición en la ciudad, es una referencia de la educación católica correntina valorada por las familias por su clima espiritual y su propuesta formativa integral."
    }
  },
  {
    id: "cmpq34qm2049mrn5q0w4hff55",
    name: "Colegio Informático San Juan de Vera",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes que lleva el nombre del fundador de la ciudad, Juan de Vera y Aragón. Ofrece los niveles inicial, primario y secundario con un perfil tecnológico e informático diferenciado, preparando alumnos con competencias digitales para los desafíos del siglo XXI. En una ciudad con creciente ecosistema tecnológico, forma ciudadanos con dominio de las herramientas de la era digital."
    }
  },
  {
    id: "cmpq34qvv04f4rn5qf49hykl6",
    name: "Colegio Instituto San José",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Corrientes bajo el patronazgo de San José. Ofrece los niveles inicial, primario y secundario con una propuesta que toma a San José como modelo del trabajo honrado, la paternidad responsable y la entrega silenciosa. Con historia en la ciudad, es una referencia de la educación católica correntina valorada por su clima cálido y su compromiso con cada alumno."
    }
  },
  {
    id: "cmpq34qyw04gyrn5qsliabs6a",
    name: "Colegio John Kennedy",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes que lleva el nombre del presidente estadounidense John F. Kennedy, símbolo de la visión, el liderazgo y el compromiso con la democracia y el bien común. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia la formación ciudadana, el pensamiento crítico y los valores democráticos. Una institución que inspira a sus alumnos a preguntar qué pueden hacer por su comunidad."
    }
  },
  {
    id: "cmpq34qxa04g1rn5q0a3zoh33",
    name: "Colegio Nacional General San Martín",
    payload: {
      levels: ["SECUNDARIA"],
      description: "Institución de educación secundaria de Corrientes que lleva el nombre del Libertador General José de San Martín. Ofrece el bachillerato con una propuesta que reivindica los valores sanmartinianos de sacrificio, patria y libertad. Una institución con historia en la ciudad que forma ciudadanos con conciencia histórica, orgullo nacional y preparación sólida para la continuidad universitaria."
    }
  },
  {
    id: "cmpq34qre04corn5qigr0alil",
    name: "Colegio Privado Católico del Santísimo Sacramento",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Corrientes bajo la advocación del Santísimo Sacramento, misterio eucarístico central de la fe cristiana. Ofrece los niveles inicial, primario y secundario con una espiritualidad eucarística que pone la presencia de Cristo en la Eucaristía como centro de la vida escolar. Una institución que forma alumnos con profundidad espiritual, amor a la liturgia y compromiso con el prójimo."
    }
  },
  {
    id: "cmpq34r1g04ihrn5q62f2xz89",
    name: "Colegio Privado Centro de Estudios V.C.",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes con los niveles inicial, primario y secundario. El Centro de Estudios V.C. ofrece una propuesta educativa integral orientada al desarrollo académico y personal de sus alumnos. Con arraigo en la comunidad correntina, es una institución reconocida por su clima institucional cercano y por el compromiso de sus docentes con la formación de cada estudiante."
    }
  },
  {
    id: "cmpq34qsz04dlrn5qy06b5g2x",
    name: "Colegio Privado Nuestra Señora de Itatí",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Corrientes bajo la advocación de Nuestra Señora de Itatí, patrona de Corrientes y del nordeste argentino. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra la devoción más profunda de la identidad correntina. En una ciudad donde la Virgen de Itatí es parte del alma popular, esta institución forma alumnos con arraigo espiritual y cultural profundo."
    }
  },
  {
    id: "cmpq34r1w04isrn5q0hzzoy0k",
    name: "Colegio Salesiano",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución salesiana de Corrientes fundada bajo el carisma de San Juan Bosco. Ofrece los niveles inicial, primario y secundario con el sistema preventivo salesiano basado en razón, religión y amor. Con presencia histórica en el nordeste argentino, el Colegio Salesiano correntino forma jóvenes con fe, preparación académica y vocación de servicio a la comunidad litoraleña."
    }
  },
  {
    id: "cmpq34qk0048ern5qb9s1bl2o",
    name: "Colegio Santa Ana",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Corrientes bajo el patronazgo de Santa Ana, madre de la Virgen María y abuela de Jesús. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra la sabiduría, la paternidad y el amor familiar que representa Santa Ana. Una institución con calidez materna y compromiso educativo, valorada por las familias correntinas por su ambiente acogedor."
    }
  },
  {
    id: "cmpq34qvd04etrn5qgupmfzpa",
    name: "Colegio Santa Teresita",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada carmelita de Corrientes bajo el patronazgo de Santa Teresita del Niño Jesús, Doctora de la Iglesia y patrona de las misiones. Ofrece los niveles inicial, primario y secundario con la espiritualidad teresiana del camino pequeño, centrada en el amor sencillo y la entrega en los actos cotidianos. Una institución que forma alumnos con profundidad espiritual y ternura humana."
    }
  },
  {
    id: "cmpq34qxu04gcrn5q5zdqgqm7",
    name: "Colegio Secundario Dr. Eloy Miguel Ortega",
    payload: {
      levels: ["SECUNDARIA"],
      description: "Institución de educación secundaria privada de Corrientes que lleva el nombre del Dr. Eloy Miguel Ortega, figura relevante de la historia educativa y cultural de la provincia. Ofrece el bachillerato con una propuesta que honra la memoria de su patrono a través de una educación comprometida con la calidad, la ciudadanía y la identidad correntina."
    }
  },
  {
    id: "cmpq34qqc04c2rn5qzpaaqy8d",
    name: "Colegio Secundario Privado VC",
    payload: {
      levels: ["SECUNDARIA"],
      description: "Institución de educación secundaria privada de Corrientes. Ofrece el bachillerato con una propuesta orientada al ingreso universitario y la formación integral del adolescente. Con arraigo en la comunidad correntina, es una institución reconocida por su clima institucional y el compromiso de sus docentes con el desarrollo académico y personal de cada estudiante."
    }
  },
  {
    id: "cmpq34qjg0483rn5qpesjpq8t",
    name: "Colegio Yapeyú",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes que lleva el nombre de Yapeyú, la misión guaraní donde nació el Libertador José de San Martín. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra la historia y la identidad del nordeste argentino. En tierra de misiones y guaraníes, el Colegio Yapeyú forma alumnos con arraigo cultural, conciencia histórica y orgullo por sus raíces litoraleñas."
    }
  },
  {
    id: "cmpq34qsj04darn5qf4n9vfc0",
    name: "Colegio Yapeyú Campo de Deportes",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Sede deportiva del Colegio Yapeyú de Corrientes, con los niveles inicial, primario y secundario. Comparte la identidad y propuesta pedagógica del Yapeyú con un énfasis especial en la actividad física, el deporte y el desarrollo de la salud integral. Una opción para las familias correntinas que valoran la educación física como componente central del desarrollo humano."
    }
  },
  {
    id: "cmpq34qmo049xrn5qauydxodf",
    name: "Escuela Privada Taragüí",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes con los niveles inicial, primario y secundario. Su nombre, Taragüí —nombre guaraní de la provincia de Corrientes—, celebra la identidad cultural e histórica del nordeste argentino. La Escuela Taragüí forma alumnos con arraigo en la cultura litoraleña, amor por el chamamé, el río y la identidad guaraní que da nombre y alma a la provincia."
    }
  },
  {
    id: "cmpq34qtz04e7rn5qfl9jkxit",
    name: "Escuela Técnica Fray Luis Beltrán",
    payload: {
      levels: ["SECUNDARIA"],
      description: "Institución de educación secundaria técnica de Corrientes que lleva el nombre del Fray Luis Beltrán, sacerdote franciscano que fue artillero de San Martín y héroe de la independencia argentina. Ofrece formación técnica especializada que prepara a los egresados tanto para el ingreso universitario como para el mercado laboral. Su perfil técnico responde a las necesidades productivas del nordeste argentino."
    }
  },
  {
    id: "cmpq34qyc04gnrn5qg3vxger4",
    name: "Escuela Técnica Juana Manso",
    payload: {
      levels: ["SECUNDARIA"],
      description: "Institución de educación secundaria técnica de Corrientes que lleva el nombre de Juana Manso, escritora, educadora y pionera del feminismo argentino del siglo XIX. Ofrece formación técnica especializada con una perspectiva de género e inclusión que honra el legado de una de las mujeres más importantes de la historia educativa argentina. Una institución que forma técnicos comprometidos con la igualdad."
    }
  },
  {
    id: "cmpq34qwd04ffrn5qs8275lsw",
    name: "Instituto Adventista de Corrientes",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución educativa adventista de Corrientes perteneciente a la Iglesia Adventista del Séptimo Día. Ofrece los niveles inicial, primario y secundario con una propuesta que integra formación académica, valores bíblicos y estilo de vida saludable. Con presencia global en más de 150 países, la educación adventista en Corrientes ofrece una alternativa integral orientada al desarrollo holístico de la persona en el litoral argentino."
    }
  },
  {
    id: "cmpq34qzf04h9rn5qrz05892i",
    name: "Instituto de Enseñanza Privada Amanecer",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes con los niveles inicial, primario y secundario. Su nombre, Amanecer, evoca el comienzo de cada día como una nueva oportunidad de aprendizaje y crecimiento. El Instituto Amanecer forma alumnos con optimismo, resiliencia y motivación, valores especialmente significativos en una provincia con rica identidad cultural y espíritu festivo."
    }
  },
  {
    id: "cmpq34qhu0476rn5qipodwmx2",
    name: "Instituto de Enseñanza Privada Amanecer - Jardín Maternal",
    payload: {
      levels: ["INICIAL"],
      description: "Jardín maternal y de infantes privado de Corrientes perteneciente al Instituto Amanecer. Atiende niños desde los primeros meses hasta los 5 años con una propuesta de estimulación temprana, vínculo afectivo seguro y desarrollo integral en la primera infancia. Un espacio cálido donde los más pequeños correntinos dan sus primeros pasos escolares en un ambiente amoroso y estimulante."
    }
  },
  {
    id: "cmpq34qo204aurn5q8g7bd18x",
    name: "Instituto de Enseñanza Privada CREA",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes con los niveles inicial, primario y secundario. Su nombre, CREA, evoca la creatividad como valor pedagógico central. El Instituto CREA ofrece una propuesta que privilegia la imaginación, la innovación y el pensamiento divergente como herramientas del aprendizaje, formando alumnos con capacidad creativa para resolver los desafíos de una sociedad en permanente transformación."
    }
  },
  {
    id: "cmpq34qn404a8rn5qhoolxmdr",
    name: "Instituto de Enseñanza Privada Mahatma Gandhi",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes que lleva el nombre del líder espiritual y político indio Mahatma Gandhi, símbolo de la no violencia, la resistencia pacífica y la búsqueda de la verdad. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia la paz, el diálogo y la resolución no violenta de conflictos como pilares formativos. Una institución que inspira a sus alumnos con el ejemplo del más grande líder pacifista de la historia."
    }
  },
  {
    id: "cmpq34r0f04hvrn5qy32b62e7",
    name: "Instituto de Enseñanza Privada Yapeyú",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes con los niveles inicial, primario y secundario, que lleva el nombre de la histórica misión guaraní donde nació San Martín. Ofrece una propuesta educativa que celebra la identidad litoraleña y la herencia guaraní de la región, formando alumnos con arraigo cultural, conciencia histórica y preparación académica para los desafíos del siglo XXI."
    }
  },
  {
    id: "cmpq34qwu04fqrn5q6d74w8mh",
    name: "Instituto Monseñor R. Roubineau",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Corrientes que lleva el nombre del Monseñor Roubineau, figura pastoral relevante de la diócesis correntina. Ofrece los niveles inicial, primario y secundario con una propuesta que honra la memoria de su patrono a través de una educación comprometida con la fe, la comunidad y la formación integral. Una institución con identidad diocesana en el corazón del nordeste argentino."
    }
  },
  {
    id: "cmpq34quq04eirn5qm6bec64l",
    name: "Instituto Nuevo Horizonte",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes con los niveles inicial, primario y secundario. Su nombre, Nuevo Horizonte, evoca la apertura al futuro, la esperanza y las posibilidades que se abren ante cada alumno. El Instituto forma estudiantes con visión de largo plazo, optimismo fundado y capacidad de soñar en grande, valores especialmente valiosos en una provincia que mira al Paraná y al mundo."
    }
  },
  {
    id: "cmpq34qkh048prn5qol5mrtk1",
    name: "Instituto Privado Amanecer",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes con los niveles inicial, primario y secundario. El Instituto Privado Amanecer ofrece una propuesta educativa integral con arraigo en la comunidad correntina. Con compromiso docente y un clima institucional cálido, forma alumnos con valores sólidos y preparación académica para continuar su trayectoria educativa y profesional en el nordeste argentino."
    }
  },
  {
    id: "cmpq34r0x04i6rn5q7z5qq1ae",
    name: "Instituto Privado Católico Nuestra Señora de Itatí",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Corrientes bajo la advocación de Nuestra Señora de Itatí, la Virgen patrona de la provincia. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción mariana más profunda de la identidad correntina con una formación académica actualizada. En la tierra de la Virgen de Itatí, esta institución forma alumnos con fe popular, arraigo y compromiso comunitario."
    }
  },
  {
    id: "cmpq34qih047hrn5qenqioowc",
    name: "Instituto Privado Kid's School",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "Institución privada de Corrientes con los niveles inicial y primario. Kid's School ofrece una propuesta pedagógica centrada en los primeros años de escolaridad con fuerte componente en inglés y un ambiente lúdico y estimulante. Una opción para las familias correntinas que buscan una educación bilingüe desde la primera infancia con acompañamiento personalizado y calidez humana."
    }
  },
  {
    id: "cmpq34qlm049brn5q7hkbihqr",
    name: "Instituto Privado Kinder World School",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "Institución privada de Corrientes con los niveles inicial y primario. Kinder World School ofrece una propuesta bilingüe orientada a los primeros años de escolaridad, formando niños con bases sólidas en inglés y español desde la primera infancia. Su nombre refleja una visión global del aprendizaje que conecta a los más pequeños correntinos con el mundo desde sus primeros años escolares."
    }
  },
  {
    id: "cmpq34qpv04brrn5q8tqa2nki",
    name: "Instituto Privado Nueva Escuela",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes con los niveles inicial, primario y secundario. El Instituto Privado Nueva Escuela propone una pedagogía renovada y actualizada, comprometida con las demandas del siglo XXI. Su nombre refleja una visión de la educación como práctica en permanente renovación, formando alumnos preparados para los desafíos de una sociedad en constante transformación."
    }
  },
  {
    id: "cmpq34qom04b5rn5qwmybhrn6",
    name: "Instituto Privado Nueva Generación",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes con los niveles inicial, primario y secundario. El Instituto Privado Nueva Generación forma a los jóvenes correntinos con las competencias y valores que demanda el mundo actual. Su nombre refleja el compromiso con las generaciones que heredarán y transformarán la realidad social, económica y cultural del nordeste argentino."
    }
  },
  {
    id: "cmpq34qzx04hkrn5qlo1goj1r",
    name: "Instituto Privado Real Sociedad",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes con los niveles inicial, primario y secundario. El Instituto Privado Real Sociedad ofrece una propuesta educativa integral con arraigo en la comunidad correntina. Con clima institucional cálido y compromiso docente, forma alumnos con valores cívicos, preparación académica y sentido de pertenencia a una comunidad educativa comprometida con el desarrollo de la provincia."
    }
  },
  {
    id: "cmpq34ql60490rn5qvwqq2za1",
    name: "Instituto Privado San Benito",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada benedictina de Corrientes bajo el patronazgo de San Benito de Nursia, padre del monacato occidental y patrón de Europa. Ofrece los niveles inicial, primario y secundario con la espiritualidad benedictina centrada en la oración y el trabajo —ora et labora— como ejes de la vida escolar. Una institución que forma alumnos con disciplina, interioridad y amor por el conocimiento."
    }
  },
  {
    id: "cmpq34qpd04bgrn5qdnlp02rm",
    name: "Instituto Saint Martin",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe privada de Corrientes con los niveles inicial, primario y secundario. Instituto Saint Martin ofrece una propuesta de educación en inglés con estándares internacionales, formando alumnos bilingües con competencias globales en el corazón del nordeste argentino. Su nombre evoca la tradición educativa anglosajona y su compromiso con la excelencia lingüística y académica."
    }
  },
  {
    id: "cmpq34qqw04cdrn5qcefwwmqg",
    name: "Instituto Superior Nuestra Señora de la Misericordia",
    payload: {
      levels: ["SUPERIOR"],
      description: "Instituto de educación superior privado de Corrientes bajo la advocación de Nuestra Señora de la Misericordia. Ofrece carreras terciarias con orientación pedagógica y profesional desde una perspectiva de fe y servicio. En el nordeste argentino, forma docentes y profesionales con sólida base académica, sensibilidad social y compromiso con el desarrollo de la región correntina."
    }
  },
  {
    id: "cmpq34qry04czrn5qpb9ol3j7",
    name: "Instituto Superior San José",
    payload: {
      levels: ["SUPERIOR"],
      description: "Instituto de educación superior privado de Corrientes bajo el patronazgo de San José. Ofrece carreras terciarias con orientación pedagógica y profesional, formando docentes y técnicos para el mercado laboral del nordeste argentino. Con el carisma josefino del trabajo honrado y la entrega silenciosa, forma profesionales comprometidos con la calidad educativa y el desarrollo de la provincia."
    }
  },
  {
    id: "cmpq34qhc046vrn5q158ilp9f",
    name: "Mecenas Colegio Privado",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Corrientes con los niveles inicial, primario y secundario. Su nombre evoca a Mecenas, el célebre protector de las artes en la Roma antigua, símbolo del apoyo a la cultura y la creatividad. El Colegio Mecenas propone una educación que privilegia las artes, la cultura y el pensamiento creativo como dimensiones fundamentales del desarrollo humano en la vibrante Corrientes."
    }
  },
  {
    id: "cmpq34qj0047srn5qjvc8p8r2",
    name: "United World School",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe privada de Corrientes con los niveles inicial, primario y secundario. United World School propone una educación internacional con estándares globales, formando alumnos con perspectiva mundial y competencias para integrarse en un mundo interconectado. Una propuesta educativa diferenciada en el nordeste argentino para familias con vocación global y movilidad internacional."
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

console.log(`\n🏫  Curando ${updates.length} colegios de Corrientes...\n`);

for (const { id, name, payload } of updates) {
  await patchSchool(id, name, payload);
}

console.log("\n✨  Listo.\n");
