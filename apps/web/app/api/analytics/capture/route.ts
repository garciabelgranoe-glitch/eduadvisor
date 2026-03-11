import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, toUiSessionRole, verifySignedSessionToken } from "@/lib/auth/session";
import {
  ANALYTICS_FUNNEL_VERSION,
  isFunnelEventName,
  resolveFunnelStepByEventName
} from "@/lib/analytics-schema";
import { appendAnalyticsEvent } from "@/lib/server/analytics-store";
import { triggerPerformanceBudgetAlert } from "@/lib/server/performance-alerting";

interface CapturePayload {
  event?: string;
  distinctId?: string;
  properties?: Record<string, unknown>;
}

function resolvePosthogConfig() {
  const apiKey =
    process.env.POSTHOG_PROJECT_API_KEY?.trim() || process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || "";
  const host =
    process.env.POSTHOG_HOST?.trim() || process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";

  return {
    apiKey,
    host: host.endsWith("/") ? host.slice(0, -1) : host
  };
}

function sanitizeEventName(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, 96);
}

function sanitizeDistinctId(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, 160);
}

function sanitizeProperties(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const input = value as Record<string, unknown>;
  const output: Record<string, string | number | boolean | null> = {};
  const entries = Object.entries(input).slice(0, 50);

  for (const [key, raw] of entries) {
    if (!key) {
      continue;
    }

    if (typeof raw === "string") {
      output[key] = raw.slice(0, 400);
      continue;
    }

    if (typeof raw === "number" || typeof raw === "boolean" || raw === null) {
      output[key] = raw;
    }
  }

  return output;
}

export async function POST(request: NextRequest) {
  const config = resolvePosthogConfig();

  const body = (await request.json().catch(() => null)) as CapturePayload | null;
  const event = sanitizeEventName(body?.event);
  if (!event) {
    return NextResponse.json({ captured: false, reason: "invalid_event" }, { status: 400 });
  }

  const signedSession = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySignedSessionToken(signedSession);
  const sessionRole = toUiSessionRole(session?.role) ?? null;
  const distinctId = sanitizeDistinctId(body?.distinctId) ?? `session:${sessionRole ?? "anonymous"}`;
  const properties = sanitizeProperties(body?.properties);
  const source = typeof properties.source === "string" ? properties.source : "web";
  const funnelStep = isFunnelEventName(event) ? resolveFunnelStepByEventName(event) : null;
  const now = new Date().toISOString();
  const enrichedProperties: Record<string, string | number | boolean | null> = {
    ...properties,
    source,
    sessionRole: sessionRole ?? "ANONYMOUS",
    environment: process.env.NODE_ENV ?? "development"
  };

  if (funnelStep) {
    enrichedProperties.funnelStep = funnelStep;
    enrichedProperties.funnelVersion = ANALYTICS_FUNNEL_VERSION;
  }

  await appendAnalyticsEvent({
    event,
    distinctId,
    timestamp: now,
    properties: enrichedProperties
  }).catch(() => {
    // Ignore local storage failures to avoid blocking user flows.
  });

  if (event === "web_vital_reported") {
    void triggerPerformanceBudgetAlert("analytics_capture").catch(() => {
      // Performance alerting must not block analytics ingestion.
    });
  }

  if (!config.apiKey) {
    return NextResponse.json({ captured: true, destination: "local" }, { status: 202 });
  }

  try {
    await fetch(`${config.host}/capture/`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        api_key: config.apiKey,
        event,
        distinct_id: distinctId,
        properties: {
          ...enrichedProperties,
          source: source === "web" ? "eduadvisor-web" : source,
          capturedAt: now
        }
      }),
      cache: "no-store"
    });
  } catch {
    return NextResponse.json({ captured: false, reason: "capture_failed" }, { status: 202 });
  }

  return NextResponse.json({ captured: true }, { status: 202 });
}
