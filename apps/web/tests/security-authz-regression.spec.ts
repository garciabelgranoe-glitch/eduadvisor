import { expect, test } from "@playwright/test";
import { createAuthSession, createSignedSessionToken } from "../lib/auth/session";

process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET ?? "test-auth-session-secret";

async function buildSignedSessionCookie(role: "PARENT" | "SCHOOL_ADMIN") {
  const session = await createAuthSession({
    userId: `${role.toLowerCase()}-test-user`,
    email: `${role.toLowerCase()}@eduadvisor.test`,
    role,
    schoolId: role === "SCHOOL_ADMIN" ? "school-owner" : null,
    schoolSlug: role === "SCHOOL_ADMIN" ? "school-owner" : null
  });

  const token = await createSignedSessionToken(session);
  if (!token) {
    throw new Error("Could not generate signed session token for regression test.");
  }

  return `eduadvisor_session=${token}`;
}

test("regression: parent session is recognized by /api/session/me", async ({ request }) => {
  const cookie = await buildSignedSessionCookie("PARENT");
  const response = await request.fetch("/api/session/me", {
    headers: {
      cookie
    }
  });

  expect(response.status()).toBe(200);
  const payload = (await response.json()) as {
    authenticated: boolean;
    appRole: string | null;
    dashboardPath: string | null;
  };

  expect(payload.authenticated).toBe(true);
  expect(payload.appRole).toBe("PARENT");
  expect(payload.dashboardPath).toBe("/parent-dashboard");
});

test("regression: school session is recognized by /api/session/me", async ({ request }) => {
  const cookie = await buildSignedSessionCookie("SCHOOL_ADMIN");
  const response = await request.fetch("/api/session/me", {
    headers: {
      cookie
    }
  });

  expect(response.status()).toBe(200);
  const payload = (await response.json()) as {
    authenticated: boolean;
    appRole: string | null;
    dashboardPath: string | null;
    schoolId: string | null;
  };

  expect(payload.authenticated).toBe(true);
  expect(payload.appRole).toBe("SCHOOL_ADMIN");
  expect(payload.schoolId).toBe("school-owner");
  expect(payload.dashboardPath).toBe("/school-dashboard");
});

test("regression: parent session cannot call school-owned endpoints", async ({ request }) => {
  const cookie = await buildSignedSessionCookie("PARENT");
  const response = await request.fetch("/api/schools/profile", {
    method: "PATCH",
    headers: {
      cookie
    },
    data: {
      schoolId: "school-owner",
      name: "Colegio no permitido"
    }
  });

  expect(response.status()).toBe(403);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(payload?.message).toBe("Forbidden");
});

test("regression: school session cannot call admin endpoints", async ({ request }) => {
  const cookie = await buildSignedSessionCookie("SCHOOL_ADMIN");
  const response = await request.fetch("/api/admin/schools/status", {
    method: "PATCH",
    headers: {
      cookie
    },
    data: {
      schoolId: "school-owner",
      active: true
    }
  });

  expect([401, 503]).toContain(response.status());
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(["Unauthorized", "Admin access is not configured for this environment."]).toContain(payload?.message);
});
