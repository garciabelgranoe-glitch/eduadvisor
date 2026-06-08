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
