/**
 * Curación de colegios de Quilmes
 * Uso: ADMIN_API_KEY=<key> node scripts/curate-quilmes.mjs
 */

const API_BASE = "https://eduadvisor-production.up.railway.app";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) { console.error("❌  Falta ADMIN_API_KEY."); process.exit(1); }

const updates = [
  {
    id: "cmpq37we1057rrn5qvr1eqgay",
    name: "Colegio Alemán Eduardo L. Holmberg",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe alemán-español de Quilmes que lleva el nombre del naturalista y escritor Eduardo Ladislao Holmberg, explorador de la Patagonia y figura del pensamiento científico argentino del siglo XIX. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la rigurosidad científica y la cultura germanoparlante con la identidad bonaerense. Una institución con tradición alemana y arraigo en el sur del GBA."
    }
  },
  {
    id: "cmpq37whm059wrn5qtc7ha9jj",
    name: "Colegio Ausonia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes cuyo nombre evoca a Ausonia, nombre poético de Italia en la antigüedad clásica. Ofrece los niveles inicial, primario y secundario con una propuesta que celebra la herencia cultural italiana tan presente en el sur del Gran Buenos Aires. Con una comunidad educativa comprometida, forma alumnos con identidad cultural, rigor académico y calidez humana."
    }
  },
  {
    id: "cmpq37wv605hsrn5q794pjxsi",
    name: "Colegio Del Alto Sol",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes con los niveles inicial, primario y secundario. Su nombre evoca el sol en lo alto del cielo, símbolo de plenitud, claridad y energía. El Colegio Del Alto Sol ofrece una propuesta educativa que aspira a iluminar el potencial de cada alumno con calidez, excelencia y una visión optimista del futuro. Una institución valorada en la comunidad quilmeña por su clima institucional."
    }
  },
  {
    id: "cmpq37wrd05fprn5q73timr8p",
    name: "Colegio Nuestra Señora de Lourdes",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Quilmes bajo la advocación de Nuestra Señora de Lourdes, la Virgen que se apareció a Bernadette Soubirous en Francia en 1858. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción a la Virgen de Lourdes con una formación académica de calidad. Una institución con arraigo en la devoción mariana más popular del sur del GBA."
    }
  },
  {
    id: "cmpq37wvw05i3rn5qssvrje0m",
    name: "Colegio Privado Bernal",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes con los niveles inicial, primario y secundario, con arraigo en la localidad de Bernal. El Colegio Privado Bernal ofrece una propuesta educativa integral orientada a las familias del sur del GBA, combinando calidad académica con cercanía comunitaria. Una institución reconocida en la comunidad bernalense por su compromiso con el desarrollo de cada alumno."
    }
  },
  {
    id: "cmpq37wxg05j0rn5qgmbjxwu8",
    name: "Colegio Privado Juan Bautista Alberdi",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes que lleva el nombre del jurista tucumano Juan Bautista Alberdi, autor de las Bases que inspiraron la Constitución Argentina de 1853. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia la formación cívica, el derecho y la historia constitucional argentina. Una institución con identidad republicana en el sur del Gran Buenos Aires."
    }
  },
  {
    id: "cmpq37wf2058drn5qmmqr5t6p",
    name: "Colegio Sagrado Corazón de Jesús - Primaria",
    payload: {
      levels: ["PRIMARIA"],
      description: "Institución de educación primaria privada católica de Quilmes bajo la advocación del Sagrado Corazón de Jesús. Ofrece la educación primaria completa con una espiritualidad centrada en el amor de Cristo y una formación académica sólida. Con historia en la comunidad quilmeña, es una referencia de la educación católica en el sur del GBA valorada por las familias por su clima espiritual y su excelencia."
    }
  },
  {
    id: "cmpq37wj605atrn5qbqjg1amt",
    name: "Colegio Sagrado Corazón de Jesús - Secundaria",
    payload: {
      levels: ["SECUNDARIA"],
      description: "Institución de educación secundaria privada católica de Quilmes bajo la advocación del Sagrado Corazón de Jesús. Ofrece el bachillerato con una propuesta orientada al ingreso universitario y la formación integral del adolescente desde una perspectiva de fe. Con tradición en la comunidad quilmeña, prepara egresados con solidez académica y valores evangélicos para los desafíos de la vida universitaria y profesional."
    }
  },
  {
    id: "cmpq37wg6058zrn5q24tyvfgp",
    name: "Colegio Sagrado Corazón de Jesús - Jardín",
    payload: {
      levels: ["INICIAL"],
      description: "Jardín de infantes privado católico de Quilmes bajo la advocación del Sagrado Corazón de Jesús. Atiende niños de 2 a 5 años con una propuesta de nivel inicial que integra la espiritualidad del Sagrado Corazón con el juego, el desarrollo afectivo y la exploración creativa. Parte del complejo educativo del Sagrado Corazón quilmeño, ofrece continuidad pedagógica desde la primera infancia."
    }
  },
  {
    id: "cmpq37woq05e6rn5q3glspkh1",
    name: "Colegio San Clemente",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Quilmes bajo el patronazgo de San Clemente, papa mártir del siglo I y símbolo de la fidelidad a la fe en tiempos de persecución. Ofrece los niveles inicial, primario y secundario con una propuesta que integra el testimonio cristiano con una formación académica actualizada. Una institución con identidad apostólica y compromiso con la comunidad del sur del GBA."
    }
  },
  {
    id: "cmpq37wqg05f3rn5qc7bkji4b",
    name: "Colegio San Felipe Benizi",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada servita de Quilmes bajo el patronazgo de San Felipe Benizi, figura de la Orden de los Siervos de María. Ofrece los niveles inicial, primario y secundario con la espiritualidad servita orientada al servicio y la devoción a la Virgen María. Una institución con carisma mariano y compromiso educativo valorada por las familias quilmeñas por su clima espiritual y su propuesta integral."
    }
  },
  {
    id: "cmpq37wjo05b4rn5q9325lwyp",
    name: "Colegio San José de las Hermanas de Nuestra Señora del Rosario",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes dirigida por las Hermanas de Nuestra Señora del Rosario, bajo el patronazgo de San José. Ofrece los niveles inicial, primario y secundario con una propuesta que combina la espiritualidad rosariana y josefina con una formación académica de calidad. Con historia en la comunidad quilmeña, es una institución reconocida por su clima espiritual y su compromiso con las familias."
    }
  },
  {
    id: "cmpq37wwz05iprn5qysnwyuvz",
    name: "El Mariano Moreno - Quilmes",
    payload: {
      levels: ["SECUNDARIA"],
      description: "Institución de educación secundaria a distancia de Quilmes bajo el nombre del prócer Mariano Moreno. Ofrece el bachillerato en modalidad flexible para adultos y jóvenes que por razones laborales o personales no pudieron completar sus estudios secundarios en tiempo y forma. Una propuesta inclusiva que democratiza el acceso al título secundario en el sur del Gran Buenos Aires."
    }
  },
  {
    id: "cmpq37wh4059lrn5qmisg1sm6",
    name: "Escuela CIMDIP & Miguel Cané",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes con los niveles inicial, primario y secundario. La Escuela CIMDIP & Miguel Cané lleva el nombre del escritor y político argentino Miguel Cané, autor de Juvenilia. Ofrece una propuesta educativa con historia y arraigo en la comunidad del sur del GBA, comprometida con la calidad académica y la formación integral de sus alumnos."
    }
  },
  {
    id: "cmpq37wnb05d9rn5qegtgajwr",
    name: "Escuela de la Aurora",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes con los niveles inicial, primario y secundario. La Aurora, primera luz del día, inspira una propuesta pedagógica orientada al comienzo, la esperanza y el potencial de cada nuevo día escolar. La Escuela de la Aurora forma alumnos con optimismo, curiosidad y motivación para crecer, en la vibrante comunidad educativa del sur del Gran Buenos Aires."
    }
  },
  {
    id: "cmpq37woa05dvrn5q6rud007b",
    name: "Escuela de la Victoria",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes con los niveles inicial, primario y secundario. La Victoria como nombre evoca el triunfo del esfuerzo y la perseverancia. La Escuela de la Victoria forma alumnos con determinación, resiliencia y confianza en sus propias capacidades, valores especialmente importantes en una comunidad del sur del GBA con una rica historia de lucha y superación."
    }
  },
  {
    id: "cmpq37wqy05fern5qxtb5p63e",
    name: "Escuela del Encuentro",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes con los niveles inicial, primario y secundario. La Escuela del Encuentro pone el vínculo, el diálogo y la construcción colectiva del conocimiento como ejes de su propuesta pedagógica. En una sociedad cada vez más individualista, forma alumnos con capacidad de encuentro genuino con el otro, el saber y la comunidad del sur del GBA."
    }
  },
  {
    id: "cmpq37wpv05esrn5qsnqjwsfl",
    name: "Escuela Italo Argentina San Mauro",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada ítalo-argentina de Quilmes bajo el patronazgo de San Mauro, discípulo de San Benito. Ofrece los niveles inicial, primario y secundario con una propuesta bilingüe español-italiano que celebra la herencia cultural italiana tan presente en el sur del GBA. Una escuela con alma ítala y compromiso educativo en el corazón de la comunidad italiana quilmeña."
    }
  },
  {
    id: "cmpq37wxz05jbrn5q9vf3s33j",
    name: "IMPA",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes con los niveles inicial, primario y secundario. El IMPA ofrece una propuesta educativa integral orientada al desarrollo académico y personal de sus alumnos en el sur del Gran Buenos Aires. Con compromiso docente y una comunidad educativa activa, forma alumnos preparados para los desafíos de la continuidad educativa y la vida ciudadana."
    }
  },
  {
    id: "cmpq37wu405h6rn5qkdgnv46b",
    name: "INNOVA",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes con los niveles inicial, primario y secundario. INNOVA propone una pedagogía orientada a la innovación, el pensamiento creativo y las competencias del siglo XXI. Su nombre refleja una visión educativa que abraza el cambio, la tecnología y la creatividad como herramientas para formar alumnos capaces de transformar su entorno en el sur del Gran Buenos Aires."
    }
  },
  {
    id: "cmpq37wla05c1rn5qfldoasw3",
    name: "Instituto Alexander Fleming",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes que lleva el nombre del bacteriólogo escocés Alexander Fleming, descubridor de la penicilina y Premio Nobel de Medicina 1945. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia las ciencias naturales, la experimentación y el método científico. Una institución que inspira a sus alumnos con el ejemplo del científico que transformó la medicina moderna."
    }
  },
  {
    id: "cmpq37wnu05dkrn5qjims8365",
    name: "Instituto Buckingham Quilmes",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Instituto bilingüe privado de Quilmes con los niveles inicial, primario y secundario. Buckingham, nombre que evoca el palacio real británico y la tradición educativa anglosajona, ofrece una propuesta de educación en inglés con estándares internacionales. Una institución consolidada en el bilingüismo del sur del GBA, preparando alumnos para el mundo global desde la comunidad quilmeña."
    }
  },
  {
    id: "cmpq37wtn05gvrn5qtdrj9llt",
    name: "Instituto Cristo Rey",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Quilmes bajo la advocación de Cristo Rey. Ofrece los niveles inicial, primario y secundario con una espiritualidad que celebra el señorío de Cristo sobre toda la vida. Con arraigo en la comunidad quilmeña, forma alumnos con liderazgo, servicio y valores evangélicos, en una institución que pone a Cristo como centro de la propuesta educativa."
    }
  },
  {
    id: "cmpq37wem0582rn5qoyjvaxwj",
    name: "Instituto Enrico Fermi",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes que lleva el nombre del físico italiano Enrico Fermi, Premio Nobel de Física 1938 y padre de la era nuclear. Ofrece los niveles inicial, primario y secundario con una propuesta que privilegia las ciencias exactas, la física y la matemática como herramientas de comprensión del universo. Una institución que inspira a sus alumnos con el ejemplo de uno de los físicos más brillantes del siglo XX."
    }
  },
  {
    id: "cmpq37wsi05g9rn5q0kob73h0",
    name: "Instituto Jean Piaget",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes que lleva el nombre del psicólogo suizo Jean Piaget, padre del constructivismo y referente de la pedagogía del siglo XX. Ofrece los niveles inicial, primario y secundario con una propuesta inspirada en la psicología del desarrollo que pone al alumno como constructor activo de su propio conocimiento. Una institución con identidad pedagógica científica en el sur del GBA."
    }
  },
  {
    id: "cmpq37wpc05ehrn5qltouks5x",
    name: "Instituto La Providencia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Quilmes bajo la advocación de la Divina Providencia. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la confianza en la providencia de Dios con una formación académica actualizada. Con arraigo en la comunidad quilmeña, forma alumnos con fe, confianza en el futuro y preparación sólida para los desafíos de la vida."
    }
  },
  {
    id: "cmpq37wi305a7rn5qv07vywwg",
    name: "Instituto Manuel Belgrano - Constancio Vigil",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes que combina el legado del prócer Manuel Belgrano con el del escritor y educador uruguayo Constancio C. Vigil, creador de la revista Billiken. Ofrece los niveles inicial, primario y secundario con una propuesta que une la formación patriótica y la educación a través de la literatura infantil. Una institución con doble identidad histórica en el sur del Gran Buenos Aires."
    }
  },
  {
    id: "cmpq37wum05hhrn5qhnngmaqy",
    name: "Instituto Monseñor Emilio Di Pasquo",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Quilmes que lleva el nombre del Monseñor Emilio Di Pasquo, figura pastoral relevante de la diócesis de Quilmes. Ofrece los niveles inicial, primario y secundario con una propuesta que honra la memoria de su patrono a través de una educación comprometida con la fe, el servicio y la formación integral. Una institución con identidad diocesana quilmeña."
    }
  },
  {
    id: "cmpq37wma05cnrn5qif6o5emk",
    name: "Instituto Nuestra Señora de Fátima - Secundaria",
    payload: {
      levels: ["SECUNDARIA"],
      description: "Institución de educación secundaria privada de Quilmes bajo la advocación de Nuestra Señora de Fátima, la Virgen que se apareció en Portugal en 1917. Ofrece el bachillerato con una propuesta que integra la devoción mariana con una formación académica orientada al ingreso universitario. Una institución con arraigo en la devoción a la Virgen de Fátima en la comunidad católica quilmeña."
    }
  },
  {
    id: "cmpq37wwh05iern5q1v2lp5d0",
    name: "Instituto Privado Joaquín V. González",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes que lleva el nombre del jurista y educador riojano Joaquín V. González, fundador de la Universidad Nacional de La Plata. Ofrece los niveles inicial, primario y secundario con una propuesta que reivindica el legado educativo y universitario de González, formando alumnos con vocación por el saber, la justicia y el servicio público en el sur del GBA."
    }
  },
  {
    id: "cmpq37wdd057grn5q2hz0p3uy",
    name: "Instituto Sagrada Familia",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Quilmes bajo la advocación de la Sagrada Familia de Nazaret. Ofrece los niveles inicial, primario y secundario con una propuesta que toma a Jesús, María y José como modelo de vida comunitaria y familiar. Su espiritualidad josefino-mariana se traduce en una educación que involucra activamente a las familias y forma alumnos con valores sólidos en el sur del GBA."
    }
  },
  {
    id: "cmpq37wls05ccrn5qf3rpcswy",
    name: "Instituto San Alfonso",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada redentorista de Quilmes bajo el patronazgo de San Alfonso María de Ligorio, fundador de los Redentoristas y Doctor de la Iglesia. Ofrece los niveles inicial, primario y secundario con la espiritualidad redentorista centrada en la misión, la conversión y la alegría del evangelio. Una institución que forma alumnos con fe misionera y compromiso social en el sur del GBA."
    }
  },
  {
    id: "cmpq37wkn05bqrn5q9mf1grdy",
    name: "Instituto San Gabriel",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada de Quilmes bajo el patronazgo de San Gabriel Arcángel, mensajero de Dios y patrono de las comunicaciones. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la fe cristiana con una formación académica de calidad. Con arraigo en la comunidad quilmeña, es una institución reconocida por su clima cálido y su compromiso con el desarrollo integral del alumno."
    }
  },
  {
    id: "cmpq37wfk058orn5q3fe42vaf",
    name: "Instituto Santa María",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada católica de Quilmes bajo la advocación de Santa María, Madre de Dios. Ofrece los niveles inicial, primario y secundario con una propuesta que integra la devoción mariana con una formación académica actualizada. Con arraigo en la comunidad quilmeña, es una institución valorada por su clima espiritual, el acompañamiento personalizado y el trabajo conjunto entre familias y docentes."
    }
  },
  {
    id: "cmpq37wk505bfrn5qsdz18ctq",
    name: "Jardín Nuestra Señora de Lourdes",
    payload: {
      levels: ["INICIAL"],
      description: "Jardín de infantes privado católico de Quilmes bajo la advocación de Nuestra Señora de Lourdes. Atiende niños de 2 a 5 años con una propuesta de nivel inicial que integra la devoción mariana con el juego, el desarrollo afectivo y la exploración creativa. Un espacio cálido y de fe donde los más pequeños quilmeños dan sus primeros pasos escolares acompañados por la Virgen de Lourdes."
    }
  },
  {
    id: "cmpq37wt405gkrn5q0ollpete",
    name: "Profesorado de Educación Física e Inicial",
    payload: {
      levels: ["SUPERIOR"],
      description: "Instituto de educación superior de Quilmes especializado en la formación docente en educación física y educación inicial. Forma profesores con competencias pedagógicas sólidas para los niveles inicial y primario, respondiendo a la demanda de docentes especializados en el sur del GBA. Una institución comprometida con la calidad de la formación docente y el desarrollo del sistema educativo bonaerense."
    }
  },
  {
    id: "cmpq37wmt05cyrn5qj1v9x7hl",
    name: "Quilmes High School",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución bilingüe privada de Quilmes con los niveles inicial, primario y secundario. Quilmes High School lleva con orgullo el nombre de la ciudad que lo alberga y ofrece una propuesta de educación en inglés con estándares internacionales. Una institución de referencia en el bilingüismo del sur del GBA, que une la identidad quilmeña con una formación global de calidad."
    }
  },
  {
    id: "cmpq37wio05airn5q3gftqnc3",
    name: "Santa Teresita",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Institución privada carmelita de Quilmes bajo el patronazgo de Santa Teresita del Niño Jesús, Doctora de la Iglesia y patrona de las misiones. Ofrece los niveles inicial, primario y secundario con la espiritualidad del camino pequeño, centrada en la entrega amorosa en los actos cotidianos. Una institución que forma alumnos con profundidad espiritual y ternura humana en el sur del Gran Buenos Aires."
    }
  },
  {
    id: "cmpq37wgo059arn5q8esoas9e",
    name: "St George's College - Quilmes Campus",
    payload: {
      levels: ["INICIAL", "PRIMARIA", "SECUNDARIA"],
      description: "Campus quilmeño del St George's College, una de las instituciones bilingües más prestigiosas de la Argentina con más de 130 años de historia. Ofrece los niveles inicial, primario y secundario con una propuesta de educación en inglés con estándares internacionales y una sólida tradición anglosajona. Una referencia histórica del bilingüismo en el GBA sur para familias que buscan excelencia educativa con proyección global."
    }
  }
];

async function patchSchool(id, name, payload) {
  const url = `${API_BASE}/v1/schools/id/${id}/profile`;
  const res = await fetch(url, { method: "PATCH", headers: { "content-type": "application/json", "x-admin-key": ADMIN_API_KEY }, body: JSON.stringify(payload) });
  if (res.ok) { console.log(`✅  ${name}`); } else { const body = await res.text(); console.error(`❌  ${name} — HTTP ${res.status}: ${body}`); }
}

console.log(`\n🏫  Curando ${updates.length} colegios de Quilmes...\n`);
for (const { id, name, payload } of updates) { await patchSchool(id, name, payload); }
console.log("\n✨  Listo.\n");
