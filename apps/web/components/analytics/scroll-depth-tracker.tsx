"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

const DEPTH_MILESTONES = [25, 50, 75, 90] as const;

function pageMaxScroll() {
  const root = document.documentElement;
  return Math.max(1, root.scrollHeight - root.clientHeight);
}

function currentDepthPercent() {
  const root = document.documentElement;
  const scrolled = Math.max(root.scrollTop, window.scrollY, 0);
  const ratio = (scrolled / pageMaxScroll()) * 100;
  return Math.max(0, Math.min(100, Math.round(ratio)));
}

export function ScrollDepthTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const routePath = pathname || "/";
    const reached = new Set<number>();
    let ticking = false;

    const emitDepth = () => {
      const depth = currentDepthPercent();

      for (const milestone of DEPTH_MILESTONES) {
        if (depth >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          trackEvent("page_scroll_depth_reached", {
            source: "scroll_depth",
            routePath,
            depthMilestone: milestone
          });
        }
      }
    };

    const onScroll = () => {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(() => {
        emitDepth();
        ticking = false;
      });
    };

    emitDepth();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}

