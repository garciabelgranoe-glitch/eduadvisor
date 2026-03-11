import { SEO_SITE_URL } from "@/lib/seo";
import { buildSitemapIndexXml, buildUrlSetXml, chunkSitemapUrls, getRankingsSitemapUrls } from "@/lib/seo/sitemap";

export const revalidate = 86400;

export async function GET() {
  const items = await getRankingsSitemapUrls(SEO_SITE_URL);
  const chunks = chunkSitemapUrls(items);

  const xml =
    chunks.length === 1
      ? buildUrlSetXml(chunks[0])
      : buildSitemapIndexXml(
          chunks.map((_, index) => ({
            loc: `${SEO_SITE_URL}/sitemaps/rankings/${index + 1}`,
            lastmod: new Date().toISOString()
          }))
        );

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
    }
  });
}
