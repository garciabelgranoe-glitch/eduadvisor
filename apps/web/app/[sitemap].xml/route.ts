import { SEO_SITE_URL } from "@/lib/seo";
import {
  buildSitemapIndexXml,
  buildUrlSetXml,
  chunkSitemapUrls,
  getGeoSitemapUrls,
  getRankingsSitemapUrls,
  getSchoolSitemapUrls,
  getStaticSitemapUrls
} from "@/lib/seo/sitemap";

export const revalidate = 86400;

interface SitemapRouteProps {
  params?: {
    sitemap: string;
  };
}

export async function GET(_: Request, { params }: SitemapRouteProps) {
  const sitemap = params?.sitemap;
  const now = new Date().toISOString();

  if (!sitemap) {
    return new Response("Not found", { status: 404 });
  }

  if (sitemap === "sitemap" || sitemap === "sitemap_index") {
    const xml = buildSitemapIndexXml([
      { loc: `${SEO_SITE_URL}/sitemap_static.xml`, lastmod: now },
      { loc: `${SEO_SITE_URL}/sitemap_geo.xml`, lastmod: now },
      { loc: `${SEO_SITE_URL}/sitemap_schools.xml`, lastmod: now },
      { loc: `${SEO_SITE_URL}/sitemap_rankings.xml`, lastmod: now }
    ]);

    return xmlResponse(xml);
  }

  if (sitemap === "sitemap_static") {
    return xmlResponse(buildUrlSetXml(await getStaticSitemapUrls(SEO_SITE_URL)));
  }

  if (sitemap === "sitemap_geo") {
    const chunks = chunkSitemapUrls(await getGeoSitemapUrls(SEO_SITE_URL));
    const xml =
      chunks.length === 1
        ? buildUrlSetXml(chunks[0])
        : buildSitemapIndexXml(
            chunks.map((_, index) => ({
              loc: `${SEO_SITE_URL}/sitemaps/geo/${index + 1}`,
              lastmod: now
            }))
          );

    return xmlResponse(xml);
  }

  if (sitemap === "sitemap_schools") {
    const chunks = chunkSitemapUrls(await getSchoolSitemapUrls(SEO_SITE_URL));
    const xml =
      chunks.length === 1
        ? buildUrlSetXml(chunks[0])
        : buildSitemapIndexXml(
            chunks.map((_, index) => ({
              loc: `${SEO_SITE_URL}/sitemaps/schools/${index + 1}`,
              lastmod: now
            }))
          );

    return xmlResponse(xml);
  }

  if (sitemap === "sitemap_rankings") {
    const chunks = chunkSitemapUrls(await getRankingsSitemapUrls(SEO_SITE_URL));
    const xml =
      chunks.length === 1
        ? buildUrlSetXml(chunks[0])
        : buildSitemapIndexXml(
            chunks.map((_, index) => ({
              loc: `${SEO_SITE_URL}/sitemaps/rankings/${index + 1}`,
              lastmod: now
            }))
          );

    return xmlResponse(xml);
  }

  return new Response("Not found", { status: 404 });
}

function xmlResponse(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
    }
  });
}
