"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

type VitalName = "CLS" | "LCP" | "INP" | "FCP" | "TTFB";

interface ReportInput {
  name: VitalName;
  value: number;
}

function round(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}

function metricRating(name: VitalName, value: number): "good" | "needs_improvement" | "poor" {
  if (name === "LCP") {
    if (value <= 2500) {
      return "good";
    }
    if (value <= 4000) {
      return "needs_improvement";
    }
    return "poor";
  }

  if (name === "CLS") {
    if (value <= 0.1) {
      return "good";
    }
    if (value <= 0.25) {
      return "needs_improvement";
    }
    return "poor";
  }

  if (name === "INP") {
    if (value <= 200) {
      return "good";
    }
    if (value <= 500) {
      return "needs_improvement";
    }
    return "poor";
  }

  if (name === "FCP") {
    if (value <= 1800) {
      return "good";
    }
    if (value <= 3000) {
      return "needs_improvement";
    }
    return "poor";
  }

  if (value <= 800) {
    return "good";
  }
  if (value <= 1800) {
    return "needs_improvement";
  }
  return "poor";
}

function metricUnit(name: VitalName) {
  return name === "CLS" ? "score" : "ms";
}

export function WebVitalsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") {
      return;
    }

    const routePath = pathname || "/";
    const reportedKeys = new Set<string>();
    const cleanup: Array<() => void> = [];

    const report = ({ name, value }: ReportInput) => {
      const normalized = Number.isFinite(value) ? value : 0;
      const metricValue = round(name === "CLS" ? normalized : Math.max(0, normalized));
      const key = `${name}:${metricValue}:${routePath}`;

      if (reportedKeys.has(key)) {
        return;
      }
      reportedKeys.add(key);

      trackEvent("web_vital_reported", {
        source: "web_vitals",
        metricName: name,
        metricValue,
        metricUnit: metricUnit(name),
        metricRating: metricRating(name, metricValue),
        routePath
      });
    };

    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navigationEntry && Number.isFinite(navigationEntry.responseStart)) {
      report({
        name: "TTFB",
        value: navigationEntry.responseStart
      });
    }

    let clsValue = 0;
    let lcpValue = 0;
    let inpValue = 0;

    const clsObserver = new PerformanceObserver((list) => {
      for (const raw of list.getEntries()) {
        const entry = raw as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
        if (entry.hadRecentInput) {
          continue;
        }
        clsValue += entry.value ?? 0;
      }
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
    cleanup.push(() => clsObserver.disconnect());

    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (!last) {
        return;
      }
      lcpValue = (last as PerformanceEntry & { renderTime?: number; loadTime?: number }).renderTime ?? last.startTime;
      if (!lcpValue) {
        lcpValue = (last as PerformanceEntry & { loadTime?: number }).loadTime ?? last.startTime;
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    cleanup.push(() => lcpObserver.disconnect());

    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          report({
            name: "FCP",
            value: entry.startTime
          });
        }
      }
    });
    fcpObserver.observe({ type: "paint", buffered: true });
    cleanup.push(() => fcpObserver.disconnect());

    if (PerformanceObserver.supportedEntryTypes.includes("event")) {
      const inpObserver = new PerformanceObserver((list) => {
        for (const raw of list.getEntries()) {
          const entry = raw as PerformanceEntry & { duration?: number; interactionId?: number };
          if ((entry.interactionId ?? 0) <= 0) {
            continue;
          }
          const duration = entry.duration ?? 0;
          if (duration > inpValue) {
            inpValue = duration;
          }
        }
      });
      inpObserver.observe({ type: "event", buffered: true });
      cleanup.push(() => inpObserver.disconnect());
    }

    const flush = () => {
      if (lcpValue > 0) {
        report({ name: "LCP", value: lcpValue });
      }
      report({ name: "CLS", value: clsValue });
      if (inpValue > 0) {
        report({ name: "INP", value: inpValue });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    };

    window.addEventListener("pagehide", flush, { once: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    cleanup.push(() => window.removeEventListener("pagehide", flush));
    cleanup.push(() => document.removeEventListener("visibilitychange", handleVisibilityChange));

    return () => {
      flush();
      for (const fn of cleanup) {
        fn();
      }
    };
  }, [pathname]);

  return null;
}
