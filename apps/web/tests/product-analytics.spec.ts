import { expect, test, type Page } from "@playwright/test";
import { ADMIN_SESSION_COOKIE, createAdminSession, createSignedAdminSessionToken } from "../lib/auth/session";

async function setSignedAdminSessionCookie(page: Page, email: string) {
  const session = await createAdminSession({ email });
  const token = session ? await createSignedAdminSessionToken(session) : null;
  if (!token) {
    throw new Error("No se pudo generar sesión admin firmada para prueba.");
  }

  await page.context().addCookies([
    {
      name: ADMIN_SESSION_COOKIE,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Strict"
    }
  ]);
}

test("admin analytics renders funnel after tracking events", async ({ page, request }) => {
  const adminEmail = process.env.ADMIN_ALLOWED_EMAILS?.split(",")[0]?.trim() || "admin@eduadvisor.test";
  const schoolSlug = "colegio-nacional-de-monserrat-u-n-c-cordoba";

  await request.post("/api/analytics/capture", {
    data: {
      event: "search_results_viewed",
      distinctId: "playwright-analytics-user",
      properties: {
        source: "playwright",
        q: "monserrat",
        city: "cordoba"
      }
    }
  });

  await request.post("/api/analytics/capture", {
    data: {
      event: "school_profile_viewed",
      distinctId: "playwright-analytics-user",
      properties: {
        source: "playwright",
        schoolSlug
      }
    }
  });

  await request.post("/api/analytics/capture", {
    data: {
      event: "lead_submitted",
      distinctId: "playwright-analytics-user",
      properties: {
        source: "playwright",
        schoolSlug
      }
    }
  });

  await request.post("/api/analytics/capture", {
    data: {
      event: "web_vital_reported",
      distinctId: "playwright-analytics-user",
      properties: {
        source: "playwright",
        routePath: "/search",
        metricName: "LCP",
        metricUnit: "ms",
        metricValue: 1840,
        metricRating: "good"
      }
    }
  });

  await setSignedAdminSessionCookie(page, adminEmail);
  await page.goto("/admin/analytics");
  await expect(page).toHaveURL(/\/admin\/analytics/);

  await expect(page.getByRole("heading", { name: "Embudo de producto (7 días)" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Core Web Vitals (7 días)" })).toBeVisible();
  await expect(page.getByText("Estado de performance:")).toBeVisible();
  await expect(page.getByText("Alertas activas de performance")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Alertas de performance enviadas" })).toBeVisible();
  await expect(page.getByText("Canales: Slack")).toBeVisible();
  await expect(page.getByText("Top colegios por intención")).toBeVisible();
  await expect(page.getByText("Estado de tracking")).toBeVisible();
});
