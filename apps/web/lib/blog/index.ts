import type { BlogPost } from "./types";
import { post as colegiosPrivadosMoron } from "./posts/colegios-privados-moron";
import { post as colegiosPrivadosSanIsidro } from "./posts/colegios-privados-san-isidro";
import { post as colegiosPrivadosLanus } from "./posts/colegios-privados-lanus";
import { post as colegiosPrivadosCastelar } from "./posts/colegios-privados-castelar";
import { post as colegiosPrivadosTigre } from "./posts/colegios-privados-tigre";
import { post as colegiosPrivadosFlorencioVarela } from "./posts/colegios-privados-florencio-varela";
import { post as colegiosPrivadosBerazategui } from "./posts/colegios-privados-berazategui";
import { post as colegiosPrivadosMerlo } from "./posts/colegios-privados-merlo";
import { post as colegiosPrivadosItuzaingo } from "./posts/colegios-privados-ituzaingo";
import { post as colegiosPrivadosHurlingham } from "./posts/colegios-privados-hurlingham";
import { post as colegiosPrivadosQuilmes } from "./posts/colegios-privados-quilmes";
import { post as colegiosPrivadosLomasDeZamora } from "./posts/colegios-privados-lomas-de-zamora";
import { post as colegiosPrivadosLaMatanza } from "./posts/colegios-privados-la-matanza";
import { post as colegiosPrivadosSalta } from "./posts/colegios-privados-salta";
import { post as colegiosPrivadosCordoba } from "./posts/colegios-privados-cordoba";
import { post as colegiosPrivadosRosario } from "./posts/colegios-privados-rosario";
import { post as colegiosPrivadosLaPlata } from "./posts/colegios-privados-la-plata";
import { post as colegiosPrivadosVicenteLopez } from "./posts/colegios-privados-vicente-lopez";
import { post as colegiosPrivadosMarDelPlata } from "./posts/colegios-privados-mar-del-plata";
import { post as colegiosBilingsGba } from "./posts/colegios-bilingues-gba";
import { post as colegiosPrivadosLongchamps } from "./posts/colegios-privados-longchamps";
import { post as colegiosPrivadosMendoza } from "./posts/colegios-privados-mendoza";
import { post as colegiosPrivadosSantaFe } from "./posts/colegios-privados-santa-fe";
import { post as colegiosPrivadosBanfield } from "./posts/colegios-privados-banfield";
import { post as colegiosPrivadosTemperley } from "./posts/colegios-privados-temperley";
import { post as colegiosPrivadosAvellaneda } from "./posts/colegios-privados-avellaneda";

export const ALL_POSTS: BlogPost[] = [
  colegiosPrivadosMoron,
  colegiosPrivadosSanIsidro,
  colegiosPrivadosLanus,
  colegiosPrivadosCastelar,
  colegiosPrivadosTigre,
  colegiosPrivadosFlorencioVarela,
  colegiosPrivadosBerazategui,
  colegiosPrivadosMerlo,
  colegiosPrivadosItuzaingo,
  colegiosPrivadosHurlingham,
  colegiosPrivadosQuilmes,
  colegiosPrivadosLomasDeZamora,
  colegiosPrivadosLaMatanza,
  colegiosPrivadosSalta,
  colegiosPrivadosCordoba,
  colegiosPrivadosRosario,
  colegiosPrivadosLaPlata,
  colegiosPrivadosVicenteLopez,
  colegiosPrivadosMarDelPlata,
  colegiosBilingsGba,
  colegiosPrivadosLongchamps,
  colegiosPrivadosMendoza,
  colegiosPrivadosSantaFe,
  colegiosPrivadosBanfield,
  colegiosPrivadosTemperley,
  colegiosPrivadosAvellaneda,
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return ALL_POSTS.find((p) => p.slug === slug);
}

export function getPostsByCity(citySlug: string): BlogPost[] {
  return ALL_POSTS.filter((p) => p.citySlug === citySlug);
}

export function getAllSlugs(): string[] {
  return ALL_POSTS.map((p) => p.slug);
}
