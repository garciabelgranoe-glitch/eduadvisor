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
      description: "Institución privada de Mendoza que lleva el nombre del médico y filósofo alsaciano Albert Schweitzer, Premio Nobel de la Paz y símbolo del humanismo solidario. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia el respeto por la vida, la ética y el compromiso con el prójimo. En la tierra del sol y del vino, el colegio forma ciudadanos con sensibilidad humana y vocación de servicio."
    }
  },
  {
    id: "cmpq2vigc016orn5qb01l7uce",
    name: "Colegio Andino",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza cuyo nombre evoca la majestuosidad de los Andes, la cordillera que define la identidad de la provincia. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra la geografía y la cultura de la región cuyana. Forma alumnos con arraigo territorial, amor por la naturaleza andina y preparación académica para los desafíos del mundo contemporáneo."
    }
  },
  {
    id: "cmpq2vika018trn5qnw5qj6wp",
    name: "Colegio Bilingüe Los Olivos",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe privada de Mendoza con los niveles inicial, primario y secundario. Su nombre evoca los olivares que caracterizan el paisaje agrícola mendocino, símbolo de paz y prosperidad. Los Olivos ofrece una propuesta de inmersión en inglés con estándares internacionales, formando alumnos con fluidez lingüística y competencias globales en el corazón de la región de Cuyo."
    }
  },
  {
    id: "cmpq2viom01b9rn5q72jt73db",
    name: "Colegio Bilingüe Portezuelo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe privada de Mendoza con los niveles inicial, primario y secundario, cuyo nombre evoca el Portezuelo, paso de montaña emblemático de la cordillera mendocina. Ofrece una propuesta educativa en inglés que combina la identidad andina con una formación internacional de calidad. Una opción consolidada para las familias mendocinas que valoran el bilingüismo desde la primera infancia."
    }
  },
  {
    id: "cmpq2viq101c6rn5qrvkujbsr",
    name: "Colegio Compañía de María",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza dirigida por la Compañía de María Nuestra Señora, congregación fundada por Juana de Lestonnac en Francia en 1607. Ofrece los niveles inicial, primario y secundario con la espiritualidad ignaciana femenina que privilegia la formación integral, el amor a la Virgen y la excelencia académica. Una institución con siglos de tradición educativa y presencia consolidada en Cuyo."
    }
  },
  {
    id: "cmpq2viww01g5rn5qqm9cik2o",
    name: "Colegio Congreso",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza con los niveles inicial, primario y secundario. El Colegio Congreso toma su nombre como referencia al sistema democrático y a los valores de la participación ciudadana. Con una propuesta educativa orientada a la formación cívica y la excelencia académica, forma alumnos con conciencia política y compromiso con los valores de la república en la capital cuyera."
    }
  },
  {
    id: "cmpq2vixf01ggrn5qypxu670i",
    name: "Colegio de la Universidad del Aconcagua",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "Institución educativa dependiente de la Universidad del Aconcagua de Mendoza, con los niveles primario y secundario. Su pertenencia a la universidad más importante de Cuyo le otorga un perfil académico de excelencia, articulando la educación media con la vida universitaria. Forma egresados con sólida preparación para el ingreso a carreras universitarias y competencias para el mundo profesional."
    }
  },
  {
    id: "cmpq2vimc01a1rn5qrmi9qz3s",
    name: "Colegio Don Bosco Mendoza",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución salesiana de Mendoza fundada bajo el carisma de San Juan Bosco, patrono de los jóvenes. Ofrece los niveles inicial, primario y secundario con el sistema preventivo salesiano basado en razón, religión y amor. Con presencia histórica en la región cuyera, el Don Bosco mendocino forma jóvenes con fe, preparación académica y vocación de servicio a la comunidad."
    }
  },
  {
    id: "cmpq2vivg01f8rn5qcnjyack6",
    name: "Colegio Español",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza fundada por la comunidad española de la provincia, con los niveles inicial, primario y secundario. El Colegio Español celebra el vínculo histórico entre España y Mendoza, tierra que recibió inmigrantes hispanos que dejaron su huella en la cultura, la gastronomía y la viticultura regional. Su propuesta integra la herencia ibérica con una educación actualizada y de calidad."
    }
  },
  {
    id: "cmpq2vip401bkrn5qd806j0sy",
    name: "Colegio Fénix",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza con los niveles inicial, primario y secundario. Su nombre evoca al ave fénix, símbolo de la renovación, el renacimiento y la capacidad de superarse ante las adversidades. El Colegio Fénix forma alumnos con resiliencia, creatividad y determinación, valores especialmente significativos en una provincia que ha sabido reconstruirse tras los desafíos de su historia."
    }
  },
  {
    id: "cmpq2vilv019qrn5q01rpl9a9",
    name: "Colegio ICEI",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza con los niveles inicial, primario y secundario. El Colegio ICEI ofrece una propuesta educativa integral orientada al desarrollo académico, personal y social de sus alumnos. Con arraigo en la comunidad mendocina, es una institución reconocida por su clima institucional, la calidad de sus docentes y su compromiso con la formación de ciudadanos responsables y preparados."
    }
  },
  {
    id: "cmpq2vid80155rn5qfzh4f3u8",
    name: "Colegio María Auxiliadora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución salesiana femenina de Mendoza dirigida por las Hijas de María Auxiliadora. Ofrece los niveles inicial, primario y secundario con la espiritualidad de Don Bosco y la devoción mariana como ejes formativos. Con décadas de presencia salesiana en Cuyo, forma alumnas con sólida preparación académica, fe viva y apertura al mundo."
    }
  },
  {
    id: "cmpq2vijs018irn5qnfzvxkqh",
    name: "Colegio María Reina",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Mendoza bajo la advocación de María Reina, título que celebra la realeza espiritual de la Virgen. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción mariana y el humanismo cristiano con una formación académica actualizada. Una institución valorada en la comunidad mendocina por su clima espiritual y su excelencia educativa."
    }
  },
  {
    id: "cmpq2vidr015grn5qn8e9zinh",
    name: "Colegio Norbridge",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe privada de Mendoza con los niveles inicial, primario y secundario. Norbridge combina la tradición educativa de los países de habla inglesa con la identidad cuyera, formando alumnos bilingües con competencias internacionales. Su propuesta pedagógica moderna y su enfoque en el inglés lo posicionan como una de las opciones bilingües más destacadas de la provincia."
    }
  },
  {
    id: "cmpq2vin101acrn5qs7hocsi7",
    name: "Colegio Nuestra Señora de la Misericordia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Mendoza bajo la advocación de Nuestra Señora de la Misericordia. Ofrece los niveles inicial, primario y secundario con una espiritualidad centrada en la misericordia como actitud fundamental ante la vida. Su propuesta forma alumnos sensibles al sufrimiento ajeno, comprometidos con la justicia y capaces de construir vínculos desde la compasión y la generosidad."
    }
  },
  {
    id: "cmpq2vilc019frn5quypkd2qv",
    name: "Colegio Nuestra Señora de la Consolata",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada misionera de Mendoza bajo la advocación de Nuestra Señora de la Consolata, patrona de los Misioneros de la Consolata. Ofrece los niveles inicial, primario y secundario con una espiritualidad misionera que privilegia el diálogo intercultural, el servicio y la apertura al mundo. Una institución con identidad misional marcada en la comunidad educativa mendocina."
    }
  },
  {
    id: "cmpq2viro01d3rn5qnajerjq0",
    name: "Colegio Padre Claret",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada claretiana de Mendoza que lleva el nombre de San Antonio María Claret, fundador de los Misioneros Claretianos. Ofrece los niveles inicial, primario y secundario con una espiritualidad misionera orientada al servicio y la evangelización. Con presencia claretiana en Cuyo, forma alumnos con fe dinámica, compromiso apostólico y sólida preparación académica."
    }
  },
  {
    id: "cmpq2vijc0187rn5qlmcg9xn8",
    name: "Colegio Privado San Gabriel",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza bajo el patronazgo de San Gabriel Arcángel, mensajero de Dios y patrono de las comunicaciones. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la fe cristiana con una formación académica de calidad. Con arraigo en la comunidad mendocina, es una institución reconocida por su clima cálido y su compromiso con el desarrollo integral del alumno."
    }
  },
  {
    id: "cmpq2vikt0194rn5qs6nx05d9",
    name: "Colegio PS-161 Clave de Sol",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "Institución privada de Mendoza con los niveles inicial y primario, cuyo nombre musical evoca la clave de sol como símbolo de armonía, creatividad y expresión artística. El Colegio Clave de Sol integra la educación musical en su propuesta pedagógica, formando niños con sensibilidad artística, desarrollo cognitivo integral y amor por la música desde los primeros años de escolaridad."
    }
  },
  {
    id: "cmpq2viib017lrn5qdfm7x3bp",
    name: "Colegio Rainbow",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe privada de Mendoza con los niveles inicial, primario y secundario. Su nombre, Rainbow —arcoíris en inglés—, evoca la diversidad, la inclusión y la alegría como valores del aprendizaje. El Colegio Rainbow ofrece una propuesta de inmersión en inglés con enfoque inclusivo y creativo, formando alumnos bilingües con apertura al mundo y celebración de la diversidad."
    }
  },
  {
    id: "cmpq2vie8015rrn5qkoidda1m",
    name: "Colegio San Andrés",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza con los niveles inicial, primario y secundario, bajo el patronazgo del apóstol San Andrés, hermano de Pedro y uno de los primeros discípulos de Jesús. Ofrece una propuesta educativa integral que combina la fe cristiana con el rigor académico. Con arraigo en la comunidad mendocina, es una institución valorada por su clima institucional y su compromiso formativo."
    }
  },
  {
    id: "cmpq2vit701e0rn5quzq86ybn",
    name: "Colegio San Jorge",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza bajo el patronazgo de San Jorge, mártir cristiano símbolo del coraje y la lucha contra el mal. Ofrece los niveles inicial, primario y secundario con una propuesta que combina los valores del heroísmo cristiano con una formación académica actualizada. Con presencia en la comunidad mendocina, forma alumnos con determinación, valentía y compromiso con el bien."
    }
  },
  {
    id: "cmpq2viwe01furn5qi34o7022",
    name: "Colegio San José de Calasanz",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada escolapia de Mendoza bajo el patronazgo de San José de Calasanz, fundador de las Escuelas Pías y primer maestro de escuela popular. Ofrece los niveles inicial, primario y secundario con la pedagogía calasancia que privilegia la educación de los más pobres como acto de piedad y justicia. Una institución con alma escolapia comprometida con la igualdad de oportunidades educativas en Cuyo."
    }
  },
  {
    id: "cmpq2vicn014urn5qace26v4z",
    name: "Colegio San José Hermanos Maristas",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada marista de Mendoza bajo el patronazgo de San José y el carisma del Beato Marcelino Champagnat. Ofrece los niveles inicial, primario y secundario con la pedagogía marista que forma personas de bien y buenos ciudadanos. Con presencia consolidada en Cuyo, el colegio une fe, servicio y excelencia académica bajo la mirada de María y el ejemplo de José el trabajador."
    }
  },
  {
    id: "cmpq2vipl01bvrn5qqlxdlpsi",
    name: "Colegio San Luis Gonzaga",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada jesuita de Mendoza que lleva el nombre de San Luis Gonzaga, joven noble italiano que renunció a su título para servir a los enfermos y es patrono de los estudiantes. Ofrece los niveles inicial, primario y secundario con la pedagogía ignaciana orientada a la excelencia, la libertad y el servicio. Una institución que inspira a sus alumnos con el ejemplo de un joven santo que eligió lo esencial."
    }
  },
  {
    id: "cmpq2vis401dern5qny9e3eop",
    name: "Colegio San Nicolás",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza bajo el patronazgo de San Nicolás de Bari, patrono de los niños y símbolo de la generosidad. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la bondad, el cuidado del otro y la excelencia académica como pilares formativos. Con arraigo en la comunidad mendocina, forma alumnos con espíritu generoso y sólida preparación para la vida."
    }
  },
  {
    id: "cmpq2vir601csrn5qeir33xg2",
    name: "Colegio Santa Teresita de Lisieux",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada carmelita de Mendoza bajo el patronazgo de Santa Teresita del Niño Jesús, Doctora de la Iglesia y símbolo del camino pequeño de la santidad cotidiana. Ofrece los niveles inicial, primario y secundario con la espiritualidad teresiana centrada en el amor sencillo y la entrega en los pequeños actos del día a día. Una institución que forma alumnos con profundidad espiritual y calidez humana."
    }
  },
  {
    id: "cmpq2vini01anrn5qzokd231s",
    name: "Colegio Santo Tomás de Aquino",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada dominica de Mendoza bajo el patronazgo de Santo Tomás de Aquino, el Doctor Angélico y patrono de los estudiantes y las universidades. Ofrece los niveles inicial, primario y secundario con la tradición intelectual dominicana que une fe y razón en la búsqueda de la verdad. En una ciudad universitaria como Mendoza, el pensamiento tomista inspira una educación de excelencia y rigor intelectual."
    }
  },
  {
    id: "cmpq2vifo016drn5qmedsy8xv",
    name: "Colegio Stroberi",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "Institución privada de Mendoza con los niveles inicial y primario. Su nombre evoca la frutilla —fruta típica del campo mendocino— con un toque de fantasía infantil. El Colegio Stroberi ofrece una propuesta pedagógica centrada en los primeros años de escolaridad, con especial atención al desarrollo afectivo, la creatividad y el aprendizaje lúdico en un ambiente cálido y estimulante."
    }
  },
  {
    id: "cmpq2vivx01fjrn5qt4vb02cg",
    name: "Colegio Tomás Alva Edison",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza que lleva el nombre del inventor estadounidense Thomas Alva Edison, símbolo de la perseverancia, la creatividad y el poder transformador de la ciencia y la tecnología. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia la innovación, el pensamiento científico y la cultura del esfuerzo como herramientas para cambiar el mundo."
    }
  },
  {
    id: "cmpq2viux01exrn5q6e22f7p4",
    name: "Colegio Universitario Santa María",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza con los niveles primario y secundario, vinculada al sistema universitario de la provincia. El Colegio Universitario Santa María ofrece una propuesta académica de excelencia orientada al ingreso universitario, articulando la educación media con la vida universitaria bajo la advocación de la Virgen María como patrona del saber y la sabiduría."
    }
  },
  {
    id: "cmpq2vism01dprn5qo4i5gjuk",
    name: "Escuela Israelita Max Nordau",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de la comunidad judía de Mendoza que lleva el nombre de Max Nordau, médico, escritor y cofundador del movimiento sionista moderno. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la identidad cultural judía, el hebreo y los valores del pueblo de Israel con una educación académica de calidad. Una institución con historia y orgullo comunitario en Cuyo."
    }
  },
  {
    id: "cmpq2vihn017arn5qu32adh4n",
    name: "Escuela Italiana XXI de Abril",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada ítalo-argentina de Mendoza que lleva la fecha del XXI de Abril como referencia a la fundación de Roma. Ofrece los niveles inicial, primario y secundario con una propuesta bilingüe español-italiano que celebra el vínculo histórico entre Italia y Mendoza. Una escuela con identidad transatlántica que honra la herencia de los miles de inmigrantes italianos que forjaron la viticultura y cultura cuyena."
    }
  },
  {
    id: "cmpq2viqj01chrn5q7ojaws8x",
    name: "Fundación Gutenberg Mendoza",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza que lleva el nombre de Johannes Gutenberg, inventor de la imprenta y símbolo de la democratización del conocimiento. Ofrece los niveles primario y secundario con una propuesta que reivindica la lectura, la escritura y el acceso al saber como derechos fundamentales. Una institución con identidad humanística que honra al hombre que transformó la historia de la cultura universal."
    }
  },
  {
    id: "cmpq2vio301ayrn5q1yprt4l1",
    name: "IMEI - Instituto Maipú de Educación Integral",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Instituto privado de educación integral en el departamento de Maipú, Mendoza, con los niveles inicial, primario y secundario. El IMEI ofrece una propuesta pedagógica que integra las dimensiones académica, artística, deportiva y tecnológica del aprendizaje. Con arraigo en Maipú —tierra del vino y la historia bélica de la independencia argentina— forma alumnos con identidad regional y proyección global."
    }
  },
  {
    id: "cmpq2viit017wrn5qo0mnpfv7",
    name: "Instituto Adventista Mendoza",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución educativa adventista de Mendoza perteneciente a la Iglesia Adventista del Séptimo Día. Ofrece los niveles inicial, primario y secundario con una propuesta que integra formación académica, valores bíblicos y estilo de vida saludable. Con presencia global en más de 150 países, la educación adventista en Mendoza ofrece una alternativa integral orientada al desarrollo holístico de la persona en el corazón de Cuyo."
    }
  },
  {
    id: "cmpq2vitv01ebrn5qb7qv8tuw",
    name: "Instituto Nadino",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Mendoza con los niveles inicial, primario y secundario. El Instituto Nadino ofrece una propuesta educativa integral con historia y arraigo en la comunidad mendocina. Con décadas de trayectoria, es una institución reconocida por las familias de la región por su compromiso con la calidad educativa, la formación en valores y el acompañamiento personalizado de cada alumno."
    }
  },
  {
    id: "cmpq2view0162rn5qhscdkupg",
    name: "Instituto San Pedro Nolasco",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada mercedaria de Mendoza bajo el patronazgo de San Pedro Nolasco, fundador de la Orden de la Merced y patrono de Cataluña. Ofrece los niveles inicial, primario y secundario con el carisma mercedario orientado a la liberación y el servicio. En una provincia con profunda devoción a la Virgen de la Merced, esta institución forma alumnos con generosidad, entrega y vocación apostólica."
    }
  },
  {
    id: "cmpq2vigt016zrn5q1kvxmcqr",
    name: "Instituto Superior Humberto de Paolis",
    payload: {
      levels: ["SUPERIOR"],
      description: "Instituto de educación superior privado de Mendoza que lleva el nombre de Humberto de Paolis, figura relevante de la historia educativa de la provincia. Ofrece carreras terciarias con orientación pedagógica y profesional, formando docentes y profesionales para el mercado laboral de la región de Cuyo. Una institución con identidad local y compromiso con la calidad de la formación de nivel superior en Mendoza."
    }
  },
  {
    id: "cmpq2vixx01grrn5qqa0o3r2j",
    name: "Jardín Platero",
    payload: {
      levels: ["INICIAL"],
      description: "Jardín de infantes privado de Mendoza cuyo nombre evoca a Platero, el burrito protagonista del poema en prosa de Juan Ramón Jiménez, clásico de la literatura infantil hispana. Atiende niños de 2 a 5 años con una propuesta centrada en la literatura, el juego y el desarrollo afectivo en la primera infancia. Un espacio cálido y literario donde los más pequeños mendocinos descubren el placer de las palabras y la imaginación."
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
