import { expect, test } from "@playwright/test";

test("mobile header exposes primary conversion actions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(
    page.getByRole("button", { name: "Ingresar" }).or(page.getByRole("link", { name: "Ingresar" }))
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Publicar colegio" }).or(page.getByRole("link", { name: "Publicar colegio" }))
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Buscar colegios" }).first()).toBeVisible();
});
