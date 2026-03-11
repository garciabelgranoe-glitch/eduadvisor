import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";
import { ANALYTICS_FUNNEL_VERSION, FUNNEL_EVENT_BY_STEP } from "../lib/analytics-schema";

test("GTM-027 captura funnel canónico y lo refleja en admin analytics", async ({ page, request }) => {
  const adminEmail = process.env.ADMIN_ALLOWED_EMAILS?.split(",")[0]?.trim() || "admin@eduadvisor.test";
  const now = Date.now();
  const adminSession = {
    adminId: `admin:${adminEmail.toLowerCase()}`,
    email: adminEmail.toLowerCase(),
    role: "PLATFORM_ADMIN",
    issuedAt: now,
    expiresAt: now + Number.parseInt(process.env.ADMIN_SESSION_TTL_SECONDS ?? "43200", 10) * 1000
  };
  const encodedPayload = Buffer.from(JSON.stringify(adminSession), "utf8").toString("base64url");
  const adminSessionSecret =
    process.env.ADMIN_AUTH_SESSION_SECRET ?? process.env.AUTH_SESSION_SECRET ?? "test-auth-session-secret";
  const signedAdminSession = `${encodedPayload}.${createHmac("sha256", adminSessionSecret).update(encodedPayload).digest("base64url")}`;
  const distinctId = `playwright-funnel-${Date.now()}`;
  const schoolSlug = "colegio-nacional-de-monserrat-u-n-c-cordoba";

  const funnelSequence = [
    FUNNEL_EVENT_BY_STEP.search,
    FUNNEL_EVENT_BY_STEP.profile,
    FUNNEL_EVENT_BY_STEP.shortlist,
    FUNNEL_EVENT_BY_STEP.comparison,
    FUNNEL_EVENT_BY_STEP.lead
  ] as const;

  for (const eventName of funnelSequence) {
    const response = await request.post("/api/analytics/capture", {
      data: {
        event: eventName,
        distinctId,
        properties: {
          source: "playwright_gtm_027",
          schoolSlug
        }
      }
    });

    expect(response.status()).toBe(202);
    const payload = (await response.json()) as { captured?: boolean };
    expect(payload.captured).toBeTruthy();
  }

  await page.context().addCookies([
    {
      name: "eduadmin_session",
      value: signedAdminSession,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Strict"
    }
  ]);

  await page.goto("/admin/analytics");

  await expect(page.getByRole("heading", { name: "Funnel de eventos (Posthog)" })).toBeVisible();
  await expect(page.getByText(`Versión de tracking: ${ANALYTICS_FUNNEL_VERSION}`)).toBeVisible();
  await expect(page.getByText("Eventos funnel (7d)")).toBeVisible();
  await expect(page.getByText("Usuarios con lead")).toBeVisible();
  await expect(page.getByText("Posthog", { exact: true })).toBeVisible();
});
