import { expect, test, type APIRequestContext } from "@playwright/test";

function extractFirstMatch(input: string, regex: RegExp) {
  const result = input.match(regex);
  return result?.[1] ?? null;
}

function extractAllMatches(input: string, regex: RegExp) {
  const matches: string[] = [];
  for (const match of input.matchAll(regex)) {
    if (match[1]) {
      matches.push(match[1]);
    }
  }
  return matches;
}

async function getGeoSitemapUrls(request: APIRequestContext) {
  const rootResponse = await request.get("/sitemap_geo.xml");
  expect(rootResponse.status()).toBe(200);

  const rootXml = await rootResponse.text();
  const isIndex = /<sitemapindex/i.test(rootXml);

  if (!isIndex) {
    return extractAllMatches(rootXml, /<loc>(https?:\/\/[^<]+)<\/loc>/g);
  }

  const childSitemaps = extractAllMatches(rootXml, /<loc>(https?:\/\/[^<]+\/sitemaps\/geo\/\d+)<\/loc>/g);
  expect(childSitemaps.length).toBeGreaterThan(0);

  const firstChildPath = childSitemaps[0].replace(/^https?:\/\/[^/]+/, "");
  const childResponse = await request.get(firstChildPath);
  expect(childResponse.status()).toBe(200);

  const childXml = await childResponse.text();
  return extractAllMatches(childXml, /<loc>(https?:\/\/[^<]+)<\/loc>/g);
}

test("GTM-026 sitemap geo incluye landings indexables por ciudad", async ({ request }) => {
  const urls = await getGeoSitemapUrls(request);
  const hasArHome = urls.some((url) => /\/ar$/.test(url));
  expect(hasArHome).toBeTruthy();

  const hasCityHub = urls.some((url) => /\/ar\/[a-z0-9-]+\/[a-z0-9-]+$/.test(url));
  const hasCityListings = urls.some((url) => /\/ar\/[a-z0-9-]+\/[a-z0-9-]+\/colegios$/.test(url));
  const hasCityRankings = urls.some((url) => /\/ar\/[a-z0-9-]+\/[a-z0-9-]+\/rankings$/.test(url));

  if (!hasCityListings) {
    test.info().annotations.push({
      type: "guardrail",
      description: "Sin landings indexables aún: SEO geo en estado de maduración por calidad de dataset."
    });
    expect(hasCityHub).toBeFalsy();
    expect(hasCityRankings).toBeFalsy();
    return;
  }

  expect(hasCityHub).toBeTruthy();
  expect(hasCityRankings).toBeTruthy();
});

test("GTM-026 landing /colegios expone metadata, contenido y schema SEO", async ({ request }) => {
  const urls = await getGeoSitemapUrls(request);
  const listingUrl = urls.find((url) => /\/ar\/[a-z0-9-]+\/[a-z0-9-]+\/colegios$/.test(url));

  test.skip(!listingUrl, "No hay landing /colegios indexable en sitemap_geo actual.");

  const path = listingUrl!.replace(/^https?:\/\/[^/]+/, "");
  const response = await request.get(path);
  expect(response.status()).toBe(200);

  const html = await response.text();
  const robots = extractFirstMatch(html, /<meta[^>]*name="robots"[^>]*content="([^"]+)"/i);
  const canonical = extractFirstMatch(html, /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);

  expect(robots?.toLowerCase()).toContain("index");
  expect(robots?.toLowerCase()).toContain("follow");
  expect(canonical).toBe(listingUrl);

  expect(html).toContain("Colegios privados en");
  expect(html).toContain("Top picks en");
  expect(html).toContain("FAQ local");

  expect(html).toContain('"@type":"BreadcrumbList"');
  expect(html).toContain('"@type":"ItemList"');
  expect(html).toContain('"@type":"FAQPage"');
});

test("GTM-026 legacy /colegios-en-[ciudad] redirige a arquitectura geo canónica", async ({ request }) => {
  const urls = await getGeoSitemapUrls(request);
  const listingUrl = urls.find((url) => /\/ar\/([a-z0-9-]+)\/([a-z0-9-]+)\/colegios$/.test(url));

  test.skip(!listingUrl, "No hay landing /colegios para validar redirección legacy.");

  const match = listingUrl!.match(/\/ar\/([a-z0-9-]+)\/([a-z0-9-]+)\/colegios$/);
  const provinceSlug = match?.[1];
  const citySlug = match?.[2];

  test.skip(!provinceSlug || !citySlug, "No se pudo resolver provincia/ciudad desde sitemap.");

  const legacyResponse = await request.get(`/colegios-en-${citySlug}`, { maxRedirects: 0 });
  expect([307, 308]).toContain(legacyResponse.status());

  const location = legacyResponse.headers()["location"];
  expect(location).toBe(`/ar/${provinceSlug}/${citySlug}/colegios`);
});

test("GTM-026 paginación deep en /colegios aplica noindex y canonical base", async ({ request }) => {
  const urls = await getGeoSitemapUrls(request);

  const categoryUrl = urls.find((url) =>
    /\/ar\/[a-z0-9-]+\/[a-z0-9-]+\/colegios\/(bilingues|deportes|jornada-completa|tecnologicos)$/.test(url)
  );

  const listingUrl = categoryUrl
    ? categoryUrl.replace(/\/(bilingues|deportes|jornada-completa|tecnologicos)$/, "")
    : urls.find((url) => /\/ar\/[a-z0-9-]+\/[a-z0-9-]+\/colegios$/.test(url));

  test.skip(!listingUrl, "No hay landing /colegios para validar paginación deep.");

  const paginatedPath = `${listingUrl!.replace(/^https?:\/\/[^/]+/, "")}?page=2`;
  const response = await request.get(paginatedPath);

  test.skip(response.status() === 404, "La ciudad de muestra no tiene segunda página de resultados.");
  expect(response.status()).toBe(200);

  const html = await response.text();
  const robots = extractFirstMatch(html, /<meta[^>]*name="robots"[^>]*content="([^"]+)"/i);
  const canonical = extractFirstMatch(html, /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);

  expect(robots?.toLowerCase()).toContain("noindex");
  expect(canonical).toBe(listingUrl);
});
