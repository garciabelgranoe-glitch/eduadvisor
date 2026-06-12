/**
 * Curación de colegios de Santiago del Estero.
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-santiago-del-estero.mjs [--dry-run]
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
    id: "cmqb4lny0019r76vhjn3ft64e",
    name: "Big Ben School",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Big Ben School es el colegio bilingüe de referencia en Santiago del Estero, capital de la provincia más antigua del interior argentino. Con una propuesta educativa completa desde el nivel inicial hasta el secundario y fuerte énfasis en el idioma inglés, prepara a los alumnos santiagueños para desenvolverse en un mundo globalizado. Su nombre evoca la tradición educativa británica y su propuesta combina los estándares académicos internacionales con el arraigo a la cultura e identidad santiagueña."
    }
  },
  {
    id: "cmqb4lnsx018j76vh115bxvhw",
    name: "Colegio Belén",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Belén de Santiago del Estero es una institución educativa católica que evoca en su nombre el lugar del nacimiento de Cristo, símbolo de esperanza y nuevo comienzo. Ofrece formación completa desde el nivel inicial hasta el secundario con una propuesta basada en los valores del Evangelio y una sólida exigencia académica. En una de las ciudades más antiguas de la Argentina, el Colegio Belén forma generaciones de familias santiagueñas con una identidad educativa consolidada y reconocida."
    }
  },
  {
    id: "cmqb4logs01dz76vh7ank65ti",
    name: "Colegio Espíritu Santo - Nivel Inicial",
    payload: {
      levels: ["INICIAL"],
      description: "El Colegio Espíritu Santo en su nivel inicial ofrece a los más pequeños de Santiago del Estero un ambiente educativo cargado de espiritualidad cristiana y calidez humana. Con docentes especializadas en educación temprana y una propuesta pedagógica inspirada en el carisma del Espíritu Santo, el jardín favorece el desarrollo integral de los niños en sus dimensiones cognitiva, afectiva, espiritual y social. La articulación con los niveles superiores del colegio garantiza una continuidad educativa coherente y enriquecedora."
    }
  },
  {
    id: "cmqb4lnrl018876vhcz73lotx",
    name: "Colegio Evangélico Alfredo Furniss Jardín de Infantes",
    payload: {
      levels: ["INICIAL"],
      description: "El Jardín de Infantes del Colegio Evangélico Alfredo Furniss de Santiago del Estero lleva el nombre de un misionero evangélico que contribuyó a la educación y evangelización de la región. Con una propuesta de nivel inicial basada en valores cristianos evangélicos, ofrece a los más pequeños un espacio de aprendizaje y crecimiento espiritual en la capital santiagueña. La institución es parte de una tradición educativa evangélica con presencia en el norte argentino que combina la formación académica temprana con el desarrollo de la fe."
    }
  },
  {
    id: "cmqb4lnu5018u76vha1xx2lwg",
    name: "Colegio Evangélico Santiago Canclini",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Evangélico Santiago Canclini de Santiago del Estero lleva el nombre de un destacado pastor y educador evangélico argentino, honrando la tradición protestante en la educación nacional. Ofrece formación completa desde el jardín de infantes hasta el secundario con valores cristiano-evangélicos y una currícula actualizada. La institución se destaca por su compromiso con la formación de ciudadanos íntegros, con sólida base espiritual y académica, preparados para contribuir al desarrollo de la antigua capital del Tucumán del Estero."
    }
  },
  {
    id: "cmqb4lo1v01ao76vhceout6lu",
    name: "Colegio Hermano Hermas de Bruijn",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Hermano Hermas de Bruijn de Santiago del Estero lleva el nombre de un hermano religioso que entregó su vida a la educación en la provincia, como homenaje a la misión educativa de las congregaciones religiosas en el norte argentino. Con educación primaria y secundaria, la institución forma a sus alumnos con los valores del servicio, la humildad y la dedicación al bien común que caracterizaron al hermano Hermas. La institución es un referente de la educación religiosa en Santiago del Estero."
    }
  },
  {
    id: "cmqb4lo6101bl76vhnviy4d21",
    name: "Colegio Intercultural del Estero",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio Intercultural del Estero de Santiago del Estero es una institución educativa pionera en la región que integra la diversidad cultural como eje de su propuesta pedagógica, reconociendo las raíces quichuas y criollas que definen la identidad santiagueña. Con formación completa desde el nivel inicial hasta el secundario, el colegio ofrece un espacio de encuentro entre culturas donde el quichua santiagueño y las tradiciones locales son valorados junto al conocimiento académico universal. Una institución única que celebra la riqueza cultural del interior profundo argentino."
    }
  },
  {
    id: "cmqb4lo3101az76vhsdz3c5c2",
    name: "Colegio La Asunción Hermanas Dominica",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio La Asunción de las Hermanas Dominicas de Santiago del Estero es una institución educativa femenina con una larga historia de formación académica y espiritual en la antigua capital del Tucumán del Estero. Siguiendo el carisma dominicano de búsqueda de la verdad y predicación, ofrece formación completa desde el nivel inicial hasta el secundario con especial atención al desarrollo intelectual y la vida de fe. Sus egresadas son reconocidas por su sólida formación académica y su compromiso con los valores humanos y evangélicos."
    }
  },
  {
    id: "cmqb4lo4a01ba76vh4lyqcyae",
    name: "Colegio Nacional Absalón Rojas",
    payload: {
      levels: ["SECUNDARIA"],
      description: "El Colegio Nacional Absalón Rojas de Santiago del Estero es uno de los colegios secundarios más históricos de la provincia, que lleva el nombre de un ilustre educador y político santiagueño del siglo XIX. Con un bachillerato completo y humanístico, la institución ha formado generaciones de dirigentes, profesionales e intelectuales que contribuyeron al desarrollo de la provincia. Su edificio histórico en el centro de Santiago del Estero es un símbolo del compromiso con la educación pública que data de los tiempos de la Organización Nacional."
    }
  },
  {
    id: "cmqb4lofn01do76vh3rapkovc",
    name: "Colegio San Gabriel",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio San Gabriel de Santiago del Estero lleva el nombre del arcángel mensajero, símbolo de la comunicación y el anuncio de las buenas nuevas, como inspiración de una educación que transmite valores y conocimiento. Con una propuesta completa desde el nivel inicial hasta el secundario, la institución combina la formación académica rigurosa con los valores espirituales que caracterizan a su carisma. En la ciudad de la madre de ciudades, el Colegio San Gabriel es una institución valorada por la tradición y el compromiso con la comunidad."
    }
  },
  {
    id: "cmqb4lo8t01c776vhy7m8m55c",
    name: "Colegio San Jose",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Colegio San José de Santiago del Estero es una institución educativa católica de larga trayectoria en la capital provincial que lleva el nombre del Patriarca de la Sagrada Familia como modelo de responsabilidad y servicio. Con una propuesta educativa completa para los tres niveles de escolaridad, el colegio forma a sus alumnos en la excelencia académica y los valores humanos y cristianos. En una ciudad con profunda raigambre religiosa como Santiago del Estero, el Colegio San José es un referente histórico de la educación privada."
    }
  },
  {
    id: "cmqb4loa401ci76vhhf1fr136",
    name: "Escuela 718 Maria Auxiliadora",
    payload: {
      levels: ["PRIMARIA"],
      description: "La Escuela 718 María Auxiliadora de Santiago del Estero es una institución de educación primaria de gestión privada que lleva el nombre de la Virgen patrona de los salesianos. Con una propuesta pedagógica que integra los valores de la educación salesiana con una formación académica actualizada, la escuela acompaña a los niños santiagueños en su educación primaria con calidez y compromiso. La institución es parte de la red educativa salesiana que tiene presencia en las provincias del noroeste argentino."
    }
  },
  {
    id: "cmqb4lo7h01bw76vhqbdhjj9x",
    name: "Escuela del Centenario",
    payload: {
      levels: ["PRIMARIA", "SECUNDARIA"],
      description: "La Escuela del Centenario de Santiago del Estero es una institución educativa de profunda raigambre histórica en la provincia más antigua de la Argentina. Con una propuesta educativa para los niveles primario y secundario, la institución lleva en su nombre la celebración de los cien años de historia que marcan a una comunidad educativa comprometida con la transmisión de valores y conocimiento a través del tiempo. Su historia centenaria la convierte en un símbolo del progreso educativo de Santiago del Estero."
    }
  },
  {
    id: "cmqb4lnvi019576vhfhj10kks",
    name: "Instituto La Sagrada Familia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto La Sagrada Familia de Santiago del Estero toma como modelo el hogar de Nazaret para guiar una propuesta educativa que valora profundamente la familia, el amor y la fe. Con formación completa desde el nivel inicial hasta el secundario, la institución integra los valores familiares y evangélicos en una currícula académica exigente. En una provincia con fuerte identidad religiosa como Santiago del Estero, el Instituto La Sagrada Familia es un referente de la educación católica con profunda inserción comunitaria."
    }
  },
  {
    id: "cmqb4lnzc01a276vh2sxesthm",
    name: "Instituto Madre Mercedes Guerra",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto Madre Mercedes Guerra de Santiago del Estero lleva el nombre de una figura religiosa destacada en la historia educativa de la provincia, honrando su legado de entrega y vocación educativa. Con una propuesta completa desde el nivel inicial hasta el secundario, la institución forma a sus alumnos con los valores de consagración, servicio y excelencia que caracterizaron a su patrona. La institución es una referencia de la educación religiosa femenina en la capital santiagueña."
    }
  },
  {
    id: "cmqb4lo0k01ad76vho6d884ho",
    name: "Instituto San Pedro Nolasco",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "El Instituto San Pedro Nolasco de Santiago del Estero lleva el nombre del fundador de la Orden de los Mercedarios, patronos de la liberación y la redención humana. Con una propuesta educativa completa desde el jardín de infantes hasta el secundario, la institución integra los valores mercedarios de libertad, justicia y servicio en una formación académica actualizada. En la ciudad más antigua del interior argentino, el Instituto San Pedro Nolasco es un referente de la tradición educativa de las órdenes religiosas en el noroeste del país."
    }
  },
  {
    id: "cmqb4lobd01ct76vhkpsfyf0t",
    name: "Instituto Superior Monseñor Jorge Gottau",
    payload: {
      levels: ["SUPERIOR"],
      description: "El Instituto Superior Monseñor Jorge Gottau de Santiago del Estero lleva el nombre de un destacado obispo de la diócesis que contribuyó al desarrollo espiritual y social de la provincia. Ofrece carreras de nivel terciario orientadas a la formación docente y profesional, contribuyendo al desarrollo del capital humano de Santiago del Estero. Su propuesta de educación superior combina la excelencia académica con los valores de la misión educativa de la Iglesia Católica en una de las provincias más antiguas del país."
    }
  },
  {
    id: "cmqb4lnwr019g76vhaff4kwih",
    name: "Mater Dei - Educación Oficial",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Mater Dei (Madre de Dios) es una institución educativa de Santiago del Estero que lleva en su nombre la advocación mariana más antigua de la tradición cristiana, símbolo de amparo y protección. Con una propuesta educativa oficial completa desde el nivel inicial hasta el secundario, integra la fe y los valores cristianos con una currícula que responde a los estándares educativos de la provincia. La institución es valorada en Santiago del Estero por su ambiente contenedor y su compromiso con la formación integral de cada alumno."
    }
  },
  {
    id: "cmqb4loeh01dd76vhhd82rypu",
    name: "Niños Por Un Mundo Mejor",
    payload: {
      levels: ["INICIAL", "PRIMARIA"],
      description: "Niños Por Un Mundo Mejor es una institución educativa de Santiago del Estero cuyo nombre sintetiza una visión transformadora de la educación como herramienta para construir una sociedad más justa. Con niveles inicial y primario, la institución forma a los más pequeños con valores de solidaridad, respeto al ambiente y compromiso social, cultivando desde temprana edad la conciencia de que cada persona puede aportar a un mundo mejor. En el contexto santiagueño, la institución representa una apuesta por la esperanza y el cambio social a través de la educación."
    }
  },
];

console.log(`\n✏️  Curando ${updates.length} colegios de Santiago del Estero${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

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
