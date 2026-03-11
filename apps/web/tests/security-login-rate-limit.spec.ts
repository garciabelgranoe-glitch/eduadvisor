import { expect, test } from "@playwright/test";

test("session role login endpoint applies brute-force throttling", async ({ request }) => {
  const headers = {
    "x-forwarded-for": "203.0.113.50"
  };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await request.fetch("/api/session/role", {
      method: "POST",
      headers,
      data: {
        role: "PARENT",
        email: `invalid-${attempt}`,
        next: "/parent-dashboard"
      },
      maxRedirects: 0
    });
    expect(response.status()).toBe(303);
  }

  const blocked = await request.fetch("/api/session/role", {
    method: "POST",
    headers,
    data: {
      role: "PARENT",
      email: "still-invalid",
      next: "/parent-dashboard"
    },
    maxRedirects: 0
  });

  expect(blocked.status()).toBe(429);
  expect(blocked.headers()["retry-after"]).toBeTruthy();
  const payload = (await blocked.json()) as { message?: string; code?: string };
  expect(payload.message).toContain("Demasiados intentos");
  expect(payload.code).toBe("RATE_LIMIT");
});

test("admin login endpoint applies brute-force throttling", async ({ request }) => {
  const headers = {
    "x-forwarded-for": "203.0.113.51"
  };
  const adminEmail = process.env.ADMIN_ALLOWED_EMAILS?.split(",")[0]?.trim() || "admin@eduadvisor.test";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await request.fetch("/api/session/admin", {
      method: "POST",
      headers,
      data: {
        email: adminEmail,
        accessCode: `invalid-${attempt}`,
        next: "/admin"
      },
      maxRedirects: 0
    });
    expect(response.status()).toBe(409);
    const payload = (await response.json()) as { code?: string };
    expect(payload.code).toBe("ADMIN_USE_GOOGLE");
  }

  const blocked = await request.fetch("/api/session/admin", {
    method: "POST",
    headers,
    data: {
      email: adminEmail,
      accessCode: "invalid-last",
      next: "/admin"
    },
    maxRedirects: 0
  });

  expect(blocked.status()).toBe(429);
  expect(blocked.headers()["retry-after"]).toBeTruthy();
  const payload = (await blocked.json()) as { message?: string; code?: string };
  expect(payload.message).toContain("Demasiados intentos");
  expect(payload.code).toBe("RATE_LIMIT");
});
