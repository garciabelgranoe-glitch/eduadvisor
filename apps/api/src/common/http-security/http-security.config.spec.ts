import {
  buildApiSecurityHeaders,
  buildCorsAllowlist,
  isCorsOriginAllowed,
  isLocalNodeEnv
} from "./http-security.config";

describe("http-security config", () => {
  it("builds CORS allowlist from env and local defaults", () => {
    const allowlist = buildCorsAllowlist({
      NEXT_PUBLIC_APP_URL: "https://eduadvisor.com/",
      CORS_ALLOWED_ORIGINS: "https://app.eduadvisor.com, https://partners.eduadvisor.com/"
    } as NodeJS.ProcessEnv);

    expect(allowlist).toEqual(
      expect.arrayContaining([
        "https://eduadvisor.com",
        "https://app.eduadvisor.com",
        "https://partners.eduadvisor.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
      ])
    );
  });

  it("allows requests with no origin and allowlisted origins only", () => {
    const allowlist = ["https://eduadvisor.com", "http://localhost:3000"];

    expect(isCorsOriginAllowed(undefined, allowlist)).toBe(true);
    expect(isCorsOriginAllowed("https://eduadvisor.com/", allowlist)).toBe(true);
    expect(isCorsOriginAllowed("https://evil.example", allowlist)).toBe(false);
  });

  it("adds HSTS header outside local environments", () => {
    const productionHeaders = buildApiSecurityHeaders({
      NODE_ENV: "production"
    } as NodeJS.ProcessEnv);
    const developmentHeaders = buildApiSecurityHeaders({
      NODE_ENV: "development"
    } as NodeJS.ProcessEnv);

    expect(productionHeaders["Strict-Transport-Security"]).toBeDefined();
    expect(developmentHeaders["Strict-Transport-Security"]).toBeUndefined();
  });

  it("detects local node env correctly", () => {
    expect(isLocalNodeEnv("development")).toBe(true);
    expect(isLocalNodeEnv("test")).toBe(true);
    expect(isLocalNodeEnv("production")).toBe(false);
  });
});
