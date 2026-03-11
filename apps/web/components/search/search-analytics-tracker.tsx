"use client";

import { useEffect } from "react";
import { trackEvent, trackFunnelStep } from "@/lib/analytics";

interface SearchAnalyticsTrackerProps {
  query: {
    q?: string;
    city?: string;
    level?: string;
    feeMin?: string;
    feeMax?: string;
    ratingMin?: string;
  };
  total: number;
  engine: string;
}

export function SearchAnalyticsTracker({ query, total, engine }: SearchAnalyticsTrackerProps) {
  useEffect(() => {
    const sharedProperties = {
      source: "search_page",
      q: query.q?.trim() || null,
      city: query.city?.trim() || null,
      level: query.level?.trim() || null,
      feeMin: query.feeMin?.trim() || null,
      feeMax: query.feeMax?.trim() || null,
      ratingMin: query.ratingMin?.trim() || null,
      totalResults: total,
      engine
    };

    trackEvent("search_results_viewed", sharedProperties);
    trackFunnelStep("search", sharedProperties);
  }, [engine, query.city, query.feeMax, query.feeMin, query.level, query.q, query.ratingMin, total]);

  return null;
}
