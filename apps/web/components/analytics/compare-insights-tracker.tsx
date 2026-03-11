"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface CompareInsightsTrackerProps {
  schoolSlugs: string[];
  insightsCount: number;
}

export function CompareInsightsTracker({ schoolSlugs, insightsCount }: CompareInsightsTrackerProps) {
  useEffect(() => {
    if (schoolSlugs.length < 2) {
      return;
    }

    trackEvent("compare_insights_viewed", {
      source: "compare_page",
      schools: schoolSlugs.join(","),
      schoolsCount: schoolSlugs.length,
      insightsCount
    });
  }, [insightsCount, schoolSlugs]);

  return null;
}

