import { defineConfig, devices } from "@playwright/test";

const TEST_AUTH_SESSION_SECRET = "test-auth-session-secret";
const TEST_ADMIN_API_KEY = "test-admin-key";
const TEST_ADMIN_CONSOLE_TOKEN = "test-admin-console";
const TEST_ADMIN_EMAIL = "admin@eduadvisor.test";
const TEST_BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const TEST_GOOGLE_OAUTH_CLIENT_ID = "test-google-client-id";
const TEST_GOOGLE_OAUTH_CLIENT_SECRET = "test-google-client-secret";
const TEST_TURNSTILE_SECRET_KEY = "test-turnstile-secret-key";
const TEST_TURNSTILE_SITE_KEY = "test-turnstile-site-key";
const TEST_PUBLIC_FORM_CHALLENGE_REQUIRED = "1";
const TEST_PUBLIC_FORM_CHALLENGE_BYPASS = "1";

process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET ?? TEST_AUTH_SESSION_SECRET;
process.env.ADMIN_API_KEY = process.env.ADMIN_API_KEY ?? TEST_ADMIN_API_KEY;
process.env.ADMIN_CONSOLE_TOKEN = process.env.ADMIN_CONSOLE_TOKEN ?? TEST_ADMIN_CONSOLE_TOKEN;
process.env.ADMIN_ALLOWED_EMAILS = process.env.ADMIN_ALLOWED_EMAILS ?? TEST_ADMIN_EMAIL;
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? TEST_BASE_URL;
process.env.GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID ?? TEST_GOOGLE_OAUTH_CLIENT_ID;
process.env.GOOGLE_OAUTH_CLIENT_SECRET =
  process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? TEST_GOOGLE_OAUTH_CLIENT_SECRET;
process.env.TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY ?? TEST_TURNSTILE_SECRET_KEY;
process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? TEST_TURNSTILE_SITE_KEY;
process.env.PUBLIC_FORM_CHALLENGE_REQUIRED =
  process.env.PUBLIC_FORM_CHALLENGE_REQUIRED ?? TEST_PUBLIC_FORM_CHALLENGE_REQUIRED;
process.env.PUBLIC_FORM_CHALLENGE_TEST_BYPASS =
  process.env.PUBLIC_FORM_CHALLENGE_TEST_BYPASS ?? TEST_PUBLIC_FORM_CHALLENGE_BYPASS;

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: {
    timeout: 5_000
  },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "corepack pnpm build && corepack pnpm start -p 3000",
    port: 3000,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET ?? TEST_AUTH_SESSION_SECRET,
      ADMIN_API_KEY: process.env.ADMIN_API_KEY ?? TEST_ADMIN_API_KEY,
      ADMIN_CONSOLE_TOKEN: process.env.ADMIN_CONSOLE_TOKEN ?? TEST_ADMIN_CONSOLE_TOKEN,
      ADMIN_ALLOWED_EMAILS: process.env.ADMIN_ALLOWED_EMAILS ?? TEST_ADMIN_EMAIL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? TEST_BASE_URL,
      GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID ?? TEST_GOOGLE_OAUTH_CLIENT_ID,
      GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? TEST_GOOGLE_OAUTH_CLIENT_SECRET,
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ?? TEST_TURNSTILE_SECRET_KEY,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? TEST_TURNSTILE_SITE_KEY,
      PUBLIC_FORM_CHALLENGE_REQUIRED:
        process.env.PUBLIC_FORM_CHALLENGE_REQUIRED ?? TEST_PUBLIC_FORM_CHALLENGE_REQUIRED,
      PUBLIC_FORM_CHALLENGE_PROVIDER: process.env.PUBLIC_FORM_CHALLENGE_PROVIDER ?? "turnstile",
      PUBLIC_FORM_CHALLENGE_TEST_BYPASS:
        process.env.PUBLIC_FORM_CHALLENGE_TEST_BYPASS ?? TEST_PUBLIC_FORM_CHALLENGE_BYPASS
    }
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
