import { getRankings, getSchools, getSeoCities, getSeoSitemap } from "@/lib/api";
import { SEO_SITEMAP_CHUNK_SIZE } from "./config";
import {
  arHomePath,
  cityPath,
  cityRankingsPath,
  citySchoolsCategoryPath,
  citySchoolProfilePath,
  citySchoolsPath,
  provincePath
} from "./routes";
import { evaluateGeoIndexability } from "./guardrails";
import { buildGeoFaq } from "./content";

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: number;
}

export function chunkSitemapUrls(items: SitemapUrl[], size = SEO_SITEMAP_CHUNK_SIZE) {
  if (items.length <= size) {
    return [items];
  }

  const chunks: SitemapUrl[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildUrlSetXml(items: SitemapUrl[]) {
  const body = items
    .map((item) => {
      const lastmod = item.lastmod ? `<lastmod>${escapeXml(item.lastmod)}</lastmod>` : "";
      const changefreq = item.changefreq ? `<changefreq>${item.changefreq}</changefreq>` : "";
      const priority = typeof item.priority === "number" ? `<priority>${item.priority.toFixed(1)}</priority>` : "";

      return `<url><loc>${escapeXml(item.loc)}</loc>${lastmod}${changefreq}${priority}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`;
}

export function buildSitemapIndexXml(items: Array<{ loc: string; lastmod?: string }>) {
  const body = items
    .map((item) => {
      const lastmod = item.lastmod ? `<lastmod>${escapeXml(item.lastmod)}</lastmod>` : "";
      return `<sitemap><loc>${escapeXml(item.loc)}</loc>${lastmod}</sitemap>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`;
}

export async function getStaticSitemapUrls(baseUrl: string): Promise<SitemapUrl[]> {
  const now = new Date().toISOString();
  return [
    { loc: `${baseUrl}/`, changefreq: "daily", priority: 1, lastmod: now },
    { loc: `${baseUrl}/ar`, changefreq: "daily", priority: 0.95, lastmod: now },
    { loc: `${baseUrl}/compare`, changefreq: "weekly", priority: 0.8, lastmod: now },
    { loc: `${baseUrl}/rankings`, changefreq: "weekly", priority: 0.8, lastmod: now },
    { loc: `${baseUrl}/matches`, changefreq: "weekly", priority: 0.7, lastmod: now },
    { loc: `${baseUrl}/market-insights`, changefreq: "weekly", priority: 0.7, lastmod: now }
  ];
}

export async function getGeoSitemapUrls(baseUrl: string): Promise<SitemapUrl[]> {
  const seoCities = await getSeoCities({ country: "AR", limit: "5000" });
  const todayIso = new Date().toISOString();

  const provinceSet = new Set<string>();
  const urls: SitemapUrl[] = [
    {
      loc: `${baseUrl}${arHomePath()}`,
      lastmod: todayIso,
      changefreq: "daily",
      priority: 0.95
    }
  ];

  for (const city of seoCities.items) {
    provinceSet.add(city.provinceSlug);

    const cityBase = cityPath(city.provinceSlug, city.slug);
    const citySchools = citySchoolsPath(city.provinceSlug, city.slug);
    const cityRankings = cityRankingsPath(city.provinceSlug, city.slug);
    const faq = buildGeoFaq({ city: city.city, province: city.province });

    const guardrail = evaluateGeoIndexability({
      schoolCount: city.schoolCount,
      faqCount: faq.length,
      topPicksCount: Math.min(city.schoolCount, 6),
      hasUniqueIntro: true
    });

    if (!guardrail.indexable) {
      continue;
    }

    urls.push(
      {
        loc: `${baseUrl}${cityBase}`,
        lastmod: todayIso,
        changefreq: "weekly",
        priority: 0.8
      },
      {
        loc: `${baseUrl}${citySchools}`,
        lastmod: todayIso,
        changefreq: "daily",
        priority: 0.9
      },
      {
        loc: `${baseUrl}${cityRankings}`,
        lastmod: todayIso,
        changefreq: "weekly",
        priority: 0.75
      }
    );

    if (city.schoolCount >= 12) {
      urls.push(
        {
          loc: `${baseUrl}${citySchoolsCategoryPath(city.provinceSlug, city.slug, "bilingues")}`,
          lastmod: todayIso,
          changefreq: "weekly",
          priority: 0.7
        },
        {
          loc: `${baseUrl}${citySchoolsCategoryPath(city.provinceSlug, city.slug, "deportes")}`,
          lastmod: todayIso,
          changefreq: "weekly",
          priority: 0.65
        },
        {
          loc: `${baseUrl}${citySchoolsCategoryPath(city.provinceSlug, city.slug, "jornada-completa")}`,
          lastmod: todayIso,
          changefreq: "weekly",
          priority: 0.7
        },
        {
          loc: `${baseUrl}${citySchoolsCategoryPath(city.provinceSlug, city.slug, "tecnologicos")}`,
          lastmod: todayIso,
          changefreq: "weekly",
          priority: 0.65
        }
      );
    }
  }

  for (const provinceSlug of provinceSet) {
    urls.push({
      loc: `${baseUrl}${provincePath(provinceSlug)}`,
      lastmod: todayIso,
      changefreq: "weekly",
      priority: 0.85
    });
  }

  return urls;
}

export async function getSchoolSitemapUrls(baseUrl: string): Promise<SitemapUrl[]> {
  const schools = await getSchools({ country: "AR", limit: "5000", sortBy: "name", sortOrder: "asc" });
  const seoSitemap = await getSeoSitemap({ limit: "5000" });
  const lastmodBySlug = new Map<string, string>();

  for (const school of seoSitemap?.schools ?? []) {
    lastmodBySlug.set(school.slug, school.lastModified);
  }

  return schools.items.map((school) => ({
    loc: `${baseUrl}${citySchoolProfilePath(school.location.province, school.location.city, school.slug)}`,
    lastmod: lastmodBySlug.get(school.slug) ?? new Date().toISOString(),
    changefreq: "weekly",
    priority: 0.7
  }));
}

export async function getRankingsSitemapUrls(baseUrl: string): Promise<SitemapUrl[]> {
  const rankings = await getRankings({ country: "AR", limit: "200" });
  const todayIso = rankings?.generatedAt ?? new Date().toISOString();

  if (!rankings) {
    return [];
  }

  return rankings.items.flatMap((item) => {
    const cityRoute = cityRankingsPath(item.city.provinceSlug, item.city.slug);
    const base = [{ loc: `${baseUrl}${cityRoute}`, lastmod: todayIso, changefreq: "weekly" as const, priority: 0.75 }];

    if (item.schools < 12) {
      return base;
    }

    return [
      ...base,
      {
        loc: `${baseUrl}${citySchoolsCategoryPath(item.city.provinceSlug, item.city.slug, "bilingues")}`,
        lastmod: todayIso,
        changefreq: "weekly" as const,
        priority: 0.7
      },
      {
        loc: `${baseUrl}${citySchoolsCategoryPath(item.city.provinceSlug, item.city.slug, "deportes")}`,
        lastmod: todayIso,
        changefreq: "weekly" as const,
        priority: 0.65
      },
      {
        loc: `${baseUrl}${citySchoolsCategoryPath(item.city.provinceSlug, item.city.slug, "jornada-completa")}`,
        lastmod: todayIso,
        changefreq: "weekly" as const,
        priority: 0.7
      },
      {
        loc: `${baseUrl}${citySchoolsCategoryPath(item.city.provinceSlug, item.city.slug, "tecnologicos")}`,
        lastmod: todayIso,
        changefreq: "weekly" as const,
        priority: 0.65
      }
    ];
  });
}
