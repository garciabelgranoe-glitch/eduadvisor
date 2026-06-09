/**
 * Curación de colegios de Avellaneda
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-avellaneda.mjs
 */
const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
if (!ADMIN_API_KEY) { console.error("❌  Falta ADMIN_API_KEY."); process.exit(1); }

// Excluidos: Instituto Superior de Profesorado Pío XII (SUPERIOR),
// INSTITUTO FRENCH jardín de Infantes (INICIAL maternal),
// Instituto Nicolás Avellaneda duplicado (cmpq2xlyb01utrn5q2cu7qdpo)

const updates = [
  { id: "cmq15vv4f00hbqi31m8v8q5he", name: "Centro Cristiano de Avellaneda", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Centro educativo de gestión cristiana evangélica con los tres niveles en el partido de Avellaneda. Propuesta que integra la formación académica con valores del Evangelio, educación emocional y proyecto comunitario. Una de las instituciones evangélicas de referencia del sur metropolitano bonaerense." } },
  { id: "cmq15vv7l00i8qi31owau641s", name: "Centro Educativo Club Atlético Independiente", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Vinculado al Club Atlético Independiente, el 'Rey de Copas' fundado en 1905, uno de los clubes más ganadores de América con siete Copas Libertadores. El escudo rojo y negro y los valores del deporte inspiran los tres niveles educativos de este centro único en el partido de Avellaneda." } },
  { id: "cmq15vuw300exqi31wwkue9ci", name: "Colegio Françoise Dolto", payload: { levels: ["PRIMARIA","SECUNDARIA"], description: "Lleva el nombre de Françoise Dolto (1908–1988), psicoanalista y pediatra francesa que revolucionó la comprensión de la infancia. Sus teorías sobre el deseo del niño transformaron la pedagogía moderna. Nivel primario y secundario en Avellaneda, con propuesta centrada en el sujeto aprendiente." } },
  { id: "cmq15vuut00emqi316ueotdsa", name: "Colegio María Auxiliadora", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Bajo la advocación de María Auxiliadora, popularizada por Don Bosco en 1862. Las Hijas de María Auxiliadora llevan la pedagogía salesiana. Colegio de gestión salesiana con los tres niveles en Avellaneda, con énfasis en la formación integral y el acompañamiento juvenil." } },
  { id: "cmq15vuzl00fuqi319083nyxd", name: "Colegio Pío XII", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Honra al Papa Pío XII (1876–1958), pontífice durante la Segunda Guerra Mundial y proclamador del dogma de la Asunción en 1950. Colegio privado de gestión católica con los tres niveles educativos en Avellaneda, con arraigo histórico en el partido del sur bonaerense." } },
  { id: "cmq15vuyk00fjqi31yokp2q0u", name: "Colegio San Martín", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Lleva el nombre del General José de San Martín (1778–1850), el Libertador que cruzó los Andes y liberó Argentina, Chile y Perú. Padre de la patria. Colegio privado laico con los tres niveles y fuerte identidad patriótica en el partido de Avellaneda." } },
  { id: "cmq15vv3h00h0qi3180bmcqou", name: "Colegio San Patricio", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Bajo el patronazgo de San Patricio (389–461), el misionero que evangelizó Irlanda y se convirtió en su patrono. El trébol —símbolo de la Trinidad— da identidad a la institución. Colegio privado con los tres niveles educativos en el partido de Avellaneda." } },
  { id: "cmq15vvca00jpqi31nalk03t7", name: "Instituto Adventista de Avellaneda", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Parte de la red educativa de la Iglesia Adventista del Séptimo Día en Argentina, presente desde 1894. La educación adventista integra lo intelectual, físico, espiritual y social. Los tres niveles con énfasis en salud integral y valores del Evangelio en el partido de Avellaneda." } },
  { id: "cmq15vuxd00f8qi31laz7wi1o", name: "Instituto Alfonsina Storni", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Lleva el nombre de Alfonsina Storni (1892–1938), la poeta suizo-argentina, voz del feminismo rioplatense. Sus versos la inmortalizaron en la literatura hispanoamericana. Los tres niveles educativos en Avellaneda con una institución que celebra la escritura y la identidad femenina." } },
  { id: "cmq15vutv00ebqi31otwilpfq", name: "Instituto Avellaneda", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Lleva el nombre del partido y de Nicolás Avellaneda (1837–1885), décimo presidente argentino y el más joven en asumir. Bajo su mandato se organizó el Estado moderno. Instituto privado laico con los tres niveles en el partido de Avellaneda, sur del GBA." } },
  { id: "cmq15vvaf00j5qi31y7fzaf83", name: "Instituto Espíritu Santo IES", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Consagrado al Espíritu Santo, tercera persona de la Trinidad cristiana. Instituto privado de gestión católica con los tres niveles educativos en Avellaneda, con propuesta que integra fe, razón y servicio comunitario en el sur del Gran Buenos Aires." } },
  { id: "cmq15vv8j00ijqi31ubss3fhc", name: "Instituto French Nivel Primario", payload: { levels: ["PRIMARIA"], description: "Nivel primario del Instituto French de Avellaneda. Lleva el nombre del Coronel Domingo French (1774–1825), protagonista de la Revolución de Mayo. Propuesta laica con formación integral y fuerte identidad patriótica en el partido de Avellaneda." } },
  { id: "cmq15vv9i00iuqi31hu8er5i7", name: "Instituto Nicolás Avellaneda", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Honra a Nicolás Avellaneda (1837–1885), el presidente más joven de la Argentina al asumir en 1874. Abogado, periodista y rector de la UBA, fue uno de los grandes organizadores del Estado argentino. Instituto privado laico con los tres niveles en el partido de Avellaneda." } },
  { id: "cmq15vv0j00g5qi31cm4i45ai", name: "Instituto Victoria Ocampo", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Lleva el nombre de Victoria Ocampo (1890–1979), escritora y editora fundadora de la revista Sur —la más influyente de América Latina en el siglo XX—. Primera mujer en ingresar a la Academia Argentina de Letras. Los tres niveles en Avellaneda." } },
  { id: "cmq15vv5h00hmqi316nh7krrm", name: "Loreto Educational Center", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Pertenece al Instituto de la Bienaventurada Virgen María (Loreto), fundado en 1609 por Mary Ward. Las Hermanas de Loreto llevan más de un siglo en Argentina. Los tres niveles con propuesta bilingüe y tradición católica en el partido de Avellaneda." } },
  { id: "cmq15vv1i00ggqi31g7rjtbag", name: "PH — Pedagogía Humanista", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "El nombre define su filosofía: la pedagogía humanista centra la educación en el desarrollo integral del ser humano. Institución laica con los tres niveles en Avellaneda que privilegia el autoconocimiento, la no-violencia y la solidaridad activa como bases de la formación." } }
];

async function patchSchool(id, name, payload) {
  const url = `${API_BASE}/v1/schools/id/${id}/profile`;
  const res = await fetch(url, { method: "PATCH", headers: { "content-type": "application/json", "x-admin-key": ADMIN_API_KEY }, body: JSON.stringify(payload) });
  if (res.ok) console.log(`✅  ${name}`);
  else console.error(`❌  ${name} — HTTP ${res.status}: ${await res.text()}`);
}

console.log(`\n🏫  Curando ${updates.length} colegios de Avellaneda...\n`);
for (const { id, name, payload } of updates) await patchSchool(id, name, payload);
console.log("\n✨  Listo.\n");
