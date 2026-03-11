import { SEO_SITE_URL } from "@/lib/seo";
import { buildUrlSetXml, chunkSitemapUrls, getRankingsSitemapUrls } from "@/lib/seo/sitemap";

export const revalidate = 86400;

interface RouteParams {
  params: {
    page: string;
  };
}

export async function GET(_: Request, { params }: RouteParams) {
  const page = Number(params.page);
  const chunks = chunkSitemapUrls(await getRankingsSitemapUrls(SEO_SITE_URL));
  const current = Number.isFinite(page) ? chunks[page - 1] : undefined;

  if (!current) {
    return new Response("Not found", { status: 404 });
  }

  const xml = buildUrlSetXml(current);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600"
    }
  });
}
