import { SEO_SITE_URL } from "@/lib/seo";
import { buildUrlSetXml, getStaticSitemapUrls } from "@/lib/seo/sitemap";

export const revalidate = 86400;

export async function GET() {
  const items = await getStaticSitemapUrls(SEO_SITE_URL);
  const xml = buildUrlSetXml(items);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
    }
  });
}
