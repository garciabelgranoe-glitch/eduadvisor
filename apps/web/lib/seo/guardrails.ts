import {
  SEO_GEO_MIN_FAQ_COUNT,
  SEO_GEO_MIN_SCHOOL_COUNT,
  SEO_GEO_MIN_TOP_PICKS,
  SEO_RANKING_CATEGORIES,
  type SeoRankingCategory
} from "./config";
import { canonicalizeSlug } from "./routes";

export interface GeoIndexabilityInput {
  schoolCount: number;
  faqCount: number;
  topPicksCount: number;
  hasUniqueIntro: boolean;
}

export interface GeoIndexabilityResult {
  indexable: boolean;
  reasons: string[];
}

export function evaluateGeoIndexability(input: GeoIndexabilityInput): GeoIndexabilityResult {
  const reasons: string[] = [];

  if (input.schoolCount < SEO_GEO_MIN_SCHOOL_COUNT) {
    reasons.push(`schoolCount<${SEO_GEO_MIN_SCHOOL_COUNT}`);
  }

  if (input.faqCount < SEO_GEO_MIN_FAQ_COUNT) {
    reasons.push(`faqCount<${SEO_GEO_MIN_FAQ_COUNT}`);
  }

  if (input.topPicksCount < SEO_GEO_MIN_TOP_PICKS) {
    reasons.push(`topPicksCount<${SEO_GEO_MIN_TOP_PICKS}`);
  }

  if (!input.hasUniqueIntro) {
    reasons.push("missingUniqueIntro");
  }

  return {
    indexable: reasons.length === 0,
    reasons
  };
}

export function shouldNoindexFacetedUrl(searchParams?: URLSearchParams | Record<string, string | string[] | undefined>) {
  if (!searchParams) {
    return false;
  }

  const entries =
    searchParams instanceof URLSearchParams
      ? Array.from(searchParams.entries())
      : Object.entries(searchParams)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value] as const);

  const activeKeys = entries
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key]) => key)
    .filter((key) => key !== "utm_source" && key !== "utm_medium" && key !== "utm_campaign");

  if (activeKeys.length === 0) {
    return false;
  }

  return true;
}

export function shouldNoindexPagination(page?: string | number | null) {
  const pageNumber = Number(page ?? "1");
  if (!Number.isFinite(pageNumber)) {
    return false;
  }

  return pageNumber > 1;
}

export function canonicalizeGeoIntent({
  provinceSlug,
  citySlug
}: {
  provinceSlug: string;
  citySlug: string;
}) {
  return {
    provinceSlug: canonicalizeSlug(provinceSlug),
    citySlug: canonicalizeSlug(citySlug)
  };
}

export function isValidRankingCategory(category: string): category is SeoRankingCategory {
  return SEO_RANKING_CATEGORIES.includes(category as SeoRankingCategory);
}
