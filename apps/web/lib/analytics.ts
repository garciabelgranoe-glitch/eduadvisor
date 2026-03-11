import { ANALYTICS_FUNNEL_VERSION, FUNNEL_EVENT_BY_STEP, type FunnelStep } from "@/lib/analytics-schema";

type AnalyticsValue = string | number | boolean | null | undefined;

const DISTINCT_ID_STORAGE_KEY = "eduadvisor_distinct_id";

function getDistinctId() {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const existing = window.localStorage.getItem(DISTINCT_ID_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const generated =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    window.localStorage.setItem(DISTINCT_ID_STORAGE_KEY, generated);
    return generated;
  } catch {
    return undefined;
  }
}

export function trackEvent(event: string, properties: Record<string, AnalyticsValue> = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = JSON.stringify({
    event,
    properties,
    distinctId: getDistinctId()
  });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/analytics/capture", blob);
      if (sent) {
        return;
      }
    }

    void fetch("/api/analytics/capture", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: payload,
      keepalive: true
    });
  } catch {
    // Analytics must never impact UX.
  }
}

export function trackFunnelStep(step: FunnelStep, properties: Record<string, AnalyticsValue> = {}) {
  trackEvent(FUNNEL_EVENT_BY_STEP[step], {
    ...properties,
    funnelStep: step,
    funnelVersion: ANALYTICS_FUNNEL_VERSION
  });
}
