import { expect, test } from "@playwright/test";
import { createAuthSession, createSignedSessionToken } from "../lib/auth/session";

process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET ?? "test-auth-session-secret";

test("schools/profile rejects anonymous access", async ({ request }) => {
  const response = await request.fetch("/api/schools/profile", {
    method: "PATCH",
    data: {
      schoolId: "school-1",
      name: "Colegio Demo"
    }
  });

  expect(response.status()).toBe(401);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(payload?.message).toBe("Unauthorized");
});

test("schools/profile enforces school ownership from session scope", async ({ request }) => {
  const session = await createAuthSession({
    userId: "school-admin-test",
    email: "admin@colegio.test",
    role: "SCHOOL_ADMIN",
    schoolId: "school-owner",
    schoolSlug: "school-owner"
  });
  const token = await createSignedSessionToken(session);
  if (!token) {
    throw new Error("Could not generate a signed school session token.");
  }

  const response = await request.fetch("/api/schools/profile", {
    method: "PATCH",
    headers: {
      cookie: `eduadvisor_session=${token}`
    },
    data: {
      schoolId: "school-other",
      name: "Colegio No Permitido"
    }
  });

  expect(response.status()).toBe(403);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(payload?.message).toBe("No tienes permisos para operar sobre este colegio.");
});

test("schools/leads-export rejects anonymous access", async ({ request }) => {
  const response = await request.fetch("/api/schools/leads-export?schoolId=school-owner", {
    method: "GET"
  });

  expect(response.status()).toBe(401);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(payload?.message).toBe("Unauthorized");
});

test("schools/leads-export enforces school ownership from session scope", async ({ request }) => {
  const session = await createAuthSession({
    userId: "school-admin-test",
    email: "admin@colegio.test",
    role: "SCHOOL_ADMIN",
    schoolId: "school-owner",
    schoolSlug: "school-owner"
  });
  const token = await createSignedSessionToken(session);
  if (!token) {
    throw new Error("Could not generate a signed school session token.");
  }

  const response = await request.fetch("/api/schools/leads-export?schoolId=school-other", {
    method: "GET",
    headers: {
      cookie: `eduadvisor_session=${token}`
    }
  });

  expect(response.status()).toBe(403);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(payload?.message).toBe("No tienes permisos para operar sobre este colegio.");
});

test("reviews/respond rejects anonymous access", async ({ request }) => {
  const response = await request.fetch("/api/reviews/respond", {
    method: "PATCH",
    data: {
      reviewId: "review-1",
      schoolId: "school-owner",
      response: "Gracias por el comentario."
    }
  });

  expect(response.status()).toBe(401);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(payload?.message).toBe("Unauthorized");
});

test("reviews/respond enforces school ownership from session scope", async ({ request }) => {
  const session = await createAuthSession({
    userId: "school-admin-test",
    email: "admin@colegio.test",
    role: "SCHOOL_ADMIN",
    schoolId: "school-owner",
    schoolSlug: "school-owner"
  });
  const token = await createSignedSessionToken(session);
  if (!token) {
    throw new Error("Could not generate a signed school session token.");
  }

  const response = await request.fetch("/api/reviews/respond", {
    method: "PATCH",
    headers: {
      cookie: `eduadvisor_session=${token}`
    },
    data: {
      reviewId: "review-1",
      schoolId: "school-other",
      response: "Respuesta no permitida"
    }
  });

  expect(response.status()).toBe(403);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(payload?.message).toBe("No tienes permisos para operar sobre este colegio.");
});

test("leads/status rejects anonymous access", async ({ request }) => {
  const response = await request.fetch("/api/leads/status", {
    method: "PATCH",
    data: {
      leadId: "lead-1",
      schoolId: "school-owner",
      status: "CONTACTED"
    }
  });

  expect(response.status()).toBe(401);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(payload?.message).toBe("Unauthorized");
});

test("leads/status enforces school ownership from session scope", async ({ request }) => {
  const session = await createAuthSession({
    userId: "school-admin-test",
    email: "admin@colegio.test",
    role: "SCHOOL_ADMIN",
    schoolId: "school-owner",
    schoolSlug: "school-owner"
  });
  const token = await createSignedSessionToken(session);
  if (!token) {
    throw new Error("Could not generate a signed school session token.");
  }

  const response = await request.fetch("/api/leads/status", {
    method: "PATCH",
    headers: {
      cookie: `eduadvisor_session=${token}`
    },
    data: {
      leadId: "lead-1",
      schoolId: "school-other",
      status: "CONTACTED"
    }
  });

  expect(response.status()).toBe(403);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(payload?.message).toBe("No tienes permisos para operar sobre este colegio.");
});
