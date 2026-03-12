import { NextRequest, NextResponse } from "next/server";
import { evaluatePublicAbuseProtection, sanitizeForwardPayload } from "@/lib/security/public-abuse-protection";
import { evaluatePublicFormChallenge } from "@/lib/security/public-form-challenge";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

interface PublishRequestBody {
  flow?: "publish" | "claim";
  schoolSlug?: string;
  schoolName?: string;
  city?: string;
  province?: string;
  contactName?: string;
  contactRole?: string;
  email?: string;
  phone?: string;
  website?: string | null;
  message?: string | null;
}

function normalizeFlow(flow: string | undefined) {
  return flow === "publish" ? "PUBLISH" : "CLAIM";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PublishRequestBody & Record<string, unknown>;
    const targetKey = typeof body.schoolSlug === "string" ? body.schoolSlug.trim().toLowerCase() : body.email?.trim().toLowerCase();
    const abuse = evaluatePublicAbuseProtection({
      request,
      scope: "claim",
      body,
      maxRequests: 5,
      windowMs: 30 * 60_000,
      blockMs: 60 * 60_000,
      perTargetMaxRequests: 2,
      perTargetWindowMs: 60 * 60_000,
      perTargetBlockMs: 3 * 60 * 60_000,
      targetKey: targetKey ?? null,
      minSubmissionMs: 1_200,
      textFields: ["schoolName", "contactName", "contactRole", "message"],
      emailField: "email",
      blockDisposableEmail: true,
      duplicateFingerprintMaxRequests: 1,
      duplicateFingerprintWindowMs: 24 * 60 * 60_000,
      duplicateFingerprintBlockMs: 48 * 60 * 60_000,
      fingerprintFields: [
        "flow",
        "schoolSlug",
        "schoolName",
        "city",
        "province",
        "contactName",
        "contactRole",
        "email",
        "phone"
      ]
    });

    if (abuse.type === "blocked") {
      return NextResponse.json(
        {
          message: abuse.message
        },
        {
          status: 429,
          headers: {
            "retry-after": String(abuse.retryAfterSeconds),
            "cache-control": "no-store"
          }
        }
      );
    }

    if (abuse.type === "silent_drop") {
      return NextResponse.json(
        {
          request: {
            requestId: "queued",
            status: "PENDING"
          }
        },
        { status: 202 }
      );
    }

    const challenge = await evaluatePublicFormChallenge({
      request,
      body,
      scope: "claim"
    });
    if (challenge.type === "blocked") {
      return NextResponse.json(
        {
          message: challenge.message
        },
        {
          status: challenge.status,
          headers: {
            ...(challenge.retryAfterSeconds ? { "retry-after": String(challenge.retryAfterSeconds) } : {}),
            "cache-control": "no-store"
          }
        }
      );
    }

    const cleanedBody = sanitizeForwardPayload(body) as PublishRequestBody;

    const response = await fetch(`${API_BASE}/v1/schools/claim-requests`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        requestType: normalizeFlow(cleanedBody.flow),
        schoolSlug: cleanedBody.schoolSlug?.trim() || undefined,
        schoolName: cleanedBody.schoolName,
        city: cleanedBody.city,
        province: cleanedBody.province,
        website: cleanedBody.website ?? null,
        contactName: cleanedBody.contactName,
        contactRole: cleanedBody.contactRole,
        email: cleanedBody.email,
        phone: cleanedBody.phone,
        message: cleanedBody.message ?? null
      }),
      cache: "no-store"
    });

    const payload = await response.json().catch(() => ({ message: "Invalid response from API" }));

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    return NextResponse.json(
      {
        request: {
          requestId: payload.requestId,
          status: payload.status
        }
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "No pudimos registrar tu solicitud. Intenta nuevamente en unos minutos." },
      { status: 503 }
    );
  }
}
