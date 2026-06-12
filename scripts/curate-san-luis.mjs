/**
 * Curación de colegios de San Luis (capital).
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-san-luis.mjs [--dry-run]
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const DRY_RUN = process.argv.includes("--dry-run");

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY");
  process.exit(1);
}

// Solo colegios de la ciudad capital San Luis (no Merlo)
const updates = [
  {
    id: "cmqb4mmbl01fu76vho6xdrlmj",
    name: "Colegio de la Santa Cruz",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio de la Santa Cruz de San Luis es una institución educativa religiosa que ofrece formación completa desde el nivel inicial hasta el secundario en la capital puntana. Su propuesta pedagógica integra los valores del Evangelio con una exigencia académica reconocida en la provincia, formando alumnos con sólida base espiritual y preparación para los estudios superiores. La institución es un referente histórico de la educación católica en San Luis con generaciones de familias puntanas que han confiado en su proyecto educativo."
    }
  },
  {
    id: "cmqb4mmij01ho76vhiamzp93r",
    name: "Colegio Don Bosco",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Don Bosco de San Luis es la institución salesiana de la capital puntana, con una propuesta educativa completa desde el jardín de infantes hasta la escuela secundaria inspirada en el sistema preventivo del santo turinés. Con décadas de presencia en San Luis, el colegio ha formado generaciones de jóvenes puntanos con valores de fe, cultura y trabajo que caracterizan al carisma salesiano. Su ambiente de alegría, convivencia ordenada y exigencia académica lo convierten en una de las instituciones más queridas de la ciudad."
    }
  },
  {
    id: "cmqb4mmpc01ji76vh48pi81y7",
    name: "Colegio Maria Auxiliadora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio María Auxiliadora de San Luis es la institución salesiana femenina de la capital puntana, ofreciendo formación completa desde el nivel inicial hasta el secundario bajo el amparo de la Virgen patrona de los salesianos. Su propuesta educativa integra la fe, la cultura y la preparación académica con especial atención al desarrollo integral de las jóvenes puntanas. La institución tiene una larga historia en San Luis y es reconocida por su ambiente formativo cálido y su compromiso con la excelencia educativa."
    }
  },
  {
    id: "cmqb4mmjp01hz76vh9i4dc6au",
    name: "Colegio San José",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio San José de San Luis es una institución educativa católica de referencia en la capital puntana que lleva el nombre del Patriarca que custodiaba a la Sagrada Familia. Con una propuesta educativa completa desde el jardín maternal hasta la escuela secundaria, combina la formación académica rigurosa con los valores de responsabilidad, trabajo y vida familiar que encarnan la figura de José. Su historia en San Luis y la calidad de sus egresados lo posicionan como uno de los colegios más reconocidos de la provincia."
    }
  },
  {
    id: "cmqb4mmcs01g576vhaho5c0ab",
    name: "Colegio San Luis Rey - Primario",
    payload: {
      levels: ["PRIMARIA"],
      description: "El Colegio San Luis Rey en su nivel primario es una institución que rinde homenaje al rey Luis IX de Francia, patrono de la ciudad y la provincia de San Luis, reflejando la identidad histórica de la capital puntana. Con una propuesta de educación primaria que integra los valores de justicia, servicio y fe del rey canonizado, la institución forma a sus alumnos con sólidas bases académicas y humanas. La conexión entre el nombre del colegio y la historia de la ciudad hace de esta institución un lugar de pertenencia única para las familias sanluiseñas."
    }
  },
  {
    id: "cmqb4mmdz01gg76vhxn04cibb",
    name: "ESCUELA GENERATIVA CORAZÓN VICTORIA",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "La Escuela Generativa Corazón Victoria de San Luis es una institución educativa con una propuesta pedagógica innovadora que integra el aprendizaje generativo —centrado en la creación, la curiosidad y el desarrollo del potencial interior— desde los primeros años de escolaridad. Con niveles inicial y primario, la escuela fomenta una educación que va más allá de la transmisión de contenidos, cultivando la capacidad de cada niño de generar nuevos aprendizajes y soluciones creativas. Es una opción diferenciada para familias sanluiseñas que buscan alternativas pedagógicas innovadoras."
    }
  },
  {
    id: "cmqb4mmly01il76vhd5froobm",
    name: "Instituto Educativo Stoikheia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Educativo Stoikheia de San Luis toma su nombre del término griego que designa los elementos primordiales o principios fundamentales, reflejando una propuesta educativa que busca ir a los fundamentos del conocimiento y la formación humana. Con los tres niveles de escolaridad, Stoikheia ofrece una educación humanista y filosófica que distingue a la institución en el panorama educativo de la capital puntana. Su propuesta curricular combina el rigor académico con la búsqueda de sentido y la formación del carácter de sus alumnos."
    }
  },
  {
    id: "cmqb4mmf401gr76vhr84zkc6c",
    name: "Instituto Privado Aleluya",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Privado Aleluya de San Luis es una institución educativa cristiana evangélica que ofrece formación completa desde el nivel inicial hasta el secundario con una propuesta impregnada de alegría y gratitud —el significado de 'Aleluya'— como actitud frente al aprendizaje y la vida. Su proyecto educativo integra la fe cristiana con una currícula actualizada, formando jóvenes puntanos con valores sólidos y preparación académica para los estudios superiores. La institución es una referencia de la educación cristiana evangélica en la capital de San Luis."
    }
  },
  {
    id: "cmqb4mmkt01ia76vhorivqcyl",
    name: "Instituto Privado Araipi",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Privado Araipi de San Luis toma su nombre de la cultura originaria puntana, reivindicando la identidad indígena de los primeros pobladores de la región cuyana. Con una propuesta educativa completa para los tres niveles de escolaridad, Araipi integra el respeto por las culturas originarias y la identidad territorial puntana en una formación académica actualizada. La institución es una apuesta por una educación con raíces, que valora la historia y la diversidad cultural de la provincia de San Luis."
    }
  },
  {
    id: "cmqb4mm9901f876vh3sv80clq",
    name: "Instituto Privado Islas Malvinas",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Privado Islas Malvinas de San Luis lleva el nombre del archipiélago austral como declaración de soberanía y homenaje permanente a quienes dieron su vida en el conflicto de 1982. Con educación primaria y secundaria, la institución integra la historia de la Guerra de Malvinas en su propuesta de formación ciudadana, cultivando el amor por la patria y la memoria de los caídos. Una institución comprometida con la identidad nacional y la causa de la soberanía argentina en cada acto pedagógico."
    }
  },
  {
    id: "cmqb4mm7001em76vhogyjudlg",
    name: "Instituto Privado San Marcos",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Privado San Marcos de San Luis lleva el nombre del evangelista autor del segundo evangelio, conocido por su estilo directo y dinámico, como símbolo de una educación activa y transformadora. Con una propuesta completa desde el nivel inicial hasta el secundario, la institución forma a sus alumnos con valores evangélicos y una sólida preparación académica. La institución es reconocida en la capital puntana por su ambiente ordenado y su proyecto educativo coherente con los principios de la fe cristiana."
    }
  },
  {
    id: "cmqb4mm5o01eb76vhhx3st25h",
    name: "Instituto Privado San Marino",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Privado San Marino de San Luis toma su nombre de la pequeña pero orgullosa república europea como símbolo de independencia, cultura y tradición educativa de calidad. Con una propuesta completa para los tres niveles de escolaridad, la institución combina una formación académica actualizada con el trabajo en valores de identidad y pertenencia comunitaria. En la capital puntana, el Instituto San Marino es una opción valorada por las familias que buscan calidad educativa en un ambiente ordenado y contenedor."
    }
  },
  {
    id: "cmqb4mmga01h276vh80hkkfei",
    name: "Instituto Privado Santa María",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Privado Santa María de San Luis es una institución educativa de inspiración mariana que ofrece formación completa desde el nivel inicial hasta el secundario bajo el amparo de la Virgen María. Con una propuesta que integra los valores marianos de servicio, humildad y amor en la formación académica diaria, la institución educa a sus alumnos con una visión integral de la persona humana. En la capital de San Luis, el Instituto Santa María es un referente de la educación católica con profundo arraigo en la comunidad puntana."
    }
  },
  {
    id: "cmqb4mmhd01hd76vhan84ivxi",
    name: "Instituto San Francisco de Asís",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto San Francisco de Asís de San Luis es una institución franciscana que lleva el espíritu del Poverello a la educación puntana, promoviendo el amor por la naturaleza, la sencillez y el servicio a los más pobres. Con una propuesta completa para los tres niveles de escolaridad, el instituto integra el carisma franciscano con una formación académica que prepara a los alumnos para los estudios superiores. En la ciudad de San Luis, el carácter franciscano de la institución resuena con la espiritualidad propia de la región cuyana."
    }
  },
  {
    id: "cmqb4mm8401ex76vh43v4itkp",
    name: "Instituto San Gabriel Arcangel",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto San Gabriel Arcángel de San Luis lleva el nombre del mensajero celestial que anunció las grandes nuevas a María, como símbolo de una educación que transmite conocimiento transformador. Con una propuesta completa desde el nivel inicial hasta el secundario, la institución forma a sus alumnos con valores espirituales y una sólida preparación académica. El Instituto San Gabriel es una opción consolidada en el panorama educativo de la capital puntana, reconocida por su ambiente formativo y su comunidad educativa comprometida."
    }
  },
  {
    id: "cmqb4mmqq01jt76vh77k2fluq",
    name: "Instituto San Luis Gonzaga",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto San Luis Gonzaga de San Luis tiene una doble identidad: honra tanto al patrono de la ciudad como al joven jesuita italiano Luis Gonzaga, patrono de los estudiantes y la juventud. Con una propuesta educativa completa basada en el carisma ignaciano, ofrece formación desde el nivel inicial hasta el secundario con excelencia académica y desarrollo integral. La coincidencia de los patrones hace de esta institución un lugar de especial arraigo identitario en la capital puntana."
    }
  },
  {
    id: "cmqb4mmn401iw76vhiib7c74d",
    name: "Instituto San Pablo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto San Pablo de San Luis lleva el nombre del Apóstol de los Gentiles, figura de transformación y vocación universal, como inspiración de una educación que abre horizontes y prepara para el mundo. Con una propuesta completa desde el jardín de infantes hasta el secundario, la institución forma a sus alumnos con los valores de perseverancia, valentía y apertura que caracterizaron al apóstol Pablo. En la capital de San Luis, el Instituto San Pablo es una institución educativa sólida con profundo compromiso con la comunidad puntana."
    }
  },
  {
    id: "cmqb4mmaf01fj76vh3wc3grio",
    name: "Instituto Santa Catalina San Luis",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Santa Catalina de San Luis lleva el nombre de la patrona de los filósofos y las universidades, Santa Catalina de Alejandría, como emblema de una educación que aspira a la sabiduría y al pensamiento profundo. Con una propuesta completa para los tres niveles de escolaridad, la institución forma a sus alumnos con rigor intelectual y valores humanos que honran el legado de su santa patrona. En la capital puntana, el Instituto Santa Catalina es una opción valorada por las familias que priorizan la excelencia académica."
    }
  },
  {
    id: "cmqb4mmo901j776vhucjkdz2p",
    name: "Instituto Suyai",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "El Instituto Suyai de San Luis lleva en su nombre la palabra mapuche que significa 'esperanza', reivindicando la identidad originaria de los pueblos que habitaron la región cuyana. Con niveles inicial y primario, la institución ofrece una propuesta pedagógica que integra el respeto por las culturas indígenas con una formación académica actualizada en el contexto puntano. Suyai es una apuesta por una educación que mira hacia el futuro sin olvidar las raíces, cultivando en los niños el orgullo por la diversidad cultural de San Luis."
    }
  },
];

console.log(`\n✏️  Curando ${updates.length} colegios de San Luis${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

let ok = 0;
let failed = 0;

for (const { id, name, payload } of updates) {
  if (DRY_RUN) {
    console.log(`📋  [DRY RUN] ${name}`);
    ok++;
    continue;
  }

  const res = await fetch(`${API_BASE}/v1/schools/id/${id}/profile`, {
    method: "PATCH",
    headers: {
      "x-admin-key": ADMIN_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    console.log(`✅  ${name}`);
    ok++;
  } else {
    const text = await res.text();
    console.error(`❌  ${name} — ${res.status} ${text}`);
    failed++;
  }
}

console.log(`\n✨  Listo. OK: ${ok} | Fallidos: ${failed}\n`);
