/**
 * Curación de colegios de Neuquén
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-neuquen.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) { console.error("❌  Falta ADMIN_API_KEY."); process.exit(1); }

const updates = [
  {
    id: "cmpq33pdu045xrn5qs1ccryyp",
    name: "Agüita del Limay - Sede Escuela Infantil",
    payload: {
      levels: ["INICIAL"],
      description: "Jardín maternal privado de Neuquén cuyo nombre evoca el Río Limay, uno de los ríos más importantes de la Patagonia que atraviesa la capital neuquina. Atiende niños desde los 45 días hasta los 2 años con una propuesta de estimulación temprana, vínculo afectivo seguro y desarrollo integral. Un espacio cálido donde los más pequeños de la Patagonia dan sus primeros pasos en un ambiente amoroso y enriquecido."
    }
  },
  {
    id: "cmpq33pf8046jrn5qruwfr115",
    name: "Cemoe Marcelino Champagnat",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución marista de Neuquén que lleva el nombre del Beato Marcelino Champagnat, fundador de los Hermanos Maristas. Ofrece los niveles inicial, primario y secundario con la pedagogía marista que forma personas de bien y buenos ciudadanos bajo la mirada de María. Con presencia consolidada en la Patagonia, es una referencia de la educación marista en el sur argentino."
    }
  },
  {
    id: "cmpq33p7b042mrn5q4ydc6n19",
    name: "Centro Educativo del Sol - Nivel Medio",
    payload: {
      levels: ["SECUNDARIA"],
      description: "Institución de educación secundaria privada de Neuquén. El Centro Educativo del Sol ofrece el bachillerato con una propuesta orientada al ingreso universitario y la formación integral del adolescente. Su nombre evoca la energía solar como metáfora del aprendizaje que ilumina y transforma, en una provincia patagónica con extraordinario potencial de energía solar."
    }
  },
  {
    id: "cmpq33owe03wtrn5qrk820tkq",
    name: "Colegio Arturo Illia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Neuquén que lleva el nombre del presidente argentino Arturo Umberto Illia, gobernante honesto y demócrata que ejerció entre 1963 y 1966. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica los valores de la honestidad, la democracia y el servicio público. Una institución que forma ciudadanos con ética cívica en la capital de la Patagonia."
    }
  },
  {
    id: "cmpq33ous03w7rn5qu4zta69r",
    name: "Colegio Bilingüe Neuquén",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe privada de Neuquén con los niveles inicial, primario y secundario. Ofrece una propuesta de inmersión en inglés con estándares internacionales, formando alumnos con fluidez lingüística y competencias globales. Una de las principales opciones bilingües de la capital patagónica para familias que valoran la educación en inglés como herramienta de inserción en el mundo contemporáneo."
    }
  },
  {
    id: "cmpq33osu03uzrn5qtmyabd8x",
    name: "Colegio Confluencia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Neuquén cuyo nombre evoca la Confluencia, el punto donde el Río Neuquén y el Río Limay se unen para formar el Río Negro, símbolo geográfico e identitario de la ciudad. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra la identidad patagónica y la riqueza del encuentro como valor educativo fundamental."
    }
  },
  {
    id: "cmpq33oxj03xfrn5qrpxni0m8",
    name: "Colegio Cumbres",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Neuquén cuyo nombre evoca las cumbres de la cordillera que domina el horizonte patagónico. Ofrece los niveles inicial, primario y secundario con una propuesta que aspira a llevar a cada alumno a su mejor versión, como quien alcanza la cima de una montaña. En una provincia rodeada de volcanes y picos nevados, el Colegio Cumbres forma alumnos con ambición, esfuerzo y superación."
    }
  },
  {
    id: "cmpq33pb7044ern5qe5682v9c",
    name: "Colegio Diocesano Nuestra Señora de la Vida",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada diocesana de Neuquén bajo la advocación de Nuestra Señora de la Vida. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la defensa y celebración de la vida humana en todas sus etapas como eje espiritual y pedagógico. Con respaldo de la diócesis neuquina, forma alumnos con conciencia de la dignidad humana y compromiso con los valores del evangelio."
    }
  },
  {
    id: "cmpq33p8v043jrn5qvg97mbml",
    name: "Colegio Domingo Faustino Sarmiento",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Neuquén que lleva el nombre del padre de la educación pública argentina, Domingo Faustino Sarmiento. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica los valores sarmientinos del esfuerzo, el conocimiento y la educación como herramienta de progreso y movilidad social. Una institución con identidad histórica en la capital patagónica."
    }
  },
  {
    id: "cmpq33oza03ycrn5qhrb7mo5w",
    name: "Colegio Don Bosco",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución salesiana de Neuquén fundada bajo el carisma de San Juan Bosco. Ofrece los niveles inicial, primario y secundario con el sistema preventivo salesiano basado en razón, religión y amor. Con presencia histórica en la Patagonia —donde los Salesianos fueron pioneros en evangelización y educación—, el Don Bosco neuquino es una institución de referencia en el sur argentino."
    }
  },
  {
    id: "cmpq33owy03x4rn5qiqidy6la",
    name: "Colegio IFES Neuquén",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Neuquén con los niveles inicial, primario y secundario. El Colegio IFES ofrece una propuesta educativa integral orientada al desarrollo académico y personal de sus alumnos. Con arraigo en la comunidad neuquina, es una institución reconocida por su clima institucional y el compromiso de sus docentes con la formación de cada estudiante en la capital patagónica."
    }
  },
  {
    id: "cmpq33otv03vlrn5qqxrfgjt1",
    name: "Colegio Líder Calidad Educativa",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Neuquén con los niveles inicial, primario y secundario. El Colegio Líder Calidad Educativa vive fiel a su nombre apostando por la excelencia como estándar de trabajo cotidiano. Con una propuesta orientada al liderazgo, la calidad y la mejora continua, forma alumnos preparados para destacarse en el competitivo mundo académico y profesional de la Patagonia."
    }
  },
  {
    id: "cmpq33os903uorn5qicour0qg",
    name: "Colegio Lincoln",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Neuquén que lleva el nombre del presidente estadounidense Abraham Lincoln, símbolo de la lucha por la igualdad y la democracia. Ofrece los niveles inicial, primario y secundario con una propuesta que valora la libertad, la justicia y los derechos civiles como ejes formativos. Una institución con perfil humanístico y bilingüe en la capital de la Patagonia."
    }
  },
  {
    id: "cmpq33p1o03zkrn5qm1t2z4dp",
    name: "Colegio Manuel Belgrano",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Neuquén que lleva el nombre del prócer Manuel Belgrano, creador de la bandera argentina y figura clave de la independencia. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica los valores patrióticos y el legado belgraniano del esfuerzo, la educación y el amor a la patria. Una institución con identidad histórica arraigada en la comunidad neuquina."
    }
  },
  {
    id: "cmpq33oy403xqrn5qevup7d3p",
    name: "Colegio María Auxiliadora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución salesiana femenina de Neuquén dirigida por las Hijas de María Auxiliadora. Ofrece los niveles inicial, primario y secundario con la espiritualidad de Don Bosco y la devoción mariana como ejes formativos. Con la histórica presencia salesiana en la Patagonia, forma alumnas con sólida preparación académica, fe viva y compromiso con su comunidad."
    }
  },
  {
    id: "cmpq33p1503z9rn5qyf5ttbd9",
    name: "Colegio Millaray",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Neuquén cuyo nombre, Millaray, es una palabra mapuche que significa 'flor de oro'. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra la identidad mapuche y la riqueza cultural de los pueblos originarios de la Patagonia. Una institución con arraigo en la cultura del Neuquén profundo, tierra del pueblo mapuche."
    }
  },
  {
    id: "cmpq33p2n0406rn5qvizsb43r",
    name: "Colegio Neuquén Oeste",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Neuquén con los niveles inicial, primario y secundario, con arraigo en el sector oeste de la ciudad. El Colegio Neuquén Oeste ofrece una propuesta educativa integral orientada a las familias del área occidental de la capital patagónica, combinando calidad académica con cercanía comunitaria."
    }
  },
  {
    id: "cmpq33otd03varn5qt2g6fuww",
    name: "Colegio Paihuen",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Neuquén cuyo nombre, Paihuen, es una voz mapuche que evoca el lugar donde nacen las flores en primavera. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la identidad cultural patagónica y el respeto por la naturaleza. En tierra mapuche, el Colegio Paihuen forma alumnos con arraigo, sensibilidad ambiental y amor por la Patagonia."
    }
  },
  {
    id: "cmpq33p7x042xrn5qsifftokj",
    name: "Colegio Primario Lola Mora",
    payload: {
      levels: ["PRIMARIA"],
      description: "Institución de educación primaria privada de Neuquén que lleva el nombre de Lola Mora, la gran escultora argentina autora de la Fuente de las Nereidas y pionera del arte nacional. Ofrece la educación primaria con una propuesta que privilegia las artes, la creatividad y la expresión como dimensiones esenciales del desarrollo infantil. Una institución que honra el legado de una mujer que rompió moldes y transformó el arte argentino."
    }
  },
  {
    id: "cmpq33pdb045mrn5q4upml509",
    name: "Colegio San José Obrero",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Neuquén bajo el patronazgo de San José Obrero, advocación que celebra el trabajo como dignidad humana. Ofrece los niveles inicial, primario y secundario con una propuesta que pone el trabajo honrado, la responsabilidad y la dignidad laboral como valores centrales de la formación. Una institución especialmente significativa en una provincia donde la industria energética es motor del desarrollo."
    }
  },
  {
    id: "cmpq33p630420rn5q2il13wsu",
    name: "Colegio Santa Teresa de Jesús",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada carmelita de Neuquén bajo el patronazgo de Santa Teresa de Jesús, Doctora de la Iglesia y mística española del siglo XVI. Ofrece los niveles inicial, primario y secundario con la espiritualidad teresiana centrada en la oración, la interioridad y el amor a Dios. Una institución que forma alumnos con profundidad espiritual, solidez académica y capacidad de reflexión en la Patagonia."
    }
  },
  {
    id: "cmpq33p6m042brn5qx8itn7fg",
    name: "Colegio Secundario Jean Piaget",
    payload: {
      levels: ["SECUNDARIA"],
      description: "Institución de educación secundaria privada de Neuquén que lleva el nombre del psicólogo y epistemólogo suizo Jean Piaget. Ofrece el bachillerato con una propuesta inspirada en el constructivismo piagetiano, donde el alumno es constructor activo de su propio conocimiento. Una institución con identidad pedagógica científica orientada al ingreso universitario en la capital patagónica."
    }
  },
  {
    id: "cmpq33oyl03y1rn5q6xl5jcb2",
    name: "Colegio Trinidad",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada evangélica de Neuquén bajo la advocación de la Santísima Trinidad. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la fe cristiana trinitaria con una formación académica actualizada. Una institución con identidad cristiana marcada en la comunidad neuquina, valorada por las familias evangélicas de la Patagonia por su clima espiritual y su compromiso educativo."
    }
  },
  {
    id: "cmpq33p8e0438rn5q9t7l94wr",
    name: "Dante Alighieri Neuquén",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada ítalo-argentina de Neuquén que lleva el nombre del poeta Dante Alighieri. Ofrece los niveles inicial, primario y secundario con una propuesta bilingüe español-italiano que celebra el vínculo cultural entre Italia y la Patagonia, tierra que recibió importantes oleadas de inmigrantes italianos. Una escuela con identidad transatlántica en el corazón de la capital neuquina."
    }
  },
  {
    id: "cmpq33p4h0413rn5qswqpk66j",
    name: "Eastbourne Institute",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Instituto bilingüe privado de Neuquén con los niveles inicial, primario y secundario. Eastbourne ofrece una propuesta de educación en inglés con estándares internacionales, preparando alumnos para certificaciones reconocidas globalmente. Su nombre evoca la ciudad costera inglesa de Eastbourne, y su propuesta conecta a los alumnos neuquinos con la tradición educativa del mundo anglosajón."
    }
  },
  {
    id: "cmpq33p34040hrn5qmg74fkuc",
    name: "Escuela Adventista Juan Bautista Alberdi",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución adventista de Neuquén que lleva el nombre del jurista Juan Bautista Alberdi, autor de las Bases de la Constitución Argentina. Ofrece los niveles inicial, primario y secundario con una propuesta que integra los valores adventistas —fe, salud y servicio— con el legado cívico alberdiano. Una institución que forma ciudadanos con conciencia constitucional y compromiso con la vida sana en la Patagonia."
    }
  },
  {
    id: "cmpq33p5m041prn5q4iy2k7rk",
    name: "Escuela Cristiana Evangélica de Neuquén",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución educativa evangélica de Neuquén con los niveles inicial, primario y secundario. La Escuela Cristiana Evangélica ofrece una propuesta que integra la fe evangélica, el estudio de las Escrituras y los valores del evangelio con una formación académica actualizada. Una alternativa educativa cristiana consolidada en la Patagonia para familias que valoran la educación desde una perspectiva de fe bíblica."
    }
  },
  {
    id: "cmpq33p3l040srn5qbbc70c9l",
    name: "Escuela Cristiana Vida",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución educativa cristiana de Neuquén con los niveles inicial, primario y secundario. La Escuela Cristiana Vida pone la vida en su plenitud —como la propone el evangelio— como horizonte de toda la propuesta pedagógica. Forma alumnos con fe viva, valores bíblicos y preparación académica sólida, en una comunidad educativa cristiana comprometida con el desarrollo integral de cada persona."
    }
  },
  {
    id: "cmpq33pa20443rn5q11facxpr",
    name: "Escuela Nuestra Señora de la Guardia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Neuquén bajo la advocación de Nuestra Señora de la Guardia. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la espiritualidad mariana con una formación académica actualizada. Con arraigo en la comunidad neuquina, es una institución valorada por su clima espiritual y el acompañamiento personalizado a las familias de la Patagonia."
    }
  },
  {
    id: "cmpq33pcs045brn5qq1r0jma7",
    name: "Escuela Padre Fito",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Neuquén que lleva el nombre del querido Padre Adolfo Fernández, conocido como Padre Fito, sacerdote de gran arraigo popular en la comunidad neuquina. Ofrece los niveles inicial, primario y secundario con una propuesta que honra el carisma cercano, sencillo y comprometido del Padre Fito, formando alumnos con vocación de servicio y amor por la Patagonia."
    }
  },
  {
    id: "cmpq33p0l03yyrn5qel2tpqdx",
    name: "Escuela Primaria Nuevo Mundo",
    payload: {
      levels: ["PRIMARIA"],
      description: "Escuela de educación primaria privada de Neuquén. Su nombre, Nuevo Mundo, evoca el descubrimiento, la apertura y la posibilidad de construir realidades mejores. Ofrece la educación primaria con una propuesta centrada en el aprendizaje significativo y el desarrollo integral del niño en los años fundamentales de la escolaridad, en la dinámica y creciente capital patagónica."
    }
  },
  {
    id: "cmpq33pec0468rn5q1j88dwlq",
    name: "Escuela Vida",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución educativa privada de Neuquén con los niveles inicial, primario y secundario. La Escuela Vida celebra la vida en todas sus dimensiones como eje pedagógico central, formando alumnos con sentido de la existencia, alegría de vivir y compromiso con el mundo que los rodea. Una institución con identidad propia en la comunidad educativa neuquina."
    }
  },
  {
    id: "cmpq33pca0450rn5qugs2b187",
    name: "Instituto Manuel Belgrano",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Neuquén que lleva el nombre del prócer Manuel Belgrano, creador de la bandera y símbolo de los valores patrióticos argentinos. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia la formación cívica, la historia argentina y el amor a la patria. Una institución con identidad histórica y compromiso con los valores democráticos en la Patagonia."
    }
  },
  {
    id: "cmpq33p2603zvrn5q0zmrhm6o",
    name: "Instituto Panamericano de Estudios Superiores",
    payload: {
      levels: ["SUPERIOR"],
      description: "Instituto de educación superior privado de Neuquén. El Instituto Panamericano ofrece carreras terciarias con orientación pedagógica y profesional, formando docentes y técnicos para el mercado laboral patagónico. Con una visión panamericana que conecta la formación local con los estándares continentales, es una opción de calidad para la educación superior en la capital neuquina."
    }
  },
  {
    id: "cmpq33p55041ern5qrfwwjcep",
    name: "Instituto Secundario Pablo VI",
    payload: {
      levels: ["SECUNDARIA"],
      description: "Instituto de educación secundaria privado de Neuquén que lleva el nombre del Papa Pablo VI, pontífice del diálogo, la apertura al mundo y la encíclica Humanae Vitae. Ofrece el bachillerato con una propuesta que integra la fe cristiana, la apertura al diálogo y la formación humanística. Una institución que inspira a sus alumnos con el ejemplo de un papa que supo escuchar los desafíos del mundo moderno."
    }
  },
  {
    id: "cmpq33ove03wirn5q65hmasm5",
    name: "ISI College",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe privada de Neuquén con los niveles inicial, primario y secundario. ISI College ofrece una propuesta de educación en inglés con estándares internacionales, preparando alumnos para certificaciones globalmente reconocidas. Una institución consolidada en la educación bilingüe de la Patagonia, valorada por las familias neuquinas por su excelencia académica y su proyección internacional."
    }
  },
  {
    id: "cmpq33pbp044prn5qg78hwlpi",
    name: "I.T.C. Instituto Tecnológico del Comahue",
    payload: {
      levels: ["SECUNDARIA", "SUPERIOR"],
      description: "Instituto privado de Neuquén con nivel secundario y superior, especializado en formación tecnológica. El ITC responde a las necesidades de la región del Comahue —una de las más dinámicas de la Patagonia en términos energéticos e industriales— formando técnicos y profesionales con competencias para el sector hidrocarburífero, energético y tecnológico que impulsa el desarrollo provincial."
    }
  },
  {
    id: "cmpq33p0303ynrn5qigo8788h",
    name: "Jardín Amén",
    payload: {
      levels: ["INICIAL"],
      description: "Jardín de infantes privado de Neuquén cuyo nombre, Amén, expresa afirmación, fe y confianza plena. Atiende niños de 2 a 5 años con una propuesta de nivel inicial que integra la fe, el juego y el desarrollo afectivo como pilares de la primera infancia. Un espacio cálido y de fe donde los más pequeños neuquinos dan sus primeros pasos escolares en un ambiente amoroso y estimulante."
    }
  },
  {
    id: "cmpq33oub03vwrn5qelzwy3ll",
    name: "San Agustín International School",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe privada de Neuquén bajo el patronazgo de San Agustín de Hipona, con los niveles inicial, primario y secundario. San Agustín International School combina la tradición agustiniana de la búsqueda de la verdad con una propuesta educativa internacional en inglés. Una institución que forma alumnos bilingües con vida interior profunda y proyección global desde la Patagonia argentina."
    }
  }
];

async function patchSchool(id, name, payload) {
  const url = `${API_BASE}/v1/schools/id/${id}/profile`;
  const res = await fetch(url, { method: "PATCH", headers: { "content-type": "application/json", "x-admin-key": ADMIN_API_KEY }, body: JSON.stringify(payload) });
  if (res.ok) { console.log(`✅  ${name}`); } else { const body = await res.text(); console.error(`❌  ${name} — HTTP ${res.status}: ${body}`); }
}

console.log(`\n🏫  Curando ${updates.length} colegios de Neuquén...\n`);
for (const { id, name, payload } of updates) { await patchSchool(id, name, payload); }
console.log("\n✨  Listo.\n");
