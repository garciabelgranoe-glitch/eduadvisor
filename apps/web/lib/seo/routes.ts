import { SEO_SITE_URL } from "./config";

export function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const slugAliases = new Map<string, string>([
  ["ciudad-de-buenos-aires", "caba"],
  ["capital-federal", "caba"],
  ["buenos-aires-capital", "caba"],
  ["mendoza-capital", "mendoza"],
  ["ciudad-de-cordoba", "cordoba"]
]);

export function canonicalizeSlug(value: string) {
  const normalized = normalizeSlug(value);
  return slugAliases.get(normalized) ?? normalized;
}

export function absoluteUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SEO_SITE_URL}${normalizedPath}`;
}

export function arHomePath() {
  return "/ar";
}

export function provincePath(provinceSlug: string) {
  return `/ar/${canonicalizeSlug(provinceSlug)}`;
}

export function cityPath(provinceSlug: string, citySlug: string) {
  return `${provincePath(provinceSlug)}/${canonicalizeSlug(citySlug)}`;
}

export function citySchoolsPath(provinceSlug: string, citySlug: string) {
  return `${cityPath(provinceSlug, citySlug)}/colegios`;
}

export function citySchoolProfilePath(provinceSlug: string, citySlug: string, schoolSlug: string) {
  return `${citySchoolsPath(provinceSlug, citySlug)}/${canonicalizeSlug(schoolSlug)}`;
}

export function citySchoolsCategoryPath(provinceSlug: string, citySlug: string, category: string) {
  return `${citySchoolsPath(provinceSlug, citySlug)}/${canonicalizeSlug(category)}`;
}

export function cityRankingsPath(provinceSlug: string, citySlug: string) {
  return `${cityPath(provinceSlug, citySlug)}/rankings`;
}

export function cityRankingCategoryPath(provinceSlug: string, citySlug: string, category: string) {
  return `${cityRankingsPath(provinceSlug, citySlug)}/${canonicalizeSlug(category)}`;
}

export function comparePath(ids?: string) {
  if (!ids) {
    return "/compare";
  }

  return `/compare?schools=${encodeURIComponent(ids)}`;
}
