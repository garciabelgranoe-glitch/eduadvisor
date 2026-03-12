import { NextRequest, NextResponse } from "next/server";
import { evaluatePublicAbuseProtection, sanitizeForwardPayload } from "@/lib/security/public-abuse-protection";
import { evaluatePublicFormChallenge } from "@/lib/security/public-form-challenge";

const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const targetSchoolId = typeof body.schoolId === "string" ? body.schoolId.trim() : null;
    const abuse = evaluatePublicAbuseProtection({
      request,
      scope: "reviews",
      body,
      maxRequests: 6,
      windowMs: 10 * 60_000,
      blockMs: 30 * 60_000,
      perTargetMaxRequests: 2,
      perTargetWindowMs: 30 * 60_000,
      perTargetBlockMs: 60 * 60_000,
      targetKey: targetSchoolId,
      minSubmissionMs: 1_500,
      textFields: ["comment"],
      duplicateFingerprintMaxRequests: 1,
      duplicateFingerprintWindowMs: 12 * 60 * 60_000,
      duplicateFingerprintBlockMs: 24 * 60 * 60_000,
      fingerprintFields: ["schoolId", "rating", "comment"]
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
          id: "queued",
          message: "Review enviada con éxito. Estado: pendiente de moderación."
        },
        { status: 202 }
      );
    }

    const challenge = await evaluatePublicFormChallenge({
      request,
      body,
      scope: "reviews"
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

    const response = await fetch(`${API_BASE}/v1/reviews`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(sanitizeForwardPayload(body)),
      cache: "no-store"
    });

    const payload = await response.json().catch(() => ({ message: "Invalid response from API" }));

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    return NextResponse.json(payload, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servicio de reviews" },
      { status: 503 }
    );
  }
}
