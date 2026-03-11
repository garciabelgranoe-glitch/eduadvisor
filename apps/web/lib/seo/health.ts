import { getSchools, getSeoCities } from "@/lib/api";
import { buildGeoFaq } from "./content";
import { evaluateGeoIndexability } from "./guardrails";
import { canonicalizeSlug } from "./routes";

export interface SeoHealthSnapshot {
  generatedAt: string;
  geoPages: {
    totalCities: number;
    indexableCities: number;
    blockedByGuardrail: number;
  };
  schools: {
    total: number;
    orphanByCity: number;
  };
  duplicates: {
    cityIntentCollisions: number;
  };
}

export async function getSeoHealthSnapshot(): Promise<SeoHealthSnapshot> {
  const [cities, schools] = await Promise.all([
    getSeoCities({ country: "AR", limit: "5000" }),
    getSchools({ country: "AR", limit: "5000", sortBy: "name", sortOrder: "asc" })
  ]);

  const cityKeys = new Set<string>();
  let indexableCities = 0;
  let collisions = 0;

  for (const city of cities.items) {
    const key = `${canonicalizeSlug(city.provinceSlug)}::${canonicalizeSlug(city.slug)}`;

    if (cityKeys.has(key)) {
      collisions += 1;
    } else {
      cityKeys.add(key);
    }

    const faq = buildGeoFaq({ city: city.city, province: city.province });
    const guardrail = evaluateGeoIndexability({
      schoolCount: city.schoolCount,
      faqCount: faq.length,
      topPicksCount: Math.min(city.schoolCount, 6),
      hasUniqueIntro: true
    });

    if (guardrail.indexable) {
      indexableCities += 1;
    }
  }

  let orphanByCity = 0;

  for (const school of schools.items) {
    const cityKey = `${canonicalizeSlug(school.location.province)}::${canonicalizeSlug(school.location.city)}`;

    if (!cityKeys.has(cityKey)) {
      orphanByCity += 1;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    geoPages: {
      totalCities: cities.items.length,
      indexableCities,
      blockedByGuardrail: Math.max(cities.items.length - indexableCities, 0)
    },
    schools: {
      total: schools.items.length,
      orphanByCity
    },
    duplicates: {
      cityIntentCollisions: collisions
    }
  };
}
