export const ANALYTICS_FUNNEL_VERSION = "2026-03-v1";

export const FUNNEL_EVENT_BY_STEP = {
  search: "funnel_search_results_viewed",
  profile: "funnel_school_profile_viewed",
  shortlist: "funnel_school_saved",
  comparison: "funnel_comparison_saved",
  lead: "funnel_lead_submitted"
} as const;

export type FunnelStep = keyof typeof FUNNEL_EVENT_BY_STEP;
export type FunnelEventName = (typeof FUNNEL_EVENT_BY_STEP)[FunnelStep];

const STEP_BY_FUNNEL_EVENT = Object.entries(FUNNEL_EVENT_BY_STEP).reduce(
  (accumulator, [step, eventName]) => {
    accumulator[eventName] = step as FunnelStep;
    return accumulator;
  },
  {} as Record<FunnelEventName, FunnelStep>
);

const FUNNEL_EVENT_NAMES_SET = new Set<string>(Object.values(FUNNEL_EVENT_BY_STEP));

export function isFunnelEventName(value: string): value is FunnelEventName {
  return FUNNEL_EVENT_NAMES_SET.has(value);
}

export function resolveFunnelStepByEventName(eventName: string): FunnelStep | null {
  if (!isFunnelEventName(eventName)) {
    return null;
  }

  return STEP_BY_FUNNEL_EVENT[eventName];
}

