import { NextRequest, NextResponse } from "next/server";
import { evaluatePublicAbuseProtection, sanitizeForwardPayload } from "@/lib/security/public-abuse-protection";
import { evaluatePublicFormChallenge } from "@/lib/security/public-form-challenge";

const API_BASE = process.env.API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const targetSchoolId = typeof body.schoolId === "string" ? body.schoolId.trim() : null;
    const abuse = evaluatePublicAbuseProtection({
      request,
      scope: "leads",
      body,
      maxRequests: 8,
      windowMs: 60_000,
      blockMs: 10 * 60_000,
      perTargetMaxRequests: 3,
      perTargetWindowMs: 10 * 60_000,
      perTargetBlockMs: 30 * 60_000,
      targetKey: targetSchoolId,
      minSubmissionMs: 600,
      textFields: ["parentName"],
      emailField: "email",
      blockDisposableEmail: true,
      duplicateFingerprintMaxRequests: 2,
      duplicateFingerprintWindowMs: 60 * 60_000,
      duplicateFingerprintBlockMs: 6 * 60 * 60_000,
      fingerprintFields: ["schoolId", "parentName", "childAge", "educationLevel", "email", "phone"]
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
          message: "Consulta enviada. El colegio te contactará pronto."
        },
        { status: 202 }
      );
    }

    const challenge = await evaluatePublicFormChallenge({
      request,
      body,
      scope: "leads"
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

    const response = await fetch(`${API_BASE}/v1/leads`, {
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
      { message: "No se pudo conectar con el servicio de leads" },
      { status: 503 }
    );
  }
}
