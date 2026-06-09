/**
 * Curación de colegios de Temperley (Lomas de Zamora)
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-temperley.mjs
 */
const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
if (!ADMIN_API_KEY) { console.error("❌  Falta ADMIN_API_KEY."); process.exit(1); }

// Excluidos: Instituto Superior Del Libertador (SUPERIOR),
// Jardin Colegio Aleman (INICIAL maternal), Jardín Colegio Generación (INICIAL maternal),
// Jardín Maternal William Shakespeare (INICIAL maternal)

const updates = [
  { id: "cmpybpcqt00c9tjf13k9aezv9", name: "Colegio Alemán de Temperley", payload: { levels: ["PRIMARIA"], description: "Institución bilingüe español-alemán con tradición en Temperley, partido de Lomas de Zamora. Reflejo de la comunidad germana del sur del GBA. La pedagogía alemana —rigor, disciplina y humanismo— se integra con la propuesta argentina en el nivel primario, con reconocimiento del Goethe Institut." } },
  { id: "cmpybpcyj00ectjf1yzhfm5y7", name: "Colegio Asunción de María", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Bajo la advocación de la Asunción de María, dogma proclamado por Pío XII en 1950. Fiesta central del calendario católico el 15 de agosto. Colegio de gestión católica con los tres niveles en Temperley, partido de Lomas de Zamora, con fuerte arraigo comunitario en el sur del GBA." } },
  { id: "cmpybpd2n00fktjf19m31ajlj", name: "Colegio Cervantes", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Lleva el nombre de Miguel de Cervantes (1547–1616), autor del Quijote, la primera novela moderna. Colegio privado laico con los tres niveles en Temperley, con énfasis en la lengua española y la identidad cultural hispanoamericana en el partido de Lomas de Zamora." } },
  { id: "cmpybpct200cvtjf1m33xz7mk", name: "Colegio Club Temperley", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Vinculado al Club Temperley, institución deportiva y social del partido de Lomas de Zamora con historia centenaria. La integración de la vida deportiva con la educación formal define su propuesta. Los tres niveles educativos con la identidad comunitaria del club local." } },
  { id: "cmpybpczj00entjf1qfmyrzkd", name: "Colegio Eccleston", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Colegio bilingüe con identidad anglosajona y los tres niveles educativos en Temperley. Eccleston evoca la tradición victoriana londinense. Propuesta español-inglés con años de trayectoria en el partido de Lomas de Zamora, en el sur del Gran Buenos Aires." } },
  { id: "cmpybpcrw00cktjf1oodn1gl2", name: "Colegio Modelo San José", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Bajo el patronazgo de San José, esposo de María y padre adoptivo de Jesús, patrono de los trabajadores. Colegio privado de gestión católica con los tres niveles y décadas de trayectoria como institución de referencia en Temperley, partido de Lomas de Zamora." } },
  { id: "cmpybpd0k00eytjf1pielzobr", name: "Colegio Nuestra Señora del Huerto Temperley", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Pertenece a las Hijas de la Cruz. Nuestra Señora del Huerto —María en el jardín— es la advocación que inspira su propuesta. Colegio de gestión religiosa con los tres niveles y larga presencia en Temperley, partido de Lomas de Zamora." } },
  { id: "cmpybpcxi00e1tjf1i5i7fdxj", name: "Colegio Primario Raíces", payload: { levels: ["PRIMARIA"], description: "El nombre evoca las raíces como fundamento del crecimiento. Colegio primario privado laico en Temperley con propuesta pedagógica que prioriza la construcción de bases sólidas en lectura, escritura y pensamiento matemático como cimientos para toda la trayectoria educativa." } },
  { id: "cmpybpcwd00dqtjf1u0cv4t0h", name: "Colegio Santa Rosa", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Bajo el patronazgo de Santa Rosa de Lima (1586–1617), primera santa nacida en América y patrona de América Latina. Dominica terciaria, canonizada en 1671. Colegio privado de gestión católica con los tres niveles en Temperley, partido de Lomas de Zamora." } },
  { id: "cmpybpd4m00g6tjf1bepzpocu", name: "Colegio Thomas Jefferson", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Lleva el nombre de Thomas Jefferson (1743–1826), tercer presidente de los Estados Unidos y autor de la Declaración de Independencia. Colegio bilingüe español-inglés con los tres niveles educativos en Temperley, partido de Lomas de Zamora." } },
  { id: "cmpybpd1m00f9tjf1n82qwd1j", name: "Colegio William Shakespeare", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Lleva el nombre de William Shakespeare (1564–1616), el mayor dramaturgo de la lengua inglesa. Sus obras son pilares de la literatura universal. Colegio bilingüe español-inglés con los tres niveles en Temperley, partido de Lomas de Zamora." } },
  { id: "cmpq36vua051hrn5qjz80w72g", name: "Instituto Juan XXIII", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Honra al Papa Juan XXIII (1881–1963), el 'Papa Bueno' que convocó el Concilio Vaticano II. Canonizado en 2014. Instituto privado de gestión católica con los tres niveles en Temperley, partido de Lomas de Zamora." } },
  { id: "cmpybpd3m00fvtjf1iai6olti", name: "San Albano", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Bajo el patronazgo de San Albano, primer mártir cristiano de Bretaña (siglo III) y protomártir de Inglaterra. La tradición anglicana inspira su propuesta bilingüe español-inglés con los tres niveles educativos en Temperley, partido de Lomas de Zamora." } },
  { id: "cmpybpd5n00ghtjf1ppg9wv4q", name: "Santa María Goretti", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Honra a Santa María Goretti (1890–1902), mártir canonizada por Pío XII en 1950 ante la mayor multitud de la historia de la Iglesia hasta ese momento. Símbolo de la misericordia. Colegio de gestión católica con los tres niveles en Temperley, Lomas de Zamora." } },
  { id: "cmpq36w370567rn5qjoke8ajz", name: "Instituto Lomas de Zamora Cooperativa", payload: { levels: ["INICIAL","PRIMARIA","SECUNDARIA"], description: "Instituto educativo de gestión cooperativa en Lomas de Zamora. La estructura cooperativa implica participación activa de familias y docentes en la gestión. Los tres niveles con propuesta que refleja los valores de la economía solidaria y la educación democrática." } }
];

async function patchSchool(id, name, payload) {
  const url = `${API_BASE}/v1/schools/id/${id}/profile`;
  const res = await fetch(url, { method: "PATCH", headers: { "content-type": "application/json", "x-admin-key": ADMIN_API_KEY }, body: JSON.stringify(payload) });
  if (res.ok) console.log(`✅  ${name}`);
  else console.error(`❌  ${name} — HTTP ${res.status}: ${await res.text()}`);
}

console.log(`\n🏫  Curando ${updates.length} colegios de Temperley...\n`);
for (const { id, name, payload } of updates) await patchSchool(id, name, payload);
console.log("\n✨  Listo.\n");
