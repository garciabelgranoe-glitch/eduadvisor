import type { BlogPost } from "./types";
import { post as colégiosPrivadosMoron } from "./posts/colegios-privados-moron";

export const ALL_POSTS: BlogPost[] = [
  colégiosPrivadosMoron,
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
