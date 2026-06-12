/**
 * Curación de colegios de Río Gallegos.
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-rio-gallegos.mjs [--dry-run]
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const DRY_RUN = process.argv.includes("--dry-run");

if (!ADMIN_API_KEY) {
  console.error("❌  Falta ADMIN_API_KEY");
  process.exit(1);
}

const updates = [
  {
    id: "cmqb4jk9h00pk76vhaghzapdz",
    name: "Casa Salesiana Nuestra Señora de Luján",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "La Casa Salesiana Nuestra Señora de Luján es una de las instituciones educativas más antiguas y reconocidas de Río Gallegos, capital de la provincia de Santa Cruz. Con la impronta salesiana de Don Bosco, ofrece educación primaria y secundaria con una propuesta que integra la fe, el trabajo y la formación integral de los jóvenes patagónicos. Su larga trayectoria en la Patagonia austral la convierte en un pilar de la historia educativa y social de la región."
    }
  },
  {
    id: "cmqb4jkik00s076vhg021800m",
    name: "Centro Polivalente De Arte",
    payload: {
      levels: ["SECUNDARIA"],
      description: "El Centro Polivalente de Arte de Río Gallegos es una institución educativa artística provincial que ofrece formación secundaria con orientación en artes visuales, música, teatro y danza. Única en su tipo en la capital santacruceña, el CPA forma a jóvenes talentos patagónicos que encuentran en el arte un lenguaje de expresión y una vocación profesional. Su propuesta combina la formación técnico-artística con los contenidos del bachillerato, habilitando a sus egresados para el ingreso a estudios superiores de arte."
    }
  },
  {
    id: "cmqb4jkcv00qh76vhebhpa1a1",
    name: "Chacra Colegio Salesiano Juan Luzovec Sdb",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "La Chacra Colegio Salesiano Juan Luzovec es una institución educativa agraria salesiana de Río Gallegos que combina la formación académica con la enseñanza de las ciencias agropecuarias adaptadas al contexto patagónico. Con una chacra escuela como recurso pedagógico central, los alumnos aprenden las técnicas productivas de la región mientras reciben una formación en valores inspirada en el carisma de Don Bosco. Es una institución única en la Patagonia que forma jóvenes capaces de contribuir al desarrollo productivo de Santa Cruz."
    }
  },
  {
    id: "cmqb4jke400qs76vhhqjepr7n",
    name: "Colegio Industrial N°4 Jose Menendez",
    payload: {
      levels: ["SECUNDARIA"],
      description: "El Colegio Industrial N°4 José Menéndez de Río Gallegos es una institución técnica de referencia en la provincia de Santa Cruz que lleva el nombre del influyente empresario patagónico. Con orientaciones en electromecánica, electrónica y otras especialidades técnicas, forma técnicos altamente capacitados para el mercado laboral de la Patagonia austral, con fuerte demanda en los sectores petrolero, minero y de servicios. Su equipamiento moderno y su cuerpo docente técnico especializado garantizan una formación de calidad reconocida en toda la región."
    }
  },
  {
    id: "cmqb4jkap00pv76vhy9bpjtnd",
    name: "Colegio Maria Auxiliadora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio María Auxiliadora de Río Gallegos es una institución salesiana femenina que ofrece formación completa desde el nivel inicial hasta el secundario en la capital de Santa Cruz. Bajo el amparo de la Virgen María Auxiliadora, patrona de los salesianos, la institución brinda una educación que integra la fe, la cultura y la formación académica con especial atención al desarrollo de las jóvenes patagónicas. Con décadas de presencia en Río Gallegos, es una de las instituciones más queridas y respetadas de la comunidad santacruceña."
    }
  },
  {
    id: "cmqb4jk8f00p976vhx0a70696",
    name: "Colegio Nuestra Sra. de Fátima",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Nuestra Señora de Fátima de Río Gallegos es una institución católica que ofrece educación completa desde el jardín de infantes hasta la escuela secundaria en la capital de Santa Cruz. Bajo el patrocinio de la Virgen de Fátima, su propuesta pedagógica combina la formación en la fe con una exigente currícula académica que prepara a los alumnos para los estudios superiores. La institución es un referente de la educación privada religiosa en Río Gallegos con generaciones de familias santacruceñas que han pasado por sus aulas."
    }
  },
  {
    id: "cmqb4jk5300oc76vhxpulgsy8",
    name: "Colegio Poplars School",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Poplars School es el colegio bilingüe de referencia en Río Gallegos, ofreciendo una propuesta educativa completa con fuerte énfasis en el idioma inglés desde los primeros años. Su proyecto educativo combina la currícula argentina con estándares internacionales, preparando a los alumnos para desenvolverse con fluidez en contextos académicos y profesionales globales. Con instalaciones modernas y docentes bilingües, Poplars es la primera opción para las familias santacruceñas que buscan educación bilingüe de calidad."
    }
  },
  {
    id: "cmqb4jk7a00oy76vh75q53e2w",
    name: "Escuela del Viento",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "La Escuela del Viento de Río Gallegos lleva en su nombre la esencia del clima patagónico, convirtiéndolo en símbolo de fortaleza y adaptación. Con una propuesta pedagógica para el nivel inicial y primario que integra el entorno natural patagónico como recurso de aprendizaje, la institución forma a niños resilientes, curiosos y comprometidos con su territorio. Un espacio educativo que celebra la identidad patagónica y prepara a sus alumnos para los desafíos únicos de vivir en el extremo sur del mundo."
    }
  },
  {
    id: "cmqb4jk6800on76vhizj0zoiv",
    name: "Instituto de Educación Austro",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto de Educación Austro de Río Gallegos toma su nombre del latín que designa el sur, reivindicando la identidad austral de Santa Cruz. Ofrece educación primaria y secundaria con una propuesta académica actualizada que incorpora las particularidades geográficas, históricas y culturales de la Patagonia en su currícula. La institución es una opción valorada en Río Gallegos por su proyecto educativo con identidad regional y su compromiso con la formación de ciudadanos comprometidos con el desarrollo de la provincia."
    }
  },
  {
    id: "cmqb4jkw800vo76vhe39a3wvg",
    name: "Instituto IDAE",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Instituto IDAE (Instituto de Enseñanza) es una institución educativa privada de Río Gallegos que ofrece educación primaria y secundaria con una propuesta pedagógica flexible y personalizada. Con grupos reducidos y un seguimiento cercano de cada alumno, IDAE brinda un espacio de aprendizaje contenedor y exigente que se adapta a las necesidades individuales de cada estudiante. La institución es reconocida en la comunidad gallegüense por su ambiente familiar y su compromiso con el éxito académico de sus alumnos."
    }
  },
  {
    id: "cmqb4jk3y00o176vhvoiv0myf",
    name: "Instituto Privado de Educación Integral - IPEI",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Privado de Educación Integral (IPEI) de Río Gallegos ofrece una propuesta educativa completa desde el jardín maternal hasta el secundario, con énfasis en el desarrollo integral de cada alumno. Su nombre refleja el compromiso con una formación que va más allá de lo académico, incorporando la educación emocional, artística y física como pilares igualmente importantes. Con una comunidad educativa sólida y un equipo docente estable, el IPEI es una institución referente de la educación privada en la capital santacruceña."
    }
  },
  {
    id: "cmqb4jkgb00re76vh67oynazn",
    name: "Jardin de Infantes Juanito Bosco",
    payload: {
      levels: ["INICIAL"],
      description: "El Jardín de Infantes Juanito Bosco de Río Gallegos es un espacio salesiano de educación inicial que lleva con cariño el nombre del niño que sería San Juan Bosco. Con una propuesta pedagógica lúdica y afectiva, el jardín acompaña a los más pequeños de la comunidad gallegüense en sus primeros pasos escolares, fomentando la alegría, la solidaridad y el amor al aprendizaje. La impronta salesiana garantiza un ambiente acogedor donde cada niño es recibido con la misma ternura que caracterizó al Padre de los jóvenes."
    }
  },
  {
    id: "cmqb4jkql00u576vhgum5df2m",
    name: "Jardin de Infantes Medalla Milagrosa",
    payload: {
      levels: ["INICIAL"],
      description: "El Jardín de Infantes Medalla Milagrosa de Río Gallegos es una institución educativa de nivel inicial de inspiración mariana que brinda una educación temprana cálida y enriquecedora. Bajo el amparo de la Virgen de la Medalla Milagrosa, el jardín promueve los valores del amor, la confianza y la apertura al aprendizaje desde los primeros años de vida. Con docentes comprometidas y un ambiente de contención especialmente adaptado a las condiciones climáticas de la Patagonia, es una opción muy querida por las familias de Río Gallegos."
    }
  },
];

console.log(`\n✏️  Curando ${updates.length} colegios de Río Gallegos${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

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
