import { expect, test, type Page } from "@playwright/test";
import { createHmac } from "node:crypto";
import {
  ADMIN_ROLE_PLATFORM_ADMIN,
  ADMIN_SESSION_COOKIE,
  APP_ROLE_PARENT,
  APP_ROLE_SCHOOL_ADMIN,
  resolveSessionTtlSeconds,
  SESSION_COOKIE
} from "../lib/auth/session";

const SCHOOL_SLUG = "colegio-nacional-de-monserrat-u-n-c-cordoba";
const DEFAULT_ADMIN_EMAIL = "admin@eduadvisor.test";

async function setSignedUserSession(
  page: Page,
  input: {
    userId: string;
    email: string;
    role: typeof APP_ROLE_PARENT | typeof APP_ROLE_SCHOOL_ADMIN;
    schoolId?: string;
    schoolSlug?: string;
  }
) {
  const now = Date.now();
  const ttlSeconds = resolveSessionTtlSeconds();
  const session = {
    userId: input.userId,
    email: input.email.trim().toLowerCase(),
    role: input.role,
    schoolId: input.schoolId ?? null,
    schoolSlug: input.schoolSlug ?? null,
    issuedAt: now,
    expiresAt: now + ttlSeconds * 1000
  };
  const encodedPayload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const secret = process.env.AUTH_SESSION_SECRET ?? "test-auth-session-secret";
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  const signedToken = `${encodedPayload}.${signature}`;

  await page.context().addCookies([
    {
      name: SESSION_COOKIE,
      value: signedToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax"
    }
  ]);
}

async function setSignedAdminSession(page: Page, email: string) {
  const now = Date.now();
  const ttlSeconds = Number.parseInt(process.env.ADMIN_SESSION_TTL_SECONDS ?? "43200", 10);
  const session = {
    adminId: `admin:${email.trim().toLowerCase()}`,
    email: email.trim().toLowerCase(),
    role: ADMIN_ROLE_PLATFORM_ADMIN,
    issuedAt: now,
    expiresAt: now + Math.max(1, ttlSeconds) * 1000
  };
  const encodedPayload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const secret =
    process.env.ADMIN_AUTH_SESSION_SECRET ?? process.env.AUTH_SESSION_SECRET ?? "test-auth-session-secret";
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  const signedToken = `${encodedPayload}.${signature}`;

  await page.context().addCookies([
    {
      name: ADMIN_SESSION_COOKIE,
      value: signedToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Strict"
    }
  ]);
}

test("GTM-025 search renderiza módulos críticos", async ({ page }) => {
  await page.goto("/search?q=colegio&city=cordoba&country=AR");

  await expect(page.getByRole("heading", { name: /colegios encontrados/i })).toBeVisible();
  await expect(page.locator('iframe[title^="Mapa de resultados para"]')).toBeVisible();

  const hasResults = page.getByRole("link", { name: /Ver perfil/i }).first();
  const noResults = page.getByText("No encontramos resultados");
  await expect(hasResults.or(noResults)).toBeVisible();
});

test("GTM-025 login y guardas de acceso por rol", async ({ page }) => {
  await page.goto("/ingresar");

  await expect(page.getByRole("heading", { name: "Ingresar a tu espacio" })).toBeVisible();

  const googleEnabled =
    page.getByRole("link", { name: "Entrar con Google" }).or(page.getByRole("button", { name: "Entrar con Google" }));
  const googleDisabled = page.getByRole("button", { name: "Google no configurado" });
  await expect(googleEnabled.or(googleDisabled).first()).toBeVisible();

  await expect(page.getByRole("button", { name: "Entrar como colegio" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Iniciar claim de colegio" })).toBeVisible();

  await page.goto("/parent-dashboard");
  await expect(page).toHaveURL(/\/ingresar\?next=%2Fparent-dashboard/);

  await page.goto("/school-dashboard");
  await expect(page).toHaveURL(/\/ingresar\?next=%2Fschool-dashboard/);
});

test("GTM-025 dashboards parent y school responden con sesión válida", async ({ page }) => {
  await setSignedUserSession(page, {
    userId: "qa-parent-user",
    email: "qa.parent@example.eduadvisor",
    role: APP_ROLE_PARENT
  });

  await page.goto("/parent-dashboard");
  await expect(page.getByRole("heading", { name: "Panel de familias" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Colegios guardados" })).toBeVisible();

  await page.context().clearCookies();

  await setSignedUserSession(page, {
    userId: "qa-school-user",
    email: "qa.school@example.eduadvisor",
    role: APP_ROLE_SCHOOL_ADMIN,
    schoolId: "qa-school-id",
    schoolSlug: SCHOOL_SLUG
  });

  await page.goto(`/school-dashboard?school=${SCHOOL_SLUG}`);
  await expect(page).toHaveURL(/\/school-dashboard/);
  await expect(page.getByRole("heading", { name: /Panel de colegio/i })).toBeVisible();
});

test("GTM-025 billing admin queda accesible para sesión admin", async ({ page }) => {
  const adminEmail = process.env.ADMIN_ALLOWED_EMAILS?.split(",")[0]?.trim() || DEFAULT_ADMIN_EMAIL;
  await setSignedAdminSession(page, adminEmail);

  await page.goto("/admin/billing");
  await expect(page).toHaveURL(/\/admin\/billing/);

  const billingLoaded = page.getByText("Estado de facturación");
  const billingFallbackLegacy = page.getByText("No se pudo cargar el módulo de billing.");
  const billingFallbackCurrent = page.getByText("No se pudo cargar el módulo de facturación.");
  await expect(billingLoaded.or(billingFallbackLegacy).or(billingFallbackCurrent)).toBeVisible();
});
