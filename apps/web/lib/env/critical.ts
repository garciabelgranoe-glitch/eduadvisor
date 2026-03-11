const LOCAL_NODE_ENVS = new Set(["development", "test"]);

function isLocalRuntime() {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  return LOCAL_NODE_ENVS.has(nodeEnv);
}

function findMissing(required: string[]) {
  return required.filter((key) => {
    const value = process.env[key];
    return !value || value.trim().length === 0;
  });
}

function isTruthy(rawValue: string | undefined, fallback = false) {
  if (typeof rawValue !== "string") {
    return fallback;
  }
  const value = rawValue.trim().toLowerCase();
  if (value.length === 0) {
    return fallback;
  }
  return ["1", "true", "yes", "on"].includes(value);
}

export function assertCriticalWebEnv() {
  if (isLocalRuntime()) {
    return;
  }

  const required = [
    "AUTH_SESSION_SECRET",
    "ADMIN_API_KEY",
    "ADMIN_ALLOWED_EMAILS",
    "GOOGLE_OAUTH_CLIENT_ID",
    "GOOGLE_OAUTH_CLIENT_SECRET",
    "REDIS_URL"
  ];

  if (isTruthy(process.env.PUBLIC_FORM_CHALLENGE_REQUIRED, false)) {
    required.push("TURNSTILE_SECRET_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY");
  }

  const missing = findMissing(required);
  if (missing.length > 0) {
    throw new Error(`Missing critical web env vars: ${missing.join(", ")}`);
  }
}
