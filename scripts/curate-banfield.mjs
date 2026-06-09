/**
 * Curación de colegios de Banfield (Lomas de Zamora)
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-banfield.mjs
 */
const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
if (!ADMIN_API_KEY) { console.error("❌  Falta ADMIN_API_KEY."); process.exit(1); }

// Excluidos: Babys Club (maternal), Colegio Boston Nivel Inicial (maternal),
// Colegio Westminster Maternal (maternal), Colegio Modelo Lomas Instituto Superior (SUPERIOR)

const updates = [
  { id: "cmpq36vv90523rn5q20yxub66", name: "Colegio Bertrand Russell", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Lleva el nombre de Bertrand Russell (1872–1970), filósofo, matemático y pacifista galés, Premio Nobel de Literatura en 1950. Defensor de la educación libre y el pensamiento crítico, su legado inspira esta institución laica con los tres niveles en Banfield, partido de Lomas de Zamora." } },
  { id: "cmq15wwft00kuqi31rk95qgml", name: "Colegio Westminster Maternal", payload: { levels: ["INICIAL"], description: "Nivel maternal del Complejo Educativo Westminster de Banfield, con tradición anglosajona y propuesta bilingüe español-inglés desde la primera infancia. Westminster —el barrio londinense sede del Parlamento británico— da nombre a esta institución de identidad británica en el sur del GBA." } },
  { id: "cmq15wwil00lnqi317xrbtpnu", name: "Colegio Westminster, Nivel Inicial", payload: { levels: ["INICIAL"], description: "Nivel inicial del Complejo Educativo Westminster de Banfield. Propuesta bilingüe español-inglés con metodología británica desde los tres años. Parte del trayecto educativo completo del Complejo Westminster en el partido de Lomas de Zamora." } },
  { id: "cmq15wwp600nfqi316ctjlf0z", name: "Colegio Westminster, Nivel Primario", payload: { levels: ["PRIMARIA"], description: "Nivel primario del Complejo Educativo Westminster de Banfield. Bilingüe español-inglés con currículo articulado con el resto de los niveles de la institución. Uno de los complejos de tradición anglosajona más reconocidos del partido de Lomas de Zamora." } },
  { id: "cmpq36w4u0574rn5q7rc64cqs", name: "Colegio Westminster, Nivel Secundario", payload: { levels: ["SECUNDARIA"], description: "Nivel secundario del Complejo Educativo Westminster de Banfield. Bachillerato bilingüe español-inglés con preparación para certificaciones internacionales. La continuidad desde el maternal hasta el secundario garantiza una formación integral con identidad anglosajona en Lomas de Zamora." } },
  { id: "cmq15wwwb00piqi31xorw27ha", name: "Colegio French", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Lleva el nombre del General Domingo French (1774–1825), protagonista de la Revolución de Mayo de 1810, quien distribuyó las cintas celestes y blancas el 25 de mayo. Colegio privado laico con los tres niveles y fuerte identidad patriótica en Banfield, partido de Lomas de Zamora." } },
  { id: "cmq15wwo400n4qi3167bswthj", name: "Colegio Ing. Edward Banfield", payload: { levels: ["SECUNDARIA"], description: "Lleva el nombre de Edward Banfield, el ingeniero inglés que trazó el ramal ferroviario que dio origen a la localidad. Instituto secundario privado laico con bachillerato completo e identidad histórica local en el partido de Lomas de Zamora." } },
  { id: "cmq15wwet00kjqi31usm0leao", name: "Colegio Modelo Banfield", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Institución de referencia en Banfield con décadas de trayectoria en el partido de Lomas de Zamora. Los tres niveles educativos con propuesta integral, inglés y actividades extracurriculares. Una de las instituciones privadas de mayor arraigo en la zona sur del Gran Buenos Aires." } },
  { id: "cmq15wwjn00lyqi31o8tzxmax", name: "Colegio Parroquial José Manuel Estrada", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Lleva el nombre de José Manuel Estrada (1842–1894), jurista e historiador argentino defensor de la educación religiosa frente a la Ley 1420. Fundador de la Liga de la Juventud Católica. Colegio parroquial de gestión católica con los tres niveles en Banfield, Lomas de Zamora." } },
  { id: "cmpq36vzh0542rn5qz41ponx7", name: "Colegio San Andrés", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Bajo el patronazgo del apóstol Andrés, el primer discípulo llamado por Jesús, patrono de Escocia y Rusia. Colegio privado de gestión católica con los tres niveles educativos en Banfield, partido de Lomas de Zamora, con énfasis en la formación en valores y la comunidad educativa." } },
  { id: "cmq15wwsz00olqi31tmowvfr1", name: "Colegio San Juan de la Cruz", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Bajo el patronazgo de San Juan de la Cruz (1542–1591), místico y poeta español, cofundador del Carmelo Descalzo. Doctor de la Iglesia. Colegio privado de gestión católica con los tres niveles en Banfield, Lomas de Zamora, con propuesta que integra espiritualidad y excelencia académica." } },
  { id: "cmpq36vzy054drn5qxdz1r9nh", name: "Colegio Tiempos Modernos", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "El nombre evoca la célebre película de Charles Chaplin (1936) y la necesidad de adaptar la educación a los desafíos contemporáneos. Colegio privado laico con los tres niveles en Banfield, con propuesta pedagógica innovadora orientada al mundo actual y sus transformaciones tecnológicas." } },
  { id: "cmq15wwuz00p7qi31zqtpgz09", name: "Instituto Club Atlético Banfield", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Vinculado al histórico Club Atlético Banfield, fundado en 1896, uno de los clubes más antiguos de Argentina. El 'Taladro' no solo forma deportistas sino ciudadanos. Instituto con los tres niveles que integra la identidad deportiva y comunitaria del club con la formación académica en Lomas de Zamora." } },
  { id: "cmq15wwtz00owqi31unn1i71m", name: "Instituto Nuestra Señora de Lourdes", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Bajo la advocación de Nuestra Señora de Lourdes, santuario del sur de Francia donde la Virgen se apareció a Bernadette Soubirous en 1858. Patrona de los enfermos. Instituto de gestión católica con los tres niveles en Banfield, partido de Lomas de Zamora." } },
  { id: "cmq15wwn100mtqi31vd8mphk6", name: "Instituto Ricardo Güiraldes", payload: { levels: ["SECUNDARIA"], description: "Lleva el nombre de Ricardo Güiraldes (1886–1927), autor de 'Don Segundo Sombra' (1926), la gran novela del gaucho argentino. Secundario privado laico en Banfield que honra la identidad literaria y rural argentina en el partido de Lomas de Zamora." } },
  { id: "cmq15wwr200o1qi316t325jcs", name: "Instituto Tucumán de Banfield", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Evoca a Tucumán, 'el jardín de la República', donde se declaró la Independencia Argentina el 9 de julio de 1816. Instituto privado laico con los tres niveles y fuerte identidad nacional en Banfield, partido de Lomas de Zamora, sur del Gran Buenos Aires." } }
];

async function patchSchool(id, name, payload) {
  const url = `${API_BASE}/v1/schools/id/${id}/profile`;
  const res = await fetch(url, { method: "PATCH", headers: { "content-type": "application/json", "x-admin-key": ADMIN_API_KEY }, body: JSON.stringify(payload) });
  if (res.ok) console.log(`✅  ${name}`);
  else console.error(`❌  ${name} — HTTP ${res.status}: ${await res.text()}`);
}

console.log(`\n🏫  Curando ${updates.length} colegios de Banfield...\n`);
for (const { id, name, payload } of updates) await patchSchool(id, name, payload);
console.log("\n✨  Listo.\n");
