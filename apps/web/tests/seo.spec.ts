import { test, expect } from "@playwright/test";

const canonicalBaseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://eduadvisor.com").replace(/\/$/, "");

function extractFirstMatch(input: string, regex: RegExp) {
  const result = input.match(regex);
  return result?.[1] ?? null;
}

test("robots.txt expone reglas de crawl budget y sitemap index", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);

  const body = await response.text();

  expect(body).toContain("Disallow: /admin");
  expect(body).toContain("Disallow: /school-dashboard");
  expect(body).toContain("Disallow: /*?*feeMin=*");
  expect(body).toContain(`Sitemap: ${canonicalBaseUrl}/sitemap_index.xml`);
});

test("sitemap_index.xml referencia sitemaps por tipo", async ({ request }) => {
  const response = await request.get("/sitemap_index.xml");
  expect(response.status()).toBe(200);

  const body = await response.text();

  expect(body).toContain("/sitemap_static.xml");
  expect(body).toContain("/sitemap_geo.xml");
  expect(body).toContain("/sitemap_schools.xml");
  expect(body).toContain("/sitemap_rankings.xml");
});

test("search mantiene noindex,follow y canonical estable", async ({ request }) => {
  const response = await request.get("/search?city=longchamps&feeMin=100000&feeMax=300000");
  expect(response.status()).toBe(200);

  const html = await response.text();
  const robots = extractFirstMatch(html, /<meta[^>]*name="robots"[^>]*content="([^"]+)"/i);
  const canonical = extractFirstMatch(html, /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);

  expect(robots?.toLowerCase()).toContain("noindex");
  expect(robots?.toLowerCase()).toContain("follow");
  expect(canonical).toBe(`${canonicalBaseUrl}/search`);
});

test("paginación deep de /colegios noindex + canonical a página base", async ({ request }) => {
  const geoSitemap = await request.get("/sitemap_geo.xml");
  expect(geoSitemap.status()).toBe(200);

  const geoBody = await geoSitemap.text();
  const listingUrl = extractFirstMatch(geoBody, /<loc>(https?:\/\/[^<]+\/colegios)<\/loc>/);

  test.skip(!listingUrl, "No hay URLs /colegios indexables en el sitemap geo actual.");

  const pathWithQuery = `${listingUrl!.replace(/^https?:\/\/[^/]+/, "")}?page=2`;
  const response = await request.get(pathWithQuery);
  expect(response.status()).toBe(200);

  const html = await response.text();
  const robots = extractFirstMatch(html, /<meta[^>]*name="robots"[^>]*content="([^"]+)"/i);
  const canonical = extractFirstMatch(html, /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);

  expect(robots?.toLowerCase()).toContain("noindex");
  expect(canonical).toBe(listingUrl);
});
