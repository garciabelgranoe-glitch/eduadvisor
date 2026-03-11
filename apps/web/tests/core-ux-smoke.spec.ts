import { expect, test, type Page } from "@playwright/test";

async function expectNoRuntimeRecovery(page: Page) {
  await expect(page.getByText("No pudimos renderizar esta vista")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Server Error" })).toHaveCount(0);
}

test("home carga en desktop y mobile con CTA principales visibles", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Encontrá el colegio ideal/i })).toBeVisible();
  const heroPrimaryButton = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: /Encontrá el colegio ideal/i }) })
    .getByRole("button", { name: "Buscar colegios" });
  await expect(heroPrimaryButton).toBeVisible();
  await expect(heroPrimaryButton).toHaveText("Buscar colegios");
  await expect(page.getByRole("link", { name: "Buscar colegios" }).first()).toBeVisible();
  await expectNoRuntimeRecovery(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Ingresar" }).or(page.getByRole("link", { name: "Ingresar" }))
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Buscar colegios" }).first()).toBeVisible();
  await expectNoRuntimeRecovery(page);
});

test("search muestra filtros, mapa default y estado UX sin errores", async ({ page }) => {
  await page.goto("/search");

  await expect(page.getByRole("heading", { name: /colegios encontrados/i })).toBeVisible();
  await expect(page.getByText("Filtrar resultados")).toBeVisible();
  await expect(page.locator('iframe[title="Mapa general de Argentina"]')).toBeVisible();
  await expectNoRuntimeRecovery(page);
});

test("compare muestra estado vacío y CTA de salida", async ({ page }) => {
  await page.goto("/compare");

  await expect(page.getByRole("heading", { name: "Compará colegios en una sola vista" })).toBeVisible();
  await expect(page.getByText("Todavía no hay colegios para comparar")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ir a buscar colegios" }).or(page.getByRole("link", { name: "Ir a buscar colegios" }))
  ).toBeVisible();
  await expectNoRuntimeRecovery(page);
});

test("ingresar muestra flujos de familias y colegios", async ({ page }) => {
  await page.goto("/ingresar");

  await expect(page.getByRole("heading", { name: "Ingresar a tu espacio" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Familias" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Colegios" })).toBeVisible();

  const googleEnabled = page.getByRole("button", { name: "Entrar con Google" }).or(page.getByRole("link", { name: "Entrar con Google" }));
  const googleDisabled = page.getByRole("button", { name: "Google no configurado" }).or(page.getByRole("link", { name: "Google no configurado" }));
  await expect(googleEnabled.or(googleDisabled)).toBeVisible();
  await expectNoRuntimeRecovery(page);
});

test("perfil geo renderiza sin runtime error usando sitemap si hay datos", async ({ page, request }) => {
  const sitemapResponse = await request.get("/sitemap_schools.xml");
  expect(sitemapResponse.status()).toBe(200);
  const xml = await sitemapResponse.text();
  const match = xml.match(/<loc>(https?:\/\/[^<]+\/ar\/[^<]+\/colegios\/[^<]+)<\/loc>/i);

  test.skip(!match, "No hay perfiles geo disponibles en sitemap_schools para este entorno.");

  const profilePath = match![1].replace(/^https?:\/\/[^/]+/, "");
  await page.goto(profilePath);

  await expect(page.getByText("Perfil de colegio")).toBeVisible();
  await expect(page.getByRole("button", { name: "Agregar a comparador" })).toBeVisible();
  await expectNoRuntimeRecovery(page);
});
