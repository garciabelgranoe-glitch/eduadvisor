import { NextRequest } from "next/server";
import { consumeRateLimit } from "./in-memory-rate-limit";

const URL_PATTERN = /(https?:\/\/|www\.)/gi;
const REPEATED_CHAR_PATTERN = /(.)\1{9,}/;
const LONG_TOKEN_PATTERN = /\b[a-zA-Z0-9]{80,}\b/;
const BOT_USER_AGENT_PATTERN = /(curl|wget|python-requests|libwww-perl|go-http-client|scrapy|aiohttp)/i;
const TEMPORARY_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "yopmail.com",
  "tempmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "sharklasers.com",
  "dispostable.com",
  "getnada.com",
  "trashmail.com"
]);

type AbuseDecision =
  | { type: "allow" }
  | { type: "silent_drop"; reason: string }
  | { type: "blocked"; message: string; retryAfterSeconds: number };

interface PublicAbuseProtectionInput {
  request: NextRequest;
  scope: "leads" | "reviews" | "claim";
  body: Record<string, unknown>;
  maxRequests: number;
  windowMs: number;
  blockMs: number;
  perTargetMaxRequests?: number;
  perTargetWindowMs?: number;
  perTargetBlockMs?: number;
  targetKey?: string | null;
  minSubmissionMs?: number;
  honeypotFields?: string[];
  textFields?: string[];
  emailField?: string;
  blockDisposableEmail?: boolean;
  duplicateFingerprintMaxRequests?: number;
  duplicateFingerprintWindowMs?: number;
  duplicateFingerprintBlockMs?: number;
  fingerprintFields?: string[];
}

function getClientIp(request: NextRequest) {
  const ipHeader = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  return ipHeader.split(",")[0]?.trim() || "unknown";
}

function normalizeString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function normalizeUserAgent(request: NextRequest) {
  const raw = request.headers.get("user-agent");
  return typeof raw === "string" ? raw.trim() : "";
}

function detectAutomatedUserAgent(userAgent: string) {
  if (!userAgent) {
    return false;
  }

  return BOT_USER_AGENT_PATTERN.test(userAgent.toLowerCase());
}

function detectHoneypotFilled(body: Record<string, unknown>, honeypotFields: string[]) {
  return honeypotFields.some((field) => normalizeString(body[field]).length > 0);
}

function parseStartedAtTimestamp(body: Record<string, unknown>) {
  const raw = body._startedAt;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.trunc(raw);
  }
  if (typeof raw === "string" && raw.trim().length > 0) {
    const parsed = Number.parseInt(raw.trim(), 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function detectDisposableEmail(body: Record<string, unknown>, emailField: string | undefined) {
  if (!emailField) {
    return false;
  }

  const value = normalizeString(body[emailField]).toLowerCase();
  if (!value || !value.includes("@")) {
    return false;
  }

  const [, domainRaw] = value.split("@");
  const domain = (domainRaw ?? "").trim().toLowerCase();
  if (!domain) {
    return false;
  }

  return TEMPORARY_EMAIL_DOMAINS.has(domain);
}

function normalizeFingerprintValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `array:${value.length}`;
  }

  if (typeof value === "object") {
    return "object";
  }

  return "";
}

function fnv1aHash(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function buildPayloadFingerprint(body: Record<string, unknown>, fields: string[]) {
  const parts: string[] = [];
  for (const field of fields) {
    if (!field || field.startsWith("_")) {
      continue;
    }
    parts.push(`${field}:${normalizeFingerprintValue(body[field])}`);
  }

  if (parts.length === 0) {
    return null;
  }

  return fnv1aHash(parts.join("|"));
}

function detectSuspiciousText(body: Record<string, unknown>, textFields: string[]) {
  for (const field of textFields) {
    const value = normalizeString(body[field]);
    if (!value) {
      continue;
    }

    const urlMatches = value.match(URL_PATTERN);
    if ((urlMatches?.length ?? 0) >= 3) {
      return true;
    }

    if (REPEATED_CHAR_PATTERN.test(value)) {
      return true;
    }

    if (LONG_TOKEN_PATTERN.test(value)) {
      return true;
    }

    const letters = value.replace(/[^a-zA-Z]/g, "");
    const uppercase = letters.replace(/[^A-Z]/g, "");
    if (letters.length > 40 && uppercase.length / letters.length > 0.75) {
      return true;
    }
  }

  return false;
}

function toRetryAfterSeconds(retryAfterMs: number) {
  return Math.max(1, Math.ceil(retryAfterMs / 1000));
}

export function sanitizeForwardPayload<T extends Record<string, unknown>>(body: T): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key.startsWith("_")) {
      continue;
    }
    sanitized[key] = value;
  }
  return sanitized;
}

export function evaluatePublicAbuseProtection(input: PublicAbuseProtectionInput): AbuseDecision {
  const clientIp = getClientIp(input.request);
  const userAgent = normalizeUserAgent(input.request);
  const scopeKey = `public-abuse:${input.scope}:${clientIp}`;
  const rateLimit = consumeRateLimit({
    key: scopeKey,
    maxRequests: input.maxRequests,
    windowMs: input.windowMs,
    blockMs: input.blockMs
  });
  if (!rateLimit.allowed) {
    return {
      type: "blocked",
      message: "Detectamos demasiados intentos. Intenta nuevamente en unos minutos.",
      retryAfterSeconds: toRetryAfterSeconds(rateLimit.retryAfterMs)
    };
  }

  if (detectAutomatedUserAgent(userAgent)) {
    return {
      type: "blocked",
      message: "Detectamos actividad automatizada no permitida.",
      retryAfterSeconds: 300
    };
  }

  if (
    input.targetKey &&
    input.perTargetMaxRequests &&
    input.perTargetWindowMs &&
    input.perTargetBlockMs
  ) {
    const targetRateLimit = consumeRateLimit({
      key: `public-abuse:${input.scope}:${clientIp}:target:${input.targetKey}`,
      maxRequests: input.perTargetMaxRequests,
      windowMs: input.perTargetWindowMs,
      blockMs: input.perTargetBlockMs
    });

    if (!targetRateLimit.allowed) {
      return {
        type: "blocked",
        message: "Detectamos demasiados intentos para este colegio. Intenta más tarde.",
        retryAfterSeconds: toRetryAfterSeconds(targetRateLimit.retryAfterMs)
      };
    }
  }

  if (input.blockDisposableEmail && detectDisposableEmail(input.body, input.emailField)) {
    return {
      type: "blocked",
      message: "No aceptamos emails temporales para este formulario.",
      retryAfterSeconds: 600
    };
  }

  if (
    input.duplicateFingerprintMaxRequests &&
    input.duplicateFingerprintWindowMs &&
    input.duplicateFingerprintBlockMs
  ) {
    const fields =
      input.fingerprintFields && input.fingerprintFields.length > 0
        ? input.fingerprintFields
        : [...new Set([...Object.keys(input.body).filter((key) => !key.startsWith("_")), ...(input.emailField ? [input.emailField] : [])])];
    const fingerprint = buildPayloadFingerprint(input.body, fields);
    if (fingerprint) {
      const duplicate = consumeRateLimit({
        key: `public-abuse:${input.scope}:${clientIp}:fingerprint:${fingerprint}`,
        maxRequests: input.duplicateFingerprintMaxRequests,
        windowMs: input.duplicateFingerprintWindowMs,
        blockMs: input.duplicateFingerprintBlockMs
      });

      if (!duplicate.allowed) {
        return {
          type: "blocked",
          message: "Detectamos envíos repetidos con el mismo contenido. Intenta nuevamente más tarde.",
          retryAfterSeconds: toRetryAfterSeconds(duplicate.retryAfterMs)
        };
      }
    }
  }

  const honeypotFields = input.honeypotFields ?? ["_hpWebsite", "_hpCompany"];
  if (detectHoneypotFilled(input.body, honeypotFields)) {
    return {
      type: "silent_drop",
      reason: "honeypot"
    };
  }

  const startedAt = parseStartedAtTimestamp(input.body);
  const minSubmissionMs = input.minSubmissionMs ?? 600;
  if (startedAt && Date.now() - startedAt < minSubmissionMs) {
    return {
      type: "silent_drop",
      reason: "too_fast"
    };
  }

  const textFields = input.textFields ?? [];
  if (textFields.length > 0 && detectSuspiciousText(input.body, textFields)) {
    return {
      type: "blocked",
      message: "Detectamos contenido no válido en el formulario.",
      retryAfterSeconds: 60
    };
  }

  return { type: "allow" };
}
