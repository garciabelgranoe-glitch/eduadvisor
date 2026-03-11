import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";
import { APP_ROLE_PARENT, APP_ROLE_SCHOOL_ADMIN, resolveSessionTtlSeconds, SESSION_COOKIE } from "../lib/auth/session";
import { resolveLaunchMode } from "../lib/beta/launch-mode";

const launchMode = resolveLaunchMode();

function buildSignedSessionToken(input: {
  userId: string;
  email: string;
  role: typeof APP_ROLE_PARENT | typeof APP_ROLE_SCHOOL_ADMIN;
  schoolId?: string;
  schoolSlug?: string;
}) {
  const now = Date.now();
  const ttlSeconds = resolveSessionTtlSeconds();
  const payload = {
    userId: input.userId,
    email: input.email.trim().toLowerCase(),
    role: input.role,
    schoolId: input.schoolId ?? null,
    schoolSlug: input.schoolSlug ?? null,
    issuedAt: now,
    expiresAt: now + ttlSeconds * 1000
  };

  const secret = process.env.AUTH_SESSION_SECRET ?? "test-auth-session-secret";
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");

  return `${encodedPayload}.${signature}`;
}

test("GTM-030 launch PUBLIC permite acceso de familias sin invitación", async ({ page }) => {
  test.skip(launchMode !== "PUBLIC", "Este escenario solo aplica en launch mode PUBLIC.");
  const token = buildSignedSessionToken({
    userId: "public-parent-allowed",
    email: "parent.public.beta@example.eduadvisor",
    role: APP_ROLE_PARENT
  });

  await page.context().addCookies([
    {
      name: SESSION_COOKIE,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);

  await page.goto("/parent-dashboard");
  await expect(page.getByRole("heading", { name: "Parent Dashboard" })).toBeVisible();
});

test("GTM-030 launch PUBLIC mantiene colegios por invitación", async ({ page }) => {
  test.skip(launchMode !== "PUBLIC", "Este escenario solo aplica en launch mode PUBLIC.");
  const token = buildSignedSessionToken({
    userId: "public-school-denied",
    email: "school.public.beta@example.eduadvisor",
    role: APP_ROLE_SCHOOL_ADMIN,
    schoolId: "public-school-id",
    schoolSlug: "public-beta-college"
  });

  await page.context().addCookies([
    {
      name: SESSION_COOKIE,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);

  await page.goto("/school-dashboard?school=public-beta-college");
  await expect(page).toHaveURL(/\/beta-acceso\?/);
  await expect(page.getByRole("heading", { name: "Acceso por invitación" })).toBeVisible();
});
