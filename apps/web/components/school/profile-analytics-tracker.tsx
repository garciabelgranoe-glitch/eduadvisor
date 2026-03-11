"use client";

import { useEffect } from "react";
import { trackEvent, trackFunnelStep } from "@/lib/analytics";

interface SchoolProfileAnalyticsTrackerProps {
  schoolSlug: string;
  city: string;
  province: string;
}

export function SchoolProfileAnalyticsTracker({
  schoolSlug,
  city,
  province
}: SchoolProfileAnalyticsTrackerProps) {
  useEffect(() => {
    const sharedProperties = {
      source: "school_profile_page",
      schoolSlug,
      city,
      province
    };

    trackEvent("school_profile_viewed", sharedProperties);
    trackFunnelStep("profile", sharedProperties);
  }, [city, province, schoolSlug]);

  return null;
}
