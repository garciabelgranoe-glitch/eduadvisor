import { SEO_SITE_URL } from "@/lib/seo";
import { buildSitemapIndexXml } from "@/lib/seo/sitemap";

export const revalidate = 86400;

export async function GET() {
  const now = new Date().toISOString();

  const xml = buildSitemapIndexXml([
    { loc: `${SEO_SITE_URL}/sitemap_static.xml`, lastmod: now },
    { loc: `${SEO_SITE_URL}/sitemap_geo.xml`, lastmod: now },
    { loc: `${SEO_SITE_URL}/sitemap_schools.xml`, lastmod: now },
    { loc: `${SEO_SITE_URL}/sitemap_rankings.xml`, lastmod: now }
  ]);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
    }
  });
}
