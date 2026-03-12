export const SEO_SITE_NAME = "EduAdvisor";
export const SEO_DEFAULT_LOCALE = "es_AR";
export const SEO_DEFAULT_LANG = "es-AR";

const rawSiteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
export const SEO_SITE_URL = (rawSiteUrl && rawSiteUrl.length > 0 ? rawSiteUrl : "https://eduadvisor.com").replace(
  /\/$/,
  ""
);

export const SEO_GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

export const SEO_SITEMAP_CHUNK_SIZE = 50000;

export const SEO_GEO_MIN_SCHOOL_COUNT = 8;
export const SEO_GEO_MIN_FAQ_COUNT = 5;
export const SEO_GEO_MIN_TOP_PICKS = 3;

export const SEO_RANKING_CATEGORIES = ["bilingues", "deportes", "jornada-completa", "tecnologicos"] as const;

export type SeoRankingCategory = (typeof SEO_RANKING_CATEGORIES)[number];
