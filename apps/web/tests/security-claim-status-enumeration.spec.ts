import { expect, test } from "@playwright/test";

test("school claim status returns a shaped generic response", async ({ request }) => {
  const response = await request.fetch("/api/session/school-claim-status", {
    method: "POST",
    headers: {
      "x-forwarded-for": "203.0.113.10"
    },
    data: {
      email: "persona@dominio.com",
      schoolSlug: "colegio-demo"
    }
  });

  expect(response.status()).toBe(200);
  const payload = (await response.json()) as {
    canLogin: boolean;
    reasonCode: string | null;
    message: string;
    school: unknown;
    claim: unknown;
  };

  expect(payload.canLogin).toBe(false);
  expect(payload.reasonCode).toBeNull();
  expect(payload.school).toBeNull();
  expect(payload.claim).toBeNull();
  expect(payload.message).toContain("te notificaremos por email");
});

test("school claim status does not leak metadata across different identities", async ({ request }) => {
  const first = await request.fetch("/api/session/school-claim-status", {
    method: "POST",
    headers: {
      "x-forwarded-for": "203.0.113.11"
    },
    data: {
      email: "first@example.com",
      schoolSlug: "school-first"
    }
  });
  const second = await request.fetch("/api/session/school-claim-status", {
    method: "POST",
    headers: {
      "x-forwarded-for": "203.0.113.12"
    },
    data: {
      email: "second@example.com",
      schoolSlug: "school-second"
    }
  });

  expect(first.status()).toBe(200);
  expect(second.status()).toBe(200);

  const firstPayload = (await first.json()) as {
    canLogin: boolean;
    reasonCode: string | null;
    school: unknown;
    claim: unknown;
  };
  const secondPayload = (await second.json()) as {
    canLogin: boolean;
    reasonCode: string | null;
    school: unknown;
    claim: unknown;
  };

  expect(firstPayload.canLogin).toBe(false);
  expect(secondPayload.canLogin).toBe(false);
  expect(firstPayload.reasonCode).toBeNull();
  expect(secondPayload.reasonCode).toBeNull();
  expect(firstPayload.school).toBeNull();
  expect(secondPayload.school).toBeNull();
  expect(firstPayload.claim).toBeNull();
  expect(secondPayload.claim).toBeNull();
});

test("school claim status applies request throttling", async ({ request }) => {
  const headers = {
    "x-forwarded-for": "203.0.113.13"
  };

  for (let index = 0; index < 6; index += 1) {
    const response = await request.fetch("/api/session/school-claim-status", {
      method: "POST",
      headers,
      data: {
        email: `user${index}@example.com`,
        schoolSlug: `school-${index}`
      }
    });

    expect(response.status()).toBe(200);
  }

  const blocked = await request.fetch("/api/session/school-claim-status", {
    method: "POST",
    headers,
    data: {
      email: "blocked@example.com",
      schoolSlug: "school-blocked"
    }
  });

  expect(blocked.status()).toBe(429);
  const payload = (await blocked.json()) as { message?: string };
  expect(payload.message).toContain("Demasiadas solicitudes");
});
