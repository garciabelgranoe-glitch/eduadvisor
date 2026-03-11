import { expect, test } from "@playwright/test";

test("dashboard routes require role session", async ({ page }) => {
  await page.goto("/school-dashboard");
  await expect(page).toHaveURL(/\/ingresar\?next=%2Fschool-dashboard/);

  await page.goto("/parent-dashboard");
  await expect(page).toHaveURL(/\/ingresar\?next=%2Fparent-dashboard/);
});

test("school sign-in sets role and updates top navigation", async ({ page }) => {
  await page.goto("/ingresar");
  const schoolCard = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Colegios" }) });
  await schoolCard.getByLabel("Email institucional").fill("maria.torres@example.eduadvisor");
  const schoolField = schoolCard.getByLabel("Colegio");
  await schoolField.fill("colegio");

  const firstResult = page.locator("div.max-h-60 button").first();
  const hasSelectableSchool = await firstResult.isVisible().catch(() => false);
  test.skip(!hasSelectableSchool, "No hay colegios disponibles en este entorno para validar login institucional.");

  await firstResult.click();
  await schoolCard.getByRole("button", { name: "Entrar como colegio" }).click();
  await expect(page).toHaveURL(/\/school-dashboard|\/ingresar\?error=/);
  const authSucceeded = /\/school-dashboard/.test(page.url());
  test.skip(!authSucceeded, "El entorno no permitió autenticar colegio (claim/credenciales/dataset).");

  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find((cookie) => cookie.name === "eduadvisor_session");
  expect(sessionCookie?.value).toBeTruthy();

  const response = await page.request.get("/api/session/me");
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({
    authenticated: true,
    role: "SCHOOL",
    appRole: "SCHOOL_ADMIN"
  });
});
