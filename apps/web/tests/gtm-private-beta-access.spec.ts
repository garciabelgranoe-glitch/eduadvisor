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

test("GTM-029 parent no invitado redirige a /beta-acceso", async ({ page }) => {
  test.skip(launchMode !== "PRIVATE", "Este escenario solo aplica en launch mode PRIVATE.");
  const token = buildSignedSessionToken({
    userId: "beta-parent-denied",
    email: "parent.not.invited@example.eduadvisor",
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
  await expect(page).toHaveURL(/\/beta-acceso\?/);
  await expect(page.getByRole("heading", { name: "Acceso por invitación" })).toBeVisible();
});

test("GTM-029 school no invitado redirige a /beta-acceso", async ({ page }) => {
  test.skip(launchMode !== "PRIVATE", "Este escenario solo aplica en launch mode PRIVATE.");
  const token = buildSignedSessionToken({
    userId: "beta-school-denied",
    email: "school.not.invited@example.eduadvisor",
    role: APP_ROLE_SCHOOL_ADMIN,
    schoolId: "beta-school-id",
    schoolSlug: "north-hills-college"
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

  await page.goto("/school-dashboard?school=north-hills-college");
  await expect(page).toHaveURL(/\/beta-acceso\?/);
  await expect(page.getByRole("heading", { name: "Acceso por invitación" })).toBeVisible();
});

test("GTM-029 parent invitado accede al dashboard", async ({ page }) => {
  test.skip(launchMode !== "PRIVATE", "Este escenario solo aplica en launch mode PRIVATE.");
  const invitedEmail = process.env.BETA_PRIVATE_ALLOWED_PARENT_EMAILS?.split(",")[0]?.trim() || "beta.parent@example.eduadvisor";

  const token = buildSignedSessionToken({
    userId: "beta-parent-allowed",
    email: invitedEmail,
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

test("GTM-029 API parent bloquea sesión no invitada", async ({ request }) => {
  test.skip(launchMode !== "PRIVATE", "Este escenario solo aplica en launch mode PRIVATE.");
  const token = buildSignedSessionToken({
    userId: "beta-parent-api-denied",
    email: "denied.parent.api@example.eduadvisor",
    role: APP_ROLE_PARENT
  });

  const response = await request.get("/api/parent/saved-schools", {
    headers: {
      cookie: `${SESSION_COOKIE}=${token}`
    }
  });

  expect(response.status()).toBe(403);
  const payload = (await response.json()) as { message?: string; code?: string };
  expect(payload.message).toContain("beta privada");
  expect(payload.code).toBe("PARENT_NOT_INVITED");
});
