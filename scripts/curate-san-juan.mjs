/**
 * Curación de colegios de San Juan
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-san-juan.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY.");
  process.exit(1);
}

const updates = [
  {
    id: "cmpq31u6i0398rn5q1nivxw1h",
    name: "Colegio Bilingüe Saint Louis",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe privada de San Juan que lleva el nombre del rey francés San Luis IX, símbolo de la justicia y el servicio. Ofrece los niveles inicial, primario y secundario con una propuesta de inmersión en inglés y estándares internacionales. Una referencia del bilingüismo en la provincia sanjuanina, forma alumnos con fluidez lingüística y competencias para desenvolverse en el mundo globalizado."
    }
  },
  {
    id: "cmpq31ugs03fcrn5qr7sbqsug",
    name: "Colegio Central Universitario Mariano Moreno UNSJ",
    payload: {
      levels: ["SECUNDARIA"],
      description: "Institución de educación secundaria dependiente de la Universidad Nacional de San Juan, que lleva el nombre del prócer Mariano Moreno. Uno de los colegios universitarios más prestigiosos de la provincia, ofrece el bachillerato con rigor académico universitario y vocación por la formación de ciudadanos críticos y comprometidos. Sus egresados cuentan con una preparación sólida para el ingreso a la UNSJ y otras universidades nacionales."
    }
  },
  {
    id: "cmpq31u3w0380rn5qcmj2j345",
    name: "Colegio Divina Misericordia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de San Juan bajo la advocación de la Divina Misericordia, devoción promovida por Santa Faustina Kowalska. Ofrece los niveles inicial, primario y secundario con una espiritualidad centrada en el amor misericordioso de Dios como eje de la vida escolar. Una institución que forma alumnos con sensibilidad espiritual, compasión y compromiso con los valores del evangelio en la provincia cuyera."
    }
  },
  {
    id: "cmpq31u3e037prn5qsmkagk0b",
    name: "Colegio Don Bosco San Juan",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución salesiana de San Juan fundada bajo el carisma de San Juan Bosco. Ofrece los niveles inicial, primario y secundario con el sistema preventivo salesiano basado en razón, religión y amor. Con presencia histórica en la provincia, el Don Bosco sanjuanino es una referencia de la educación católica en Cuyo, valorado por las familias por su clima fraterno y su compromiso con la juventud."
    }
  },
  {
    id: "cmpq31u1r036srn5qe0rjawnd",
    name: "Colegio Dr. Houssay",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan que lleva el nombre del Dr. Bernardo Houssay, Premio Nobel de Fisiología y Medicina 1947 y primer latinoamericano en recibir el Nobel científico. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia las ciencias, la investigación y el pensamiento experimental. Una institución que inspira a sus alumnos con el ejemplo del mayor científico argentino."
    }
  },
  {
    id: "cmpq31u5y038xrn5q4v2yxkl5",
    name: "Colegio e Instituto Superior San Nicolás de Bari",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA", "SUPERIOR"],
      description: "Institución privada católica de San Juan bajo el patronazgo de San Nicolás de Bari, patrono de los niños y símbolo de la generosidad. Ofrece los niveles inicial, primario, secundario y superior con una trayectoria educativa completa bajo el mismo techo institucional. Su continuidad pedagógica y su propuesta integral la convierten en una de las instituciones más completas del sistema educativo sanjuanino."
    }
  },
  {
    id: "cmpq31u7v03a5rn5q0b2nyo3j",
    name: "Colegio El Seibo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan con los niveles inicial, primario y secundario. Su nombre evoca al ceibo, flor nacional argentina, símbolo de identidad y arraigo en la tierra argentina. El Colegio El Seibo ofrece una propuesta pedagógica que celebra la identidad nacional y la cultura regional, formando alumnos con sentido de pertenencia, valores cívicos y preparación académica sólida."
    }
  },
  {
    id: "cmpq31uhc03fnrn5qe945z2da",
    name: "Colegio El Tránsito de Nuestra Señora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de San Juan bajo la advocación de El Tránsito de Nuestra Señora, misterio mariano que celebra el paso de María a la vida eterna. Ofrece los niveles inicial, primario y secundario con una espiritualidad mariana profunda y una formación académica actualizada. Una institución con arraigo en la devoción popular sanjuanina y compromiso con la formación integral de sus alumnos."
    }
  },
  {
    id: "cmpq31ua103bdrn5q8t3zbibs",
    name: "Colegio Inglés Bilingüe Primario",
    payload: {
      levels: ["PRIMARIA"],
      description: "Institución de educación primaria bilingüe privada de San Juan. Ofrece la educación primaria completa con inmersión en inglés desde primer grado, sentando las bases para una trayectoria bilingüe sólida. Una propuesta especializada en el nivel primario que forma niños con competencias lingüísticas en inglés y español desde los años fundamentales de la escolaridad."
    }
  },
  {
    id: "cmpq31ucp03cwrn5q8o2zifxc",
    name: "Colegio La Inmaculada",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de San Juan bajo la advocación de la Inmaculada Concepción de la Virgen María. Ofrece los niveles inicial, primario y secundario con una propuesta que combina la devoción mariana con una formación académica sólida. Con historia en la provincia, es una de las instituciones católicas más reconocidas del sistema educativo sanjuanino, valorada por su clima espiritual y su excelencia."
    }
  },
  {
    id: "cmpq31u2c0373rn5qqsdnkcpc",
    name: "Colegio Los Andes",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan cuyo nombre evoca la majestuosidad de la cordillera de los Andes que domina el horizonte de la provincia. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra la identidad andina y la cultura cuyera. Forma alumnos con arraigo territorial, amor por la naturaleza y preparación académica para los desafíos del siglo XXI."
    }
  },
  {
    id: "cmpq31u9h03b2rn5qg9hofuna",
    name: "Colegio Los Olivos",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan con los niveles inicial, primario y secundario. Su nombre evoca los olivos, árbol símbolo de paz, sabiduría y prosperidad tan ligado a la cultura mediterránea que influyó en la región cuyera. El Colegio Los Olivos ofrece una propuesta educativa integral en un clima institucional cálido y comprometido con el desarrollo de cada alumno."
    }
  },
  {
    id: "cmpq31ul303hsrn5q9nmsjnzo",
    name: "Colegio María Auxiliadora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución salesiana femenina de San Juan dirigida por las Hijas de María Auxiliadora. Ofrece los niveles inicial, primario y secundario con la espiritualidad de Don Bosco y la devoción a María Auxiliadora como ejes formativos. Con presencia salesiana en la provincia, forma alumnas con sólida preparación académica, fe viva y apertura al mundo en el corazón de la provincia sanjuanina."
    }
  },
  {
    id: "cmpq31uj003gkrn5qfum8cjwm",
    name: "Colegio Mercedario",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada mercedaria de San Juan perteneciente a la Orden de la Merced. Ofrece los niveles inicial, primario y secundario con la espiritualidad mercedaria orientada a la liberación, el servicio y el amor incondicional. En San Juan, ciudad con profunda devoción mariana, el carisma mercedario inspira una educación comprometida con la dignidad humana y los valores del evangelio."
    }
  },
  {
    id: "cmpq31ugb03f1rn5q6q8dri8w",
    name: "Colegio Merceditas de San Martín CESAP",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan que lleva el nombre de Mercedes de San Martín, hija del Libertador José de San Martín, vinculada a la historia y el orgullo provincial. Ofrece los niveles inicial, primario y secundario con una propuesta que honra el legado sanmartiniano y los valores patrióticos. Una institución con identidad histórica arraigada en la comunidad sanjuanina."
    }
  },
  {
    id: "cmpq31ub303bzrn5qnju3iwwl",
    name: "Colegio Modelo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan con los niveles inicial, primario y secundario. El Colegio Modelo aspira a ser una referencia de excelencia educativa en la provincia, con una propuesta pedagógica actualizada y orientada al desarrollo integral del alumno. Reconocido en la comunidad sanjuanina por su clima institucional, la calidad de sus docentes y su compromiso con la formación de ciudadanos responsables."
    }
  },
  {
    id: "cmpq31uai03born5q8k12g5u9",
    name: "Colegio Nuestra Señora de la Medalla Milagrosa",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada vincentina de San Juan bajo la advocación de Nuestra Señora de la Medalla Milagrosa, aparecida a Santa Catalina Labouré en París. Ofrece los niveles inicial, primario y secundario con la espiritualidad mariana y el carisma vicentino del servicio a los pobres. Una institución que forma alumnos con devoción a la Virgen de la Medalla, generosidad y compromiso social."
    }
  },
  {
    id: "cmpq31u4f038brn5q7ts2ddrt",
    name: "Colegio Nuestra Señora de Luján",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de San Juan bajo la advocación de Nuestra Señora de Luján, patrona de la Argentina. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción a la Virgen de Luján con una formación académica de calidad. Una institución con identidad mariana y nacional, valorada por las familias sanjuaninas por su clima espiritual y su excelencia educativa."
    }
  },
  {
    id: "cmpq31ukf03hhrn5qd16mch5v",
    name: "Colegio Parroquial Pbro. Francisco Pérez Hernández",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución parroquial de San Juan que lleva el nombre del Pbro. Francisco Pérez Hernández, sacerdote vinculado a la historia de la diócesis sanjuanina. Ofrece los niveles inicial, primario y secundario con una propuesta de educación católica arraigada en la vida parroquial y comunitaria. Una institución que honra la memoria de su patrono con una educación comprometida con la fe y el servicio."
    }
  },
  {
    id: "cmpq31u2v037ern5q35ek2g8c",
    name: "Colegio San Bernardo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan bajo el patronazgo de San Bernardo de Claraval, Doctor de la Iglesia y fundador del Císter. Ofrece los niveles inicial, primario y secundario con una propuesta que recoge la espiritualidad contemplativa y el amor a la belleza que caracterizan al carisma cisterciense. Una institución que forma alumnos con vida interior, rigor intelectual y sensibilidad humana."
    }
  },
  {
    id: "cmpq31uc203clrn5qx4fx4c04",
    name: "Colegio San Francisco de Asís",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada franciscana de San Juan bajo el patronazgo de San Francisco de Asís. Ofrece los niveles inicial, primario y secundario con la espiritualidad franciscana centrada en el amor a la naturaleza, la pobreza evangélica y la fraternidad universal. Su propuesta forma alumnos con sensibilidad ecológica, espíritu de servicio y valores del humanismo cristiano franciscano."
    }
  },
  {
    id: "cmpq31u7g039urn5qlrpn3l2d",
    name: "Colegio San José",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de San Juan bajo el patronazgo de San José. Ofrece los niveles inicial, primario y secundario con una propuesta que toma a San José como modelo del trabajo silencioso, la paternidad responsable y la entrega sin condiciones. Con historia en la provincia, es una referencia de la educación católica sanjuanina valorada por su clima cálido y su compromiso formativo."
    }
  },
  {
    id: "cmpq31u0j0366rn5qj6nmqvxk",
    name: "Colegio San Juan Bautista",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan que lleva el nombre del patrono de la ciudad, San Juan Bautista, precursor de Jesucristo y figura central del calendario cristiano. Ofrece los niveles inicial, primario y secundario con una propuesta que honra al santo patrono provincial a través de una educación comprometida con la verdad, el anuncio y la preparación del camino hacia una vida plena."
    }
  },
  {
    id: "cmpq31u57038mrn5qvfr54eni",
    name: "Colegio San Pablo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan bajo el patronazgo del apóstol San Pablo, el gran misionero del cristianismo y autor de las cartas más influyentes del Nuevo Testamento. Ofrece los niveles inicial, primario y secundario con una espiritualidad paulina orientada al anuncio, la apertura al mundo y la transformación personal por el encuentro con Cristo."
    }
  },
  {
    id: "cmpq31ue603dtrn5qwl7yovho",
    name: "Colegio Santa María",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de San Juan bajo la advocación de Santa María, Madre de Dios. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción mariana con una formación académica actualizada. Con arraigo en la comunidad sanjuanina, es una institución valorada por su clima espiritual, el acompañamiento personalizado y el trabajo conjunto entre familias y docentes."
    }
  },
  {
    id: "cmpq31u9003arrn5qliqgi4lq",
    name: "Colegio Santa Rosa",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan bajo el patronazgo de Santa Rosa de Lima, primera santa de América y patrona de América Latina y las Filipinas. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra la identidad latinoamericana y la espiritualidad contemplativa de la primera santa del Nuevo Mundo. Una institución con raíces americanas y compromiso con la formación integral."
    }
  },
  {
    id: "cmpq31uf903efrn5qnktzfema",
    name: "Colegio Santo Domingo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada dominica de San Juan bajo el patronazgo de Santo Domingo de Guzmán, fundador de la Orden de Predicadores. Ofrece los niveles inicial, primario y secundario con la tradición intelectual dominicana que privilegia el estudio, la contemplación y la predicación de la verdad. Una institución que forma alumnos con rigor intelectual, amor a la verdad y vocación de servicio a la comunidad."
    }
  },
  {
    id: "cmpq31uie03g9rn5qfodxlebm",
    name: "Colegio Santo Tomás de Aquino",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan bajo el patronazgo de Santo Tomás de Aquino, el Doctor Angélico y patrono de los estudiantes. Ofrece los niveles inicial, primario y secundario con la tradición intelectual tomista que une fe y razón en la búsqueda de la verdad. Una institución que inspira a sus alumnos con el legado del mayor filósofo y teólogo de la historia del pensamiento cristiano."
    }
  },
  {
    id: "cmpq31ufs03eqrn5q7xyopwml",
    name: "Colegio San Valentín",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan bajo el patronazgo de San Valentín, mártir cristiano símbolo del amor y la amistad. Ofrece los niveles inicial, primario y secundario con una propuesta que pone los vínculos afectivos, la amistad y el amor al prójimo como valores centrales de la vida escolar. Una institución que forma alumnos con inteligencia emocional, calidez humana y capacidad de construir comunidad."
    }
  },
  {
    id: "cmpq31ubj03carn5qgt1onmqi",
    name: "Dante Alighieri",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada ítalo-argentina de San Juan que lleva el nombre del poeta florentino Dante Alighieri. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra el vínculo cultural entre Italia y San Juan, región que recibió miles de inmigrantes italianos que dejaron su huella en la viticultura, la gastronomía y la identidad cuyera. Una escuela con alma italiana en el corazón de la provincia."
    }
  },
  {
    id: "cmpq31ujy03h6rn5q3w6jwtkb",
    name: "E.P.E.T. N°1 Ingeniero Rogelio Boero",
    payload: {
      levels: ["SECUNDARIA"],
      description: "Escuela Provincial de Educación Técnica N°1 de San Juan que lleva el nombre del Ingeniero Rogelio Boero. Ofrece formación técnica secundaria que prepara a los egresados para el mercado laboral y el ingreso universitario con título técnico habilitante. Una institución de referencia en la educación técnica sanjuanina, respondiendo a las necesidades industriales y productivas de la provincia."
    }
  },
  {
    id: "cmpq31uhx03fyrn5qdq02mp48",
    name: "Escuela Clara Rosa Cortinez",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución educativa de San Juan que lleva el nombre de Clara Rosa Cortinez, figura de la historia educativa provincial. Ofrece los niveles inicial, primario y secundario con una propuesta que honra la memoria de su patrona a través de una educación comprometida con la calidad, la inclusión y el desarrollo integral de cada alumno en la comunidad sanjuanina."
    }
  },
  {
    id: "cmpq31ujh03gvrn5q2o0php8c",
    name: "Escuela Julia León",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución educativa de San Juan que lleva el nombre de Julia León, maestra y educadora vinculada a la historia de la educación en la provincia. Ofrece los niveles inicial, primario y secundario con una propuesta que rinde homenaje a las grandes maestras que forjaron el sistema educativo argentino. Una institución con identidad histórica y compromiso con la formación de las nuevas generaciones sanjuaninas."
    }
  },
  {
    id: "cmpq31ueo03e4rn5qwh6r2p6j",
    name: "Escuela Modelo de San Juan",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución educativa de San Juan con los niveles inicial, primario y secundario. La Escuela Modelo aspira a ser un referente pedagógico en la provincia, con una propuesta innovadora y orientada a la excelencia. Reconocida en la comunidad sanjuanina por su clima institucional y su compromiso con la calidad educativa, forma alumnos preparados para los desafíos de la sociedad contemporánea."
    }
  },
  {
    id: "cmpq31u8c03agrn5q1nqusvgu",
    name: "Instituto Enseñanza Integral",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan con los niveles inicial, primario y secundario. El Instituto Enseñanza Integral vive fiel a su nombre ofreciendo una propuesta que desarrolla todas las dimensiones del alumno: académica, artística, deportiva y social. Una institución comprometida con la formación completa de cada estudiante en el corazón de la provincia sanjuanina."
    }
  },
  {
    id: "cmpq31udp03dirn5qtsqcaq58",
    name: "Instituto Privado de Educación Musical Franz Schubert",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de San Juan que lleva el nombre del compositor romántico Franz Schubert, símbolo de la sensibilidad musical y la creación artística. Ofrece los niveles inicial, primario y secundario con la música como eje pedagógico central, integrando la formación académica con la educación musical sistemática. Una propuesta única en San Juan para familias que valoran el arte como herramienta de desarrollo integral."
    }
  },
  {
    id: "cmpq31ulk03i3rn5q8d2eiz5v",
    name: "Instituto Superior Cervantes",
    payload: {
      levels: ["SUPERIOR"],
      description: "Instituto de educación superior privado de San Juan que lleva el nombre de Miguel de Cervantes, autor del Quijote y padre de la lengua española. Ofrece carreras terciarias con orientación pedagógica y humanística, formando docentes y profesionales con sólida base en las letras, la lengua y la cultura hispana. Una institución que honra al mayor escritor en español con una formación superior de calidad en la provincia."
    }
  },
  {
    id: "cmpq31ud703d7rn5qjefmloof",
    name: "Nuestra Señora de la Paz",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de San Juan bajo la advocación de Nuestra Señora de la Paz. Ofrece los niveles inicial, primario y secundario con una propuesta que pone la paz, la reconciliación y el diálogo como valores centrales de la vida escolar. Su espiritualidad mariana orientada a la paz forma alumnos capaces de construir vínculos sanos, resolver conflictos y contribuir a una sociedad más justa y fraterna."
    }
  },
  {
    id: "cmpq31u6z039jrn5qstn17d68",
    name: "Saint Paul Colegio Bilingüe Montessori",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe Montessori de San Juan con los niveles inicial, primario y secundario. Saint Paul combina la metodología Montessori —centrada en la autonomía, el aprendizaje por descubrimiento y el respeto por los ritmos individuales— con una propuesta bilingüe en inglés. Una alternativa pedagógica diferenciada en la provincia para familias que buscan una educación activa, bilingüe y respetuosa del niño."
    }
  },
  {
    id: "cmpq31u19036hrn5qsl512tb7",
    name: "Saint Paul Colegio Bilingüe Montessori - Sede 2",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Segunda sede del Colegio Bilingüe Montessori Saint Paul en San Juan, con los niveles inicial, primario y secundario. Comparte la propuesta pedagógica Montessori y el modelo bilingüe en inglés de la institución, ofreciendo mayor accesibilidad geográfica a las familias sanjuaninas que buscan una educación activa y respetuosa del desarrollo individual del niño."
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

console.log(`\n🏫  Curando ${updates.length} colegios de San Juan...\n`);

for (const { id, name, payload } of updates) {
  await patchSchool(id, name, payload);
}

console.log("\n✨  Listo.\n");
