import { expect, test } from "@playwright/test";

test("web responses include hardened security headers", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBeTruthy();

  const headers = response.headers();
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("geolocation=()");
  if (headers["strict-transport-security"]) {
    expect(headers["strict-transport-security"]).toContain("max-age=");
  }
});
