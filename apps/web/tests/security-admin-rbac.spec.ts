import { expect, test } from "@playwright/test";
import { createAdminSession, createSignedAdminSessionToken } from "../lib/auth/session";

const ADMIN_ROUTES = [
  {
    path: "/api/admin/schools/status",
    method: "PATCH",
    payload: {
      schoolId: "school-test-id",
      active: true
    }
  },
  {
    path: "/api/admin/claim-requests/status",
    method: "PATCH",
    payload: {
      claimRequestId: "claim-test-id",
      status: "UNDER_REVIEW"
    }
  },
  {
    path: "/api/admin/subscriptions/status",
    method: "PATCH",
    payload: {
      schoolId: "school-test-id",
      status: "ACTIVE"
    }
  },
  {
    path: "/api/admin/billing/checkout",
    method: "POST",
    payload: {
      schoolId: "school-test-id"
    }
  },
  {
    path: "/api/admin/billing/simulate",
    method: "POST",
    payload: {
      schoolId: "school-test-id",
      eventType: "invoice.paid"
    }
  },
  {
    path: "/api/reviews/moderate",
    method: "PATCH",
    payload: {
      reviewId: "review-test-id",
      status: "APPROVED"
    }
  }
] as const;

test("admin endpoints reject anonymous access", async ({ request }) => {
  for (const route of ADMIN_ROUTES) {
    const response = await request.fetch(route.path, {
      method: route.method,
      data: route.payload
    });

    expect(response.status()).toBe(401);
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    expect(payload?.message).toBe("Unauthorized");
  }
});

test("admin endpoints reject invalid admin session cookie", async ({ request }) => {
  const response = await request.fetch("/api/admin/schools/status", {
    method: "PATCH",
    headers: {
      cookie: "eduadmin_session=invalid-token"
    },
    data: {
      schoolId: "school-test-id",
      active: true
    }
  });

  expect(response.status()).toBe(401);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(payload?.message).toBe("Unauthorized");
});

test("admin endpoint accepts a valid admin session and continues validation", async ({ request }) => {
  const expectedEmail = process.env.ADMIN_ALLOWED_EMAILS?.split(",")[0]?.trim() || "admin@eduadvisor.test";
  const session = await createAdminSession({ email: expectedEmail });
  const signed = session ? await createSignedAdminSessionToken(session) : null;
  expect(signed).toBeTruthy();
  const cookieValue = `eduadmin_session=${signed}`;

  const response = await request.fetch("/api/admin/schools/status", {
    method: "PATCH",
    headers: {
      cookie: cookieValue
    },
    data: {}
  });

  expect(response.status()).toBe(400);
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  expect(payload?.message).toBe("schoolId y active son requeridos");
});
