import { getSchools, getSeoCities, getSeoCityBySlug } from "@/lib/api";
import { canonicalizeGeoIntent } from "./guardrails";
import { canonicalizeSlug, cityPath } from "./routes";

export async function getProvinceCities(provinceSlug: string) {
  const canonicalProvince = canonicalizeSlug(provinceSlug);
  const cities = await getSeoCities({ country: "AR", province: canonicalProvince, limit: "5000" });
  return cities.items;
}

export async function getGeoContext(provinceSlug: string, citySlug: string) {
  const canonical = canonicalizeGeoIntent({ provinceSlug, citySlug });
  const landing = await getSeoCityBySlug(canonical.citySlug);

  if (!landing) {
    return null;
  }

  const canonicalProvince = canonicalizeSlug(landing.city.provinceSlug);
  const canonicalCity = canonicalizeSlug(landing.city.slug);
  const canonicalPath = cityPath(canonicalProvince, canonicalCity);

  return {
    landing,
    canonical,
    canonicalPath,
    isCanonical:
      canonical.provinceSlug === canonicalProvince && canonical.citySlug === canonicalCity
  };
}

export async function getGeoSchools(citySlug: string, limit = "24") {
  return getSchools({
    city: canonicalizeSlug(citySlug),
    country: "AR",
    limit,
    sortBy: "name",
    sortOrder: "asc"
  });
}
