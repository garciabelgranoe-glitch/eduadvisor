export const CITY_LANDING_PREFIX = "colegios-en-";

export function buildCityLandingPath(citySlug: string) {
  return `/${CITY_LANDING_PREFIX}${citySlug}`;
}

export function getCitySlugFromLandingSegment(segment: string) {
  if (!segment.startsWith(CITY_LANDING_PREFIX)) {
    return null;
  }

  const slug = segment.slice(CITY_LANDING_PREFIX.length).trim().toLowerCase();

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return null;
  }

  return slug;
}

export function formatCityNameFromSlug(citySlug: string) {
  return citySlug
    .split("-")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}
