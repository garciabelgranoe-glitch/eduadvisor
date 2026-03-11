import { NextRequest } from "next/server";

type ChallengeScope = "leads" | "reviews" | "claim";

type ChallengeDecision =
  | { type: "allow" }
  | { type: "blocked"; status: number; message: string; retryAfterSeconds?: number };

interface EvaluatePublicFormChallengeInput {
  request: NextRequest;
  body: Record<string, unknown>;
  scope: ChallengeScope;
}

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TEST_NODE_ENVS = new Set(["test"]);

interface TurnstileVerifyResponse {
  success?: boolean;
  "error-codes"?: string[];
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

function getClientIp(request: NextRequest) {
  const ipHeader = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  return ipHeader.split(",")[0]?.trim() || "unknown";
}

function normalizeToken(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function extractChallengeToken(body: Record<string, unknown>) {
  const privateToken = normalizeToken(body._challengeToken);
  if (privateToken.length > 0) {
    return privateToken;
  }
  return normalizeToken(body.challengeToken);
}

function resolveRequirement() {
  const defaultRequired = isTruthy(process.env.PUBLIC_FORM_CHALLENGE_REQUIRED, false);
  return defaultRequired;
}

async function verifyTurnstileToken(input: {
  request: NextRequest;
  token: string;
  secretKey: string;
}): Promise<{ ok: true } | { ok: false; reason: string; isTransient?: boolean }> {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  const allowTestBypass = TEST_NODE_ENVS.has(nodeEnv) || isTruthy(process.env.PUBLIC_FORM_CHALLENGE_TEST_BYPASS, false);
  if (allowTestBypass) {
    if (input.token === "test-turnstile-ok") {
      return { ok: true };
    }
    if (input.token === "test-turnstile-fail") {
      return { ok: false, reason: "invalid-test-token" };
    }
  }

  const formData = new URLSearchParams({
    secret: input.secretKey,
    response: input.token,
    remoteip: getClientIp(input.request)
  });

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      body: formData.toString(),
      cache: "no-store"
    });

    if (!response.ok) {
      return { ok: false, reason: `turnstile-http-${response.status}`, isTransient: true };
    }

    const payload = (await response.json().catch(() => null)) as TurnstileVerifyResponse | null;
    if (!payload?.success) {
      const reason = payload?.["error-codes"]?.join(",") || "turnstile-invalid-token";
      return { ok: false, reason };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "turnstile-unreachable", isTransient: true };
  }
}

export async function evaluatePublicFormChallenge(
  input: EvaluatePublicFormChallengeInput
): Promise<ChallengeDecision> {
  const required = resolveRequirement();
  const provider = (process.env.PUBLIC_FORM_CHALLENGE_PROVIDER?.trim().toLowerCase() || "turnstile") as
    | "turnstile"
    | string;
  const token = extractChallengeToken(input.body);

  if (provider !== "turnstile") {
    if (required) {
      return {
        type: "blocked",
        status: 503,
        message: "La verificación de seguridad no está disponible en este momento."
      };
    }
    return { type: "allow" };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim() || "";
  if (!secretKey) {
    if (required) {
      return {
        type: "blocked",
        status: 503,
        message: "La verificación de seguridad no está configurada."
      };
    }
    return { type: "allow" };
  }

  if (!token) {
    if (required) {
      return {
        type: "blocked",
        status: 429,
        message: "Completa la verificación de seguridad para continuar.",
        retryAfterSeconds: 60
      };
    }
    return { type: "allow" };
  }

  const verification = await verifyTurnstileToken({
    request: input.request,
    token,
    secretKey
  });
  if (verification.ok) {
    return { type: "allow" };
  }

  if (required) {
    return {
      type: "blocked",
      status: verification.isTransient ? 503 : 429,
      message: verification.isTransient
        ? "No pudimos validar la verificación de seguridad. Intenta nuevamente."
        : "La verificación de seguridad no fue válida.",
      retryAfterSeconds: verification.isTransient ? 30 : 60
    };
  }

  return { type: "allow" };
}
