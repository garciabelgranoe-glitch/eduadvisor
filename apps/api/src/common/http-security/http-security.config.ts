const LOCAL_NODE_ENVS = new Set(["development", "test"]);

const LOCAL_DEFAULT_CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

const API_SECURITY_HEADERS_BASE: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "off"
};

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

export function isLocalNodeEnv(nodeEnv: string): boolean {
  return LOCAL_NODE_ENVS.has(nodeEnv);
}

export function buildCorsAllowlist(env = process.env): string[] {
  const configuredOrigins = (env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  const candidateOrigins = [
    env.NEXT_PUBLIC_APP_URL,
    ...LOCAL_DEFAULT_CORS_ORIGINS,
    ...configuredOrigins
  ].filter((origin): origin is string => Boolean(origin && origin.trim().length > 0));

  return Array.from(new Set(candidateOrigins.map((origin) => normalizeOrigin(origin))));
}

export function isCorsOriginAllowed(origin: string | undefined, allowlist: string[]): boolean {
  if (!origin) {
    // Requests without Origin are typically same-origin server calls/curl.
    return true;
  }

  return allowlist.includes(normalizeOrigin(origin));
}

export function buildApiSecurityHeaders(env = process.env): Record<string, string> {
  const headers: Record<string, string> = {
    ...API_SECURITY_HEADERS_BASE
  };

  if (!isLocalNodeEnv(env.NODE_ENV ?? "development")) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }

  return headers;
}
