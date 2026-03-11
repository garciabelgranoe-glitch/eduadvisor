import { expect, test } from "@playwright/test";
import {
  APP_ROLE_PARENT,
  APP_ROLE_SCHOOL_ADMIN,
  createAuthSession,
  createSignedSessionToken
} from "../lib/auth/session";

process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET ?? "test-auth-session-secret";

async function buildSignedSessionCookie(
  role: typeof APP_ROLE_PARENT | typeof APP_ROLE_SCHOOL_ADMIN,
  schoolId = "school-owner",
  schoolSlug = "school-owner"
) {
  const session = await createAuthSession({
    userId: `${role.toLowerCase()}-test-user`,
    email: `${role.toLowerCase()}@eduadvisor.test`,
    role,
    schoolId: role === APP_ROLE_SCHOOL_ADMIN ? schoolId : null,
    schoolSlug: role === APP_ROLE_SCHOOL_ADMIN ? schoolSlug : null
  });

  const token = await createSignedSessionToken(session);
  if (!token) {
    throw new Error("No se pudo crear token de sesión firmado para test.");
  }

  return `eduadvisor_session=${token}`;
}

test("school billing checkout redirects anonymous users to sign in", async ({ request }) => {
  const response = await request.fetch("/api/schools/billing/checkout?schoolId=school-owner&school=school-owner", {
    method: "GET",
    maxRedirects: 0
  });

  expect(response.status()).toBe(303);
  const location = response.headers()["location"];
  expect(location).toContain("/ingresar");
  expect(decodeURIComponent(location)).toContain("next=/api/schools/billing/checkout?schoolId=school-owner&school=school-owner");
});

test("school billing checkout denies ownership mismatch", async ({ request }) => {
  const cookie = await buildSignedSessionCookie(APP_ROLE_SCHOOL_ADMIN, "school-owner", "school-owner");
  const response = await request.fetch("/api/schools/billing/checkout?schoolId=other-school&school=school-owner", {
    method: "GET",
    headers: {
      cookie
    },
    maxRedirects: 0
  });

  expect(response.status()).toBe(303);
  const location = response.headers()["location"];
  expect(location).toContain("/school-dashboard");
  expect(location).toContain("billing=forbidden");
});

test("billing checkout simulate rejects non-school sessions", async ({ request }) => {
  const parentCookie = await buildSignedSessionCookie(APP_ROLE_PARENT);
  const response = await request.fetch("/api/billing/checkout/simulate", {
    method: "POST",
    headers: {
      cookie: parentCookie
    },
    data: {
      schoolId: "school-owner",
      sessionId: "checkout-session-id",
      action: "success"
    }
  });

  expect(response.status()).toBe(403);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(payload?.message).toBe("Forbidden");
});

test("billing checkout simulate denies school ownership mismatch", async ({ request }) => {
  const schoolCookie = await buildSignedSessionCookie(APP_ROLE_SCHOOL_ADMIN, "school-owner", "school-owner");
  const response = await request.fetch("/api/billing/checkout/simulate", {
    method: "POST",
    headers: {
      cookie: schoolCookie
    },
    data: {
      schoolId: "other-school",
      sessionId: "checkout-session-id",
      action: "success"
    }
  });

  expect(response.status()).toBe(403);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(payload?.message).toBe("No tienes permisos para operar sobre este colegio.");
});
