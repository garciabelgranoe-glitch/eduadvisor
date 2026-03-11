import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/security/in-memory-rate-limit";

const API_BASE = process.env.API_URL ?? "http://localhost:4000";
const RATE_LIMIT_MAX_REQUESTS = 6;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_BLOCK_MS = 5 * 60_000;

function sanitizeEmail(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) {
    return null;
  }

  return normalized;
}

function sanitizeSchoolSlug(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized.length > 120) {
    return null;
  }

  return normalized;
}

async function parsePayload(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null);
    return {
      email: typeof body?.email === "string" ? body.email : undefined,
      schoolSlug: typeof body?.schoolSlug === "string" ? body.schoolSlug : undefined
    };
  }

  const formData = await request.formData();
  return {
    email: formData.get("email")?.toString(),
    schoolSlug: formData.get("schoolSlug")?.toString()
  };
}

export async function POST(request: NextRequest) {
  const ipHeader = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const clientIp = ipHeader.split(",")[0]?.trim() || "unknown";
  const rateLimit = consumeRateLimit({
    key: `school-claim-status:${clientIp}`,
    maxRequests: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS,
    blockMs: RATE_LIMIT_BLOCK_MS
  });

  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1000));
    return NextResponse.json(
      {
        message: "Demasiadas solicitudes. Intenta nuevamente en unos minutos."
      },
      {
        status: 429,
        headers: {
          "cache-control": "no-store",
          "retry-after": String(retryAfterSeconds)
        }
      }
    );
  }

  const payload = await parsePayload(request);
  const email = sanitizeEmail(payload.email);
  const schoolSlug = sanitizeSchoolSlug(payload.schoolSlug);

  if (!email || !schoolSlug) {
    return NextResponse.json(
      {
        canLogin: false,
        reasonCode: null,
        message: "Recibimos tu consulta. Si existe una solicitud asociada, te notificaremos por email.",
        school: null,
        claim: null
      },
      {
        status: 200,
        headers: {
          "cache-control": "no-store"
        }
      }
    );
  }

  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  if (!adminApiKey) {
    return NextResponse.json(
      {
        canLogin: false,
        reasonCode: null,
        message: "Recibimos tu consulta. Si existe una solicitud asociada, te notificaremos por email.",
        school: null,
        claim: null
      },
      {
        status: 200,
        headers: {
          "cache-control": "no-store"
        }
      }
    );
  }

  const params = new URLSearchParams({ email, schoolSlug });

  try {
    const response = await fetch(`${API_BASE}/v1/auth/school-claim-status?${params.toString()}`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    await response.json().catch(() => null);

    return NextResponse.json({
      canLogin: false,
      reasonCode: null,
      message: "Recibimos tu consulta. Si existe una solicitud asociada, te notificaremos por email.",
      school: null,
      claim: null
    }, {
      headers: {
        "cache-control": "no-store"
      }
    });
  } catch {
    return NextResponse.json(
      {
        canLogin: false,
        reasonCode: null,
        message: "Recibimos tu consulta. Si existe una solicitud asociada, te notificaremos por email.",
        school: null,
        claim: null
      },
      {
        status: 200,
        headers: {
          "cache-control": "no-store"
        }
      },
    );
  }
}
