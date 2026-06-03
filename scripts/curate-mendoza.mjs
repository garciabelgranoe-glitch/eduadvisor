/**
 * Curación de colegios de Mendoza
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-mendoza.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY.");
  process.exit(1);
}

const updates = [
  {
    id: "cmpq2viuf01emrn5qf080hddc",
    name: "Colegio Alberto Schweitzer",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico de Mendoza que lleva el nombre del médico y humanista Albert Schweitzer. Ofrece los niveles inicial, primario y secundario con una propuesta pedagógica orientada al pensamiento crítico, la solidaridad y la formación ciudadana. Su proyecto educativo integra valores humanistas con una enseñanza académica sólida, en un entorno que promueve el respeto por la diversidad."
    }
  },
  {
    id: "cmpq2vigc016orn5qb01l7uce",
    name: "Colegio Andino",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico de Mendoza con los niveles inicial, primario y secundario. Su nombre evoca la identidad cordillerana de la región y su propuesta educativa apunta al desarrollo integral del alumno con sólida formación académica, actividades deportivas y vínculo con el entorno natural mendocino. Valorado por las familias por el equilibrio entre exigencia y acompañamiento."
    }
  },
  {
    id: "cmpq2vika018trn5qnw5qj6wp",
    name: "Colegio Bilingüe Los Olivos",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada bilingüe de Mendoza con fuerte énfasis en la enseñanza del inglés desde los primeros años. Ofrece los niveles inicial, primario y secundario con un modelo de inmersión lingüística que permite a los alumnos alcanzar fluidez real. Su propuesta combina el currículo oficial con metodologías activas y una mirada internacional que prepara a los egresados para un mundo globalizado."
    }
  },
  {
    id: "cmpq2viom01b9rn5q72jt73db",
    name: "Colegio Bilingüe Portezuelo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado bilingüe ubicado en la zona de Portezuelo, Mendoza. Integra la enseñanza intensiva del inglés en todos los niveles —inicial, primario y secundario— con una propuesta pedagógica que privilegia el pensamiento crítico, la creatividad y las competencias digitales. Una opción diferenciada para familias que priorizan el bilingüismo en un entorno con identidad mendocina."
    }
  },
  {
    id: "cmpq2viq101c6rn5qrvkujbsr",
    name: "Colegio Compañía de María",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa católica de Mendoza perteneciente a la Compañía de María (La Enseñanza), congregación fundada en Francia en el siglo XVII con vocación educativa. Ofrece los niveles inicial, primario y secundario con una propuesta que integra excelencia académica y formación en valores evangélicos. Con más de 300 años de tradición educativa a nivel global, es una de las instituciones más reconocidas de Mendoza."
    }
  },
  {
    id: "cmpq2viww01g5rn5qqm9cik2o",
    name: "Colegio Congreso",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado laico de Mendoza con los tres niveles educativos. Su propuesta pedagógica se orienta a la formación de ciudadanos críticos y participativos, con énfasis en las ciencias sociales, la expresión y el trabajo en valores democráticos. Reconocido en el medio mendocino por su clima institucional abierto y por el compromiso de su equipo docente con el desarrollo integral de cada alumno."
    }
  },
  {
    id: "cmpq2vixf01ggrn5qypxu670i",
    name: "Colegio de la Universidad del Aconcagua",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado dependiente de la Universidad del Aconcagua, una de las instituciones universitarias más importantes de Mendoza. Ofrece los niveles primario y secundario con una propuesta educativa que articula con la formación universitaria, preparando a los alumnos para el ingreso a estudios superiores. El vínculo con la universidad garantiza actualización pedagógica permanente y recursos académicos de primer nivel."
    }
  },
  {
    id: "cmpq2vimc01a1rn5qrmi9qz3s",
    name: "Colegio Don Bosco Mendoza N°1",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa salesiana de Mendoza fundada bajo el carisma de San Juan Bosco. Ofrece los niveles inicial, primario y secundario con una propuesta que integra razón, religión y amor como pilares formativos. El sistema preventivo salesiano, basado en la presencia activa del educador y el acompañamiento afectivo, es el sello distintivo de esta institución con décadas de historia en la provincia."
    }
  },
  {
    id: "cmpq2vivg01f8rn5qcnjyack6",
    name: "Colegio Español",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio de la comunidad española de Mendoza con larga trayectoria en la provincia. Ofrece los niveles inicial, primario y secundario con una propuesta educativa que preserva el vínculo con la cultura española a la vez que se integra plenamente al sistema educativo argentino. Su comunidad activa de familias y egresados refleja el arraigo de esta institución en el tejido social mendocino."
    }
  },
  {
    id: "cmpq2vip401bkrn5qd806j0sy",
    name: "Colegio Fénix",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Mendoza con los niveles inicial, primario y secundario. Su nombre evoca la capacidad de transformación y superación permanente, valores que se traducen en una propuesta pedagógica orientada al desarrollo de la resiliencia, la autonomía y las competencias del siglo XXI. Valorado por su ambiente inclusivo y por el acompañamiento personalizado que brinda a cada alumno."
    }
  },
  {
    id: "cmpq2vilv019qrn5q01rpl9a9",
    name: "Colegio ICEI",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de educación integral de Mendoza con los niveles inicial, primario y secundario. Su propuesta pedagógica combina una sólida formación académica con el desarrollo de competencias socioemocionales y habilidades prácticas. Reconocido por su enfoque integral y por el trabajo colaborativo entre docentes, alumnos y familias en la construcción del proyecto educativo institucional."
    }
  },
  {
    id: "cmpq2vid80155rn5qfzh4f3u8",
    name: "Colegio María Auxiliadora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución salesiana femenina de Mendoza fundada bajo la advocación de María Auxiliadora. Dirigida por las Hijas de María Auxiliadora (FMA), ofrece los niveles inicial, primario y secundario con el sistema preventivo salesiano como eje de la formación. Su propuesta combina exigencia académica con formación espiritual, artística y humana, en una comunidad educativa con más de un siglo de presencia en Argentina."
    }
  },
  {
    id: "cmpq2vijs018irn5qnfzvxkqh",
    name: "Colegio María Reina",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Mendoza bajo la advocación de María Reina. Ofrece los niveles inicial, primario y secundario con una formación que integra rigor académico y valores del humanismo cristiano. Su comunidad educativa se caracteriza por el vínculo cercano entre docentes, familias y alumnos, y por una propuesta que prepara a los egresados tanto para los estudios superiores como para la vida."
    }
  },
  {
    id: "cmpq2vidr015grn5qn8e9zinh",
    name: "Colegio Norbridge",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Mendoza con enfoque anglosajón. Ofrece los niveles inicial, primario y secundario con un programa de inmersión en inglés que garantiza una formación bilingüe genuina. Su propuesta pedagógica incorpora metodologías activas, tecnología educativa y un currículo internacionalizado que prepara a los alumnos para desenvolverse con fluidez en contextos globales."
    }
  },
  {
    id: "cmpq2vin101acrn5qs7hocsi7",
    name: "Colegio Ntra. Sra. de la Misericordia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Mendoza bajo la advocación de Nuestra Señora de la Misericordia. Ofrece los niveles inicial, primario y secundario con una propuesta formativa que integra la fe cristiana con una sólida educación académica. Su proyecto institucional prioriza el acompañamiento espiritual, el desarrollo de valores y la formación de personas comprometidas con el bien común."
    }
  },
  {
    id: "cmpq2vilc019frn5quypkd2qv",
    name: "Colegio Nuestra Señora de la Consolata",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado católico de Mendoza de la congregación de los Misioneros de la Consolata. Ofrece los niveles inicial, primario y secundario con una propuesta que une formación académica sólida con espiritualidad misionera y compromiso social. Su identidad consolata se traduce en una educación abierta a la diversidad, orientada a formar personas con vocación de servicio."
    }
  },
  {
    id: "cmpq2viro01d3rn5qnajerjq0",
    name: "Colegio Padre Claret",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa claretiana de Mendoza que lleva el nombre de San Antonio María Claret, fundador de los Misioneros Claretianos. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la misión evangelizadora con la formación académica integral. Su espiritualidad claretiana se traduce en un estilo educativo cercano, fraterno y orientado al servicio de los más necesitados."
    }
  },
  {
    id: "cmpq2vijc0187rn5qlmcg9xn8",
    name: "Colegio Privado San Gabriel",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado católico de Mendoza bajo la advocación del Arcángel San Gabriel. Ofrece los niveles inicial, primario y secundario con una formación que conjuga excelencia académica y valores espirituales. Su propuesta pedagógica promueve el pensamiento crítico, la creatividad y el sentido de responsabilidad social, formando alumnos preparados para los desafíos del mundo contemporáneo."
    }
  },
  {
    id: "cmpq2vikt0194rn5qs6nx05d9",
    name: "Colegio PS-161 Clave de Sol",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description:
        "Colegio privado de Mendoza con énfasis en la educación artística y musical desde los primeros años. Su nombre, Clave de Sol, refleja una propuesta pedagógica que integra la música como eje transversal del aprendizaje, estimulando la creatividad, la expresión y el desarrollo cognitivo de los niños. Una opción diferenciada para familias que valoran la formación artística como parte esencial de la educación."
    }
  },
  {
    id: "cmpq2viib017lrn5qdfm7x3bp",
    name: "Colegio Rainbow",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio bilingüe privado de Mendoza orientado a la enseñanza del inglés desde los primeros años. Su nombre, Rainbow (arco iris), refleja una propuesta inclusiva y diversa que busca preparar a los alumnos para un mundo multicultural. Ofrece los niveles inicial, primario y secundario con metodologías activas y un enfoque comunicativo que privilegia la fluidez oral en inglés desde la primera infancia."
    }
  },
  {
    id: "cmpq2vie8015rrn5qkoidda1m",
    name: "Colegio San Andrés",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Mendoza con tradición en la comunidad mendocina. Ofrece los niveles inicial, primario y secundario con una propuesta educativa que combina formación académica sólida con desarrollo humano y valores. Reconocido por su comunidad activa y el fuerte compromiso de las familias con el proyecto institucional, el Colegio San Andrés es una referencia educativa en Mendoza."
    }
  },
  {
    id: "cmpq2vit701e0rn5quzq86ybn",
    name: "Colegio San Jorge",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada de Mendoza con los tres niveles educativos. Su propuesta pedagógica integra formación académica rigurosa con educación en valores, deportes y actividades culturales. El Colegio San Jorge se destaca por el clima institucional cálido y el seguimiento personalizado de cada alumno, aspectos valorados por una comunidad de familias comprometidas con el proyecto educativo."
    }
  },
  {
    id: "cmpq2viwe01furn5qi34o7022",
    name: "Colegio San José de Calasanz",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa escolapia de Mendoza fundada bajo el carisma de San José de Calasanz, el primer educador que ofreció educación gratuita a los niños pobres en el siglo XVII. Los Padres Escolapios conducen una propuesta que integra rigor académico, formación en valores y acompañamiento espiritual. Con siglos de tradición educativa a nivel mundial, esta institución es una de las más históricas de Mendoza."
    }
  },
  {
    id: "cmpq2vicn014urn5qace26v4z",
    name: "Colegio San José Hermanos Maristas",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución marista de Mendoza fundada por los Hermanos Maristas de la Enseñanza, congregación fundada por Marcelino Champagnat en Francia en 1817. Ofrece los niveles inicial, primario y secundario con el espíritu marista que combina excelencia pedagógica, sencillez, amor al trabajo y presencia activa entre los jóvenes. Una institución de referencia en Mendoza con décadas de historia educativa."
    }
  },
  {
    id: "cmpq2vipl01bvrn5qqlxdlpsi",
    name: "Colegio San Luis Gonzaga",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Mendoza bajo la advocación de San Luis Gonzaga, patrono de la juventud. Ofrece los niveles inicial, primario y secundario con una propuesta que articula formación académica, espiritualidad y compromiso social. Su modelo educativo privilegia el acompañamiento personal, el desarrollo de la conciencia moral y la preparación de jóvenes comprometidos con su comunidad."
    }
  },
  {
    id: "cmpq2vis401dern5qny9e3eop",
    name: "Colegio San Nicolás",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado católico de Mendoza bajo la advocación de San Nicolás. Ofrece los tres niveles educativos —inicial, primario y secundario— con una propuesta que integra la tradición católica con metodologías pedagógicas actuales. Su ambiente familiar y el trabajo cercano entre docentes y familias son aspectos valorados por la comunidad educativa mendocina."
    }
  },
  {
    id: "cmpq2vir601csrn5qeir33xg2",
    name: "Colegio Santa Teresita de Lisieux",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución privada católica de Mendoza consagrada a Santa Teresita de Lisieux, Doctora de la Iglesia y patrona de las misiones. Ofrece los niveles inicial, primario y secundario con una espiritualidad carmelita que se traduce en sencillez, amor y atención a los pequeños detalles cotidianos. Su propuesta pedagógica forma alumnos con sensibilidad humana, conciencia espiritual y sólida preparación académica."
    }
  },
  {
    id: "cmpq2vini01anrn5qzokd231s",
    name: "Colegio Santo Tomás de Aquino",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución dominicana de Mendoza bajo el patronazgo de Santo Tomás de Aquino, patrono de los estudiantes y Doctor de la Iglesia. Ofrece los niveles inicial, primario y secundario con una propuesta pedagógica que integra la tradición intelectual dominicana con las necesidades educativas contemporáneas. El rigor académico, el amor a la verdad y la formación humanística son los pilares de este proyecto educativo."
    }
  },
  {
    id: "cmpq2vifo016drn5qmedsy8xv",
    name: "Colegio Stroberi",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description:
        "Colegio privado de Mendoza con una propuesta educativa innovadora para los niveles inicial y primario. Su nombre refleja una identidad fresca y creativa, con metodologías activas que priorizan el aprendizaje lúdico, la curiosidad y la exploración en los primeros años. Valorado por las familias mendocinas por su ambiente cálido y personalizado."
    }
  },
  {
    id: "cmpq2vivx01fjrn5qt4vb02cg",
    name: "Colegio Tomás Alva Edison",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Mendoza que lleva el nombre del inventor norteamericano Tomás Alva Edison. Ofrece los niveles inicial, primario y secundario con una propuesta orientada a la innovación, el pensamiento científico y la creatividad tecnológica. Su perfil STEM, con énfasis en ciencias, tecnología y robótica, prepara a los alumnos para los desafíos del mundo contemporáneo desde una perspectiva práctica y experimental."
    }
  },
  {
    id: "cmpq2viux01exrn5q6e22f7p4",
    name: "Colegio Universitario Santa María",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description:
        "Colegio privado de Mendoza vinculado a la Universidad Santa María, que ofrece los niveles primario y secundario con una propuesta pedagógica que articula con la formación de nivel superior. Su perfil universitario garantiza actualización curricular permanente y prepara a los alumnos para el ingreso a estudios superiores con sólidos fundamentos académicos y habilidades investigativas."
    }
  },
  {
    id: "cmpq2vism01dprn5qo4i5gjuk",
    name: "Escuela Israelita Max Nordau",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa de la comunidad judía de Mendoza, fundada en honor de Max Nordau, pensador y co-fundador del sionismo. Ofrece los niveles inicial, primario y secundario integrando el currículo oficial con la enseñanza del hebreo, la historia y la cultura judía. Una de las instituciones más respetadas de la comunidad judía mendocina, con décadas de historia y un proyecto identitario sólido."
    }
  },
  {
    id: "cmpq2vihn017arn5qu32adh4n",
    name: "Escuela Italiana XXI de Abril",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Escuela de la comunidad italiana de Mendoza, fundada el 21 de abril en conmemoración de la fundación de Roma. Ofrece los niveles inicial, primario y secundario integrando el currículo argentino con la enseñanza del italiano, la cultura y las tradiciones de Italia. Una institución con profundo arraigo en la comunidad ítalo-mendocina que celebra el aporte de la inmigración italiana al desarrollo de la provincia."
    }
  },
  {
    id: "cmpq2viqj01chrn5q7ojaws8x",
    name: "Fundación Gutenberg Mendoza",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa de la Fundación Gutenberg en Mendoza, que lleva el nombre del inventor de la imprenta moderna. Ofrece los niveles primario y secundario con una propuesta pedagógica centrada en la lectura, la escritura y el pensamiento crítico como herramientas fundamentales del aprendizaje. Su identidad editorial se traduce en un proyecto educativo que privilegia la cultura letrada y el acceso al conocimiento."
    }
  },
  {
    id: "cmpq2vio301ayrn5q1yprt4l1",
    name: "IMEI - Instituto Maipú de Educación Integral",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de educación integral ubicado en Maipú, departamento del Gran Mendoza reconocido por su producción vitivinícola. Ofrece los niveles inicial, primario y secundario con una propuesta que articula formación académica sólida con el desarrollo de competencias integrales. Su ubicación en Maipú lo convierte en la referencia educativa privada de ese departamento para las familias que buscan calidad educativa cerca de sus hogares."
    }
  },
  {
    id: "cmpq2viit017wrn5qo0mnpfv7",
    name: "Instituto Adventista Mendoza",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa adventista de Mendoza perteneciente a la Iglesia Adventista del Séptimo Día. Ofrece los niveles inicial, primario y secundario con una propuesta que integra formación académica, valores bíblicos y un estilo de vida saludable como parte del proyecto educativo. Con presencia global en más de 150 países, la red adventista ofrece una educación holística orientada al desarrollo integral de la persona."
    }
  },
  {
    id: "cmpq2vitv01ebrn5qb7qv8tuw",
    name: "Instituto Nadino",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Instituto privado de Mendoza con los niveles inicial, primario y secundario. Su propuesta pedagógica combina formación académica con desarrollo humano y atención personalizada. Reconocido en el medio mendocino por el compromiso docente y el acompañamiento cercano a las familias a lo largo de toda la trayectoria escolar de los alumnos."
    }
  },
  {
    id: "cmpq2view0162rn5qhscdkupg",
    name: "Instituto San Pedro Nolasco",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description:
        "Institución educativa mercedaria de Mendoza bajo el patronazgo de San Pedro Nolasco, fundador de la Orden de la Merced. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la espiritualidad mercedaria —centrada en la libertad y el servicio— con una sólida formación académica. Una institución con presencia histórica en Mendoza y compromiso con la formación integral de sus alumnos."
    }
  },
  {
    id: "cmpq2vigt016zrn5q1kvxmcqr",
    name: "Instituto Superior Humberto de Paolis",
    payload: {
      levels: ["SUPERIOR"],
      description:
        "Instituto de educación superior privado de Mendoza que lleva el nombre del pedagogo Humberto de Paolis. Ofrece carreras de nivel terciario orientadas a la formación docente y profesional, con una propuesta académica que combina teoría y práctica en el marco de los estándares del sistema educativo provincial. Una opción reconocida en Mendoza para quienes buscan formación de nivel superior con identidad mendocina."
    }
  },
  {
    id: "cmpq2vixx01grrn5qqa0o3r2j",
    name: "Jardín Platero",
    payload: {
      levels: ["INICIAL"],
      description:
        "Jardín de infantes privado de Mendoza que toma su nombre del entrañable burro del poeta Juan Ramón Jiménez, símbolo de ternura y sencillez. Orientado a niños de 2 a 5 años, ofrece un ambiente cálido y estimulante donde el juego, la literatura y la exploración son los ejes del aprendizaje. Reconocido por las familias mendocinas por la calidad afectiva de su propuesta y la dedicación de su equipo docente."
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

console.log(`\n🏫  Curando ${updates.length} colegios de Mendoza...\n`);

for (const { id, name, payload } of updates) {
  await patchSchool(id, name, payload);
}

console.log("\n✨  Listo.\n");
