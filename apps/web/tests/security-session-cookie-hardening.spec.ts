import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";

function getSetCookieHeaders(response: { headersArray(): Array<{ name: string; value: string }> }) {
  return response
    .headersArray()
    .filter((header) => header.name.toLowerCase() === "set-cookie")
    .map((header) => header.value);
}

function createSignedSessionToken(payload: Record<string, unknown>, secret: string) {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

test("admin oauth start sets hardened transient cookies", async ({ request }) => {
  const response = await request.fetch("/api/session/google/start?intent=admin&next=/admin", {
    method: "GET",
    maxRedirects: 0
  });

  expect(response.status()).toBe(303);
  const cookies = getSetCookieHeaders(response);
  const oauthState = cookies.find((cookie) => cookie.startsWith("eduadvisor_google_oauth_state="));
  const oauthNext = cookies.find((cookie) => cookie.startsWith("eduadvisor_google_oauth_next="));
  const oauthIntent = cookies.find((cookie) => cookie.startsWith("eduadvisor_google_oauth_intent="));

  expect(oauthState).toBeTruthy();
  expect(oauthNext).toBeTruthy();
  expect(oauthIntent).toBeTruthy();

  for (const cookie of [oauthState, oauthNext, oauthIntent]) {
    const normalized = cookie?.toLowerCase() ?? "";
    expect(normalized).toContain("httponly");
    expect(normalized).toContain("path=/");
    expect(normalized).toContain("samesite=lax");
    expect(normalized).toContain("priority=high");
  }
});

test("session/me rotates near-expiry sessions", async ({ request }) => {
  const now = Date.now();
  const almostExpiredSession = {
    userId: "rotation-test-user",
    email: "rotation-test@eduadvisor.test",
    role: "PARENT",
    schoolId: null,
    schoolSlug: null,
    issuedAt: now - 60_000,
    expiresAt: now + 60_000
  };
  const authSecret = process.env.AUTH_SESSION_SECRET ?? "test-auth-session-secret";
  const token = createSignedSessionToken(almostExpiredSession, authSecret);

  const response = await request.fetch("/api/session/me", {
    method: "GET",
    headers: {
      cookie: `eduadvisor_session=${token}`
    }
  });

  expect(response.ok()).toBeTruthy();

  const cookies = getSetCookieHeaders(response);
  const sessionCookie = cookies.find((cookie) => cookie.startsWith("eduadvisor_session="));

  expect(sessionCookie).toBeTruthy();
  const normalized = sessionCookie?.toLowerCase() ?? "";
  expect(normalized).toContain("httponly");
  expect(normalized).toContain("path=/");
  expect(normalized).toContain("samesite=lax");
  expect(normalized).toContain("priority=high");
});
