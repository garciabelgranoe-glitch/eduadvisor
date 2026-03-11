import { Injectable, Logger } from "@nestjs/common";
import { createHash } from "node:crypto";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const SENSITIVE_ROUTE_PREFIXES = [
  "/v1/admin",
  "/v1/auth",
  "/v1/billing",
  "/v1/reviews",
  "/v1/leads",
  "/v1/schools",
  "/v1/parents",
  "/v1/search"
];

const SAFE_BODY_KEYS = new Set([
  "id",
  "slug",
  "schoolId",
  "schoolSlug",
  "reviewId",
  "leadId",
  "claimRequestId",
  "subscriptionId",
  "role",
  "status",
  "action",
  "eventType",
  "city",
  "province",
  "country",
  "page",
  "limit",
  "sortBy",
  "sortOrder"
]);

const SECRET_KEY_PATTERN = /(password|secret|token|authorization|cookie|api[-_]?key|access[-_]?code)/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_PATTERN = /\+?\d[\d\s().-]{7,}\d/g;

interface AuditRequest {
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  query?: Record<string, unknown> | undefined;
  body?: unknown;
}

interface RecordAuditParams {
  requestId: string;
  request: AuditRequest;
  statusCode: number;
  durationMs: number;
  error?: string;
}

function firstHeaderValue(headers: Record<string, string | string[] | undefined>, name: string) {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeAuditPath(path: string) {
  return (path || "/").split("?")[0] || "/";
}

export function maskIpAddress(ip: string | undefined) {
  if (!ip) {
    return "unknown";
  }

  if (ip.includes(":")) {
    const parts = ip.split(":").filter((part) => part.length > 0);
    if (parts.length <= 2) {
      return "::";
    }
    return `${parts.slice(0, 2).join(":")}:****`;
  }

  const [a, b] = ip.split(".");
  if (!a || !b) {
    return "unknown";
  }
  return `${a}.${b}.***.***`;
}

export function hashForAudit(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export function sanitizeFreeText(value: string, maxLength = 160) {
  const trimmed = value.trim().slice(0, maxLength);
  if (!trimmed) {
    return "";
  }

  const maskedEmail = trimmed.replace(EMAIL_PATTERN, "[redacted-email]");
  return maskedEmail.replace(PHONE_PATTERN, "[redacted-phone]");
}

function sanitizeBodyValue(key: string, value: unknown): unknown {
  if (value == null) {
    return value;
  }

  if (SECRET_KEY_PATTERN.test(key)) {
    return "[redacted-secret]";
  }

  if (typeof value === "string") {
    if (key.toLowerCase().includes("email") && EMAIL_PATTERN.test(value)) {
      return `email_hash:${hashForAudit(value.trim().toLowerCase())}`;
    }

    if (key.toLowerCase().includes("phone")) {
      return value.replace(PHONE_PATTERN, "[redacted-phone]");
    }

    if (key.toLowerCase().includes("comment") || key.toLowerCase().includes("description")) {
      return `len:${value.length}`;
    }

    if (value.length > 120) {
      return `len:${value.length}`;
    }
  }

  if (Array.isArray(value)) {
    return `count:${value.length}`;
  }

  if (typeof value === "object") {
    return "object";
  }

  return value;
}

function summarizeBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const input = body as Record<string, unknown>;
  const summary: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!SAFE_BODY_KEYS.has(key) && !SECRET_KEY_PATTERN.test(key) && !key.toLowerCase().includes("email")) {
      continue;
    }
    summary[key] = sanitizeBodyValue(key, value);
  }

  return Object.keys(summary).length > 0 ? summary : null;
}

function summarizeQuery(query: Record<string, unknown> | undefined) {
  if (!query) {
    return null;
  }

  const summary: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(query)) {
    if (!SAFE_BODY_KEYS.has(key)) {
      continue;
    }
    summary[key] = sanitizeBodyValue(key, value);
  }
  return Object.keys(summary).length > 0 ? summary : null;
}

function resolveActorType(headers: Record<string, string | string[] | undefined>) {
  const hasAdminKey = Boolean(firstHeaderValue(headers, "x-admin-key") || firstHeaderValue(headers, "x-admin-api-key"));
  if (hasAdminKey) {
    return "admin_api_key";
  }

  const hasBearer = Boolean(firstHeaderValue(headers, "authorization"));
  if (hasBearer) {
    return "bearer_token";
  }

  return "anonymous";
}

function extractActorHash(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }
  const value = body as Record<string, unknown>;
  const email = typeof value.email === "string" ? value.email.trim().toLowerCase() : null;
  if (!email || !EMAIL_PATTERN.test(email)) {
    return null;
  }
  return `email_hash:${hashForAudit(email)}`;
}

function extractResource(path: string) {
  const normalized = normalizeAuditPath(path);
  const parts = normalized.split("/").filter((part) => part.length > 0);
  if (parts.length < 2) {
    return normalized;
  }
  return `/${parts[0]}/${parts[1]}`;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger("AUDIT");

  shouldAudit(method: string, path: string) {
    const normalizedPath = normalizeAuditPath(path);
    if (SENSITIVE_ROUTE_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix))) {
      return true;
    }
    return MUTATING_METHODS.has(method.toUpperCase());
  }

  recordHttpAudit({ requestId, request, statusCode, durationMs, error }: RecordAuditParams) {
    const normalizedPath = normalizeAuditPath(request.path);
    const forwarded = firstHeaderValue(request.headers, "x-forwarded-for");
    const sourceIp = forwarded?.split(",")[0]?.trim() || request.ip;

    const event = {
      eventType: "http_audit",
      requestId,
      action: `${request.method.toUpperCase()} ${extractResource(normalizedPath)}`,
      actor: {
        type: resolveActorType(request.headers),
        ref: extractActorHash(request.body)
      },
      resource: normalizedPath,
      result: statusCode >= 400 ? "failure" : "success",
      statusCode,
      durationMs,
      sourceIp: maskIpAddress(sourceIp),
      body: summarizeBody(request.body),
      query: summarizeQuery(request.query),
      error: error ? sanitizeFreeText(error, 200) : null
    };

    this.logger.log(JSON.stringify(event));
  }
}
