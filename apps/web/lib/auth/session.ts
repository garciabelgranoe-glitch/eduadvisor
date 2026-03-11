export const SESSION_COOKIE = "eduadvisor_session";
export const LEGACY_SESSION_ROLE_COOKIE = "eduadvisor_session_role";
export const ADMIN_SESSION_COOKIE = "eduadmin_session";
export const GOOGLE_OAUTH_STATE_COOKIE = "eduadvisor_google_oauth_state";
export const GOOGLE_OAUTH_NEXT_COOKIE = "eduadvisor_google_oauth_next";
export const GOOGLE_OAUTH_INTENT_COOKIE = "eduadvisor_google_oauth_intent";

export const SESSION_ROLE_PARENT = "PARENT";
export const SESSION_ROLE_SCHOOL = "SCHOOL";
export const ADMIN_ROLE_PLATFORM_ADMIN = "PLATFORM_ADMIN";

export const APP_ROLE_PARENT = "PARENT";
export const APP_ROLE_SCHOOL_ADMIN = "SCHOOL_ADMIN";

export type SessionRole = typeof SESSION_ROLE_PARENT | typeof SESSION_ROLE_SCHOOL;
export type AppSessionRole = typeof APP_ROLE_PARENT | typeof APP_ROLE_SCHOOL_ADMIN;
export type AdminSessionRole = typeof ADMIN_ROLE_PLATFORM_ADMIN;
type CookieSameSite = "lax" | "strict" | "none";

const LOCAL_NODE_ENVS = new Set(["development", "test"]);
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const SESSION_DEFAULT_TTL_SECONDS = 60 * 60 * 12;
const SESSION_MIN_TTL_SECONDS = 60 * 15;
const SESSION_MAX_TTL_SECONDS = 60 * 60 * 24;
const SESSION_RENEW_WINDOW_SECONDS = 60 * 30;
const OAUTH_STATE_TTL_SECONDS = 60 * 10;
const ADMIN_SESSION_DEFAULT_TTL_SECONDS = 60 * 60 * 12;
const ADMIN_SESSION_MIN_TTL_SECONDS = 60 * 15;
const ADMIN_SESSION_MAX_TTL_SECONDS = 60 * 60 * 24;
const ADMIN_ALLOWED_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getExpectedAdminAccessCode() {
  const token = process.env.ADMIN_CONSOLE_TOKEN?.trim();
  return token || null;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: AppSessionRole;
  schoolId: string | null;
  schoolSlug: string | null;
  issuedAt: number;
  expiresAt: number;
}

export interface AdminSession {
  adminId: string;
  email: string;
  role: AdminSessionRole;
  issuedAt: number;
  expiresAt: number;
}

interface CreateSessionInput {
  userId: string;
  email: string;
  role: AppSessionRole;
  schoolId?: string | null;
  schoolSlug?: string | null;
  ttlSeconds?: number;
}

interface CreateAdminSessionInput {
  email: string;
  role?: AdminSessionRole;
  ttlSeconds?: number;
}

interface AuthCookieOptionsInput {
  requestProtocol: string;
  requestHostname?: string;
  path: string;
  maxAge: number;
  sameSite?: CookieSameSite;
  httpOnly?: boolean;
}

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();
  return secret || null;
}

function getAdminSessionSecret() {
  const secret = process.env.ADMIN_AUTH_SESSION_SECRET?.trim() || process.env.AUTH_SESSION_SECRET?.trim();
  return secret || null;
}

function encodeBase64Url(value: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }

  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64url").toString("utf8");
  }

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

async function signValue(input: string, secret: string) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    return null;
  }

  const encoder = new TextEncoder();
  const key = await subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign"
  ]);
  const signature = await subtle.sign("HMAC", key, encoder.encode(input));
  const bytes = new Uint8Array(signature);

  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function buildSignedValue(payload: string, signature: string) {
  return `${payload}.${signature}`;
}

function splitSignedValue(token: string) {
  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex <= 0) {
    return null;
  }

  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);

  if (!payload || !signature) {
    return null;
  }

  return { payload, signature };
}

function isValidAppRole(value: string): value is AppSessionRole {
  return value === APP_ROLE_PARENT || value === APP_ROLE_SCHOOL_ADMIN;
}

function isValidAdminRole(value: string): value is AdminSessionRole {
  return value === ADMIN_ROLE_PLATFORM_ADMIN;
}

function isValidSessionPayload(input: unknown): input is AuthSession {
  if (!input || typeof input !== "object") {
    return false;
  }

  const value = input as Record<string, unknown>;

  if (typeof value.userId !== "string" || value.userId.trim().length === 0) {
    return false;
  }

  if (typeof value.email !== "string" || value.email.trim().length === 0) {
    return false;
  }

  if (typeof value.role !== "string" || !isValidAppRole(value.role)) {
    return false;
  }

  const schoolIdValid = value.schoolId === null || typeof value.schoolId === "string";
  const schoolSlugValid = value.schoolSlug === null || typeof value.schoolSlug === "string";
  if (!schoolIdValid || !schoolSlugValid) {
    return false;
  }

  if (typeof value.issuedAt !== "number" || typeof value.expiresAt !== "number") {
    return false;
  }

  return true;
}

function isValidAdminSessionPayload(input: unknown): input is AdminSession {
  if (!input || typeof input !== "object") {
    return false;
  }

  const value = input as Record<string, unknown>;

  if (typeof value.adminId !== "string" || value.adminId.trim().length === 0) {
    return false;
  }

  if (typeof value.email !== "string" || value.email.trim().length === 0) {
    return false;
  }

  if (typeof value.role !== "string" || !isValidAdminRole(value.role)) {
    return false;
  }

  if (typeof value.issuedAt !== "number" || typeof value.expiresAt !== "number") {
    return false;
  }

  return true;
}

function parsePositiveInteger(input: string | undefined, fallback: number) {
  if (!input) {
    return fallback;
  }

  const parsed = Number.parseInt(input, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function resolveSessionTtlSeconds(ttlSeconds?: number) {
  const configuredTtl = parsePositiveInteger(process.env.AUTH_SESSION_TTL_SECONDS, SESSION_DEFAULT_TTL_SECONDS);
  const source = typeof ttlSeconds === "number" && Number.isFinite(ttlSeconds) ? Math.floor(ttlSeconds) : configuredTtl;
  return Math.min(Math.max(source, SESSION_MIN_TTL_SECONDS), SESSION_MAX_TTL_SECONDS);
}

export function resolveAdminSessionTtlSeconds(ttlSeconds?: number) {
  const configuredTtl = parsePositiveInteger(process.env.ADMIN_SESSION_TTL_SECONDS, ADMIN_SESSION_DEFAULT_TTL_SECONDS);
  const source = typeof ttlSeconds === "number" && Number.isFinite(ttlSeconds) ? Math.floor(ttlSeconds) : configuredTtl;
  return Math.min(Math.max(source, ADMIN_SESSION_MIN_TTL_SECONDS), ADMIN_SESSION_MAX_TTL_SECONDS);
}

export function normalizeAdminIdentityEmail(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!ADMIN_ALLOWED_EMAIL_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
}

export function getAllowedAdminEmails() {
  const raw = process.env.ADMIN_ALLOWED_EMAILS?.trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((entry) => normalizeAdminIdentityEmail(entry))
    .filter((entry): entry is string => Boolean(entry));
}

export function isAdminIdentityAllowed(email: string) {
  const normalized = normalizeAdminIdentityEmail(email);
  if (!normalized) {
    return false;
  }

  const allowList = getAllowedAdminEmails();
  if (allowList.length === 0) {
    const nodeEnv = process.env.NODE_ENV ?? "development";
    return LOCAL_NODE_ENVS.has(nodeEnv);
  }

  return allowList.includes(normalized);
}

export function shouldUseSecureCookies(requestProtocol: string, requestHostname?: string) {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  if (requestHostname && LOCAL_HOSTNAMES.has(requestHostname.trim().toLowerCase())) {
    return false;
  }

  return requestProtocol === "https:" || !LOCAL_NODE_ENVS.has(nodeEnv);
}

export function buildAuthCookieOptions(input: AuthCookieOptionsInput) {
  return {
    httpOnly: input.httpOnly ?? true,
    sameSite: input.sameSite ?? "lax",
    secure: shouldUseSecureCookies(input.requestProtocol, input.requestHostname),
    path: input.path,
    maxAge: input.maxAge,
    priority: "high" as const
  };
}

export function buildExpiredAuthCookieOptions(
  requestProtocol: string,
  path: string,
  sameSite: CookieSameSite = "lax",
  requestHostname?: string
) {
  return buildAuthCookieOptions({
    requestProtocol,
    requestHostname,
    path,
    maxAge: 0,
    sameSite
  });
}

export function getOauthTransientCookieTtlSeconds() {
  return parsePositiveInteger(process.env.AUTH_OAUTH_STATE_TTL_SECONDS, OAUTH_STATE_TTL_SECONDS);
}

export function shouldRenewSession(session: AuthSession, now = Date.now()) {
  return session.expiresAt - now <= SESSION_RENEW_WINDOW_SECONDS * 1000;
}

export function renewAuthSession(session: AuthSession, ttlSeconds?: number) {
  const now = Date.now();
  const ttl = resolveSessionTtlSeconds(ttlSeconds);

  return {
    ...session,
    issuedAt: now,
    expiresAt: now + ttl * 1000
  };
}

export function normalizeSessionRole(value: string | null | undefined): SessionRole | null {
  if (value === SESSION_ROLE_PARENT || value === SESSION_ROLE_SCHOOL) {
    return value;
  }

  return null;
}

export function roleToDashboardPath(role: AppSessionRole): "/parent-dashboard" | "/school-dashboard" {
  return role === APP_ROLE_PARENT ? "/parent-dashboard" : "/school-dashboard";
}

export function dashboardPathForRole(role: SessionRole): "/parent-dashboard" | "/school-dashboard" {
  return role === SESSION_ROLE_PARENT ? "/parent-dashboard" : "/school-dashboard";
}

export function toUiSessionRole(role: AppSessionRole | null | undefined): SessionRole | null {
  if (role === APP_ROLE_PARENT) {
    return SESSION_ROLE_PARENT;
  }

  if (role === APP_ROLE_SCHOOL_ADMIN) {
    return SESSION_ROLE_SCHOOL;
  }

  return null;
}

export function buildDashboardPathForSession(session: AuthSession) {
  if (session.role === APP_ROLE_PARENT) {
    return "/parent-dashboard" as const;
  }

  if (session.schoolSlug) {
    return `/school-dashboard?school=${encodeURIComponent(session.schoolSlug)}`;
  }

  return "/school-dashboard" as const;
}

export function buildDashboardRouteForSession(session: AuthSession): "/parent-dashboard" | "/school-dashboard" {
  return session.role === APP_ROLE_PARENT ? "/parent-dashboard" : "/school-dashboard";
}

export async function createSignedSessionToken(payload: AuthSession) {
  const secret = getSessionSecret();
  if (!secret) {
    return null;
  }

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signValue(encodedPayload, secret);

  if (!signature) {
    return null;
  }

  return buildSignedValue(encodedPayload, signature);
}

export async function verifySignedSessionToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const secret = getSessionSecret();
  if (!secret) {
    return null;
  }

  const parts = splitSignedValue(token);
  if (!parts) {
    return null;
  }

  const expectedSignature = await signValue(parts.payload, secret);
  if (!expectedSignature || expectedSignature !== parts.signature) {
    return null;
  }

  try {
    const decoded = decodeBase64Url(parts.payload);
    const parsed = JSON.parse(decoded) as unknown;

    if (!isValidSessionPayload(parsed)) {
      return null;
    }

    const now = Date.now();

    if (parsed.expiresAt <= now || parsed.expiresAt <= parsed.issuedAt) {
      return null;
    }

    if (parsed.issuedAt > now + 5 * 60 * 1000) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function createAdminSession(input: CreateAdminSessionInput) {
  const normalizedEmail = normalizeAdminIdentityEmail(input.email);
  if (!normalizedEmail) {
    return null;
  }

  const issuedAt = Date.now();
  const ttlSeconds = resolveAdminSessionTtlSeconds(input.ttlSeconds);
  const expiresAt = issuedAt + ttlSeconds * 1000;

  const role = input.role ?? ADMIN_ROLE_PLATFORM_ADMIN;

  const session: AdminSession = {
    adminId: `admin:${normalizedEmail}`,
    email: normalizedEmail,
    role,
    issuedAt,
    expiresAt
  };

  return session;
}

export async function createSignedAdminSessionToken(payload: AdminSession) {
  const secret = getAdminSessionSecret();
  if (!secret) {
    return null;
  }

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signValue(encodedPayload, secret);

  if (!signature) {
    return null;
  }

  return buildSignedValue(encodedPayload, signature);
}

export async function verifySignedAdminSessionToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const secret = getAdminSessionSecret();
  if (!secret) {
    return null;
  }

  const parts = splitSignedValue(token);
  if (!parts) {
    return null;
  }

  const expectedSignature = await signValue(parts.payload, secret);
  if (!expectedSignature || expectedSignature !== parts.signature) {
    return null;
  }

  try {
    const decoded = decodeBase64Url(parts.payload);
    const parsed = JSON.parse(decoded) as unknown;

    if (!isValidAdminSessionPayload(parsed)) {
      return null;
    }

    const now = Date.now();
    if (parsed.expiresAt <= now || parsed.expiresAt <= parsed.issuedAt) {
      return null;
    }

    if (!isAdminIdentityAllowed(parsed.email)) {
      return null;
    }

    if (parsed.issuedAt > now + 5 * 60 * 1000) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function createAuthSession(input: CreateSessionInput) {
  const issuedAt = Date.now();
  const ttlSeconds = resolveSessionTtlSeconds(input.ttlSeconds);
  const expiresAt = issuedAt + ttlSeconds * 1000;

  const session: AuthSession = {
    userId: input.userId,
    email: input.email.trim().toLowerCase(),
    role: input.role,
    schoolId: input.schoolId ?? null,
    schoolSlug: input.schoolSlug ?? null,
    issuedAt,
    expiresAt
  };

  return session;
}
