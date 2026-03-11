import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ANALYTICS_FUNNEL_VERSION,
  FUNNEL_EVENT_BY_STEP,
  isFunnelEventName
} from "@/lib/analytics-schema";

type Primitive = string | number | boolean | null;
type HealthStatus = "PASS" | "WARN" | "FAIL";

export interface StoredAnalyticsEvent {
  event: string;
  distinctId: string | null;
  timestamp: string;
  properties: Record<string, Primitive>;
}

interface DailyFunnelPoint {
  date: string;
  searches: number;
  profileViews: number;
  leads: number;
}

export interface AnalyticsSnapshot {
  windowDays: number;
  totals: {
    searches: number;
    profileViews: number;
    savedSchools: number;
    comparisons: number;
    leads: number;
    reviews: number;
    schoolRequests: number;
  };
  conversion: {
    searchToProfileRate: number;
    searchToLeadRate: number;
    profileToLeadRate: number;
  };
  trend: DailyFunnelPoint[];
  topSchools: Array<{
    schoolSlug: string;
    profileViews: number;
    leads: number;
  }>;
  funnel: {
    version: string;
    stages: {
      searchUsers: number;
      profileUsers: number;
      shortlistUsers: number;
      comparisonUsers: number;
      leadUsers: number;
    };
    conversion: {
      searchToProfileRate: number;
      profileToShortlistRate: number;
      shortlistToComparisonRate: number;
      comparisonToLeadRate: number;
      searchToLeadRate: number;
    };
  };
  webVitals: {
    windowDays: number;
    samples: {
      LCP: number;
      CLS: number;
      INP: number;
      FCP: number;
      TTFB: number;
    };
    p75: {
      LCP: number | null;
      CLS: number | null;
      INP: number | null;
      FCP: number | null;
      TTFB: number | null;
    };
    quality: {
      LCP: { good: number; needsImprovement: number; poor: number };
      CLS: { good: number; needsImprovement: number; poor: number };
      INP: { good: number; needsImprovement: number; poor: number };
      FCP: { good: number; needsImprovement: number; poor: number };
      TTFB: { good: number; needsImprovement: number; poor: number };
    };
    budgets: {
      LCP: WebVitalBudget;
      CLS: WebVitalBudget;
      INP: WebVitalBudget;
      FCP: WebVitalBudget;
      TTFB: WebVitalBudget;
    };
    minSamplesForBudget: number;
    budgetStatus: HealthStatus;
    alerts: WebVitalAlert[];
  };
  meta: {
    trackedEvents: number;
    trackedFunnelEvents: number;
    lastCapturedAt: string | null;
    filePath: string;
    posthogEnabled: boolean;
    funnelVersion: string;
  };
}

const SEARCH_EVENTS = new Set([
  "search_submitted",
  "search_filters_applied",
  "search_results_viewed",
  FUNNEL_EVENT_BY_STEP.search
]);
const PROFILE_VIEW_EVENTS = new Set([
  "school_profile_viewed",
  "school_profile_opened",
  FUNNEL_EVENT_BY_STEP.profile
]);
const SAVED_SCHOOL_EVENTS = new Set(["school_saved", FUNNEL_EVENT_BY_STEP.shortlist]);
const COMPARISON_EVENTS = new Set(["comparison_saved", FUNNEL_EVENT_BY_STEP.comparison]);
const LEAD_EVENTS = new Set(["lead_submitted", FUNNEL_EVENT_BY_STEP.lead]);
const REVIEW_EVENTS = new Set(["review_submitted"]);
const SCHOOL_REQUEST_EVENTS = new Set(["school_request_submitted"]);
const WEB_VITAL_EVENT = "web_vital_reported";
const WEB_VITAL_NAMES = new Set(["LCP", "CLS", "INP", "FCP", "TTFB"] as const);
const WEB_VITAL_LIST = ["LCP", "CLS", "INP", "FCP", "TTFB"] as const;
const WEB_VITAL_MIN_SAMPLES_DEFAULT = 20;

const DEFAULT_WEB_VITAL_BUDGETS: Record<WebVitalName, WebVitalBudget> = {
  LCP: { target: 2500, max: 4000, unit: "ms" },
  CLS: { target: 0.1, max: 0.25, unit: "score" },
  INP: { target: 200, max: 500, unit: "ms" },
  FCP: { target: 1800, max: 3000, unit: "ms" },
  TTFB: { target: 800, max: 1800, unit: "ms" }
};

type WebVitalName = "LCP" | "CLS" | "INP" | "FCP" | "TTFB";
type WebVitalRating = "good" | "needs_improvement" | "poor";
type WebVitalUnit = "ms" | "score";

interface WebVitalQuality {
  good: number;
  needsImprovement: number;
  poor: number;
}

interface WebVitalBudget {
  target: number;
  max: number;
  unit: WebVitalUnit;
}

interface WebVitalAlert {
  metric: WebVitalName;
  status: HealthStatus;
  message: string;
  p75: number | null;
  samples: number;
  budget: WebVitalBudget;
}

interface DistinctFunnelState {
  search: boolean;
  profile: boolean;
  shortlist: boolean;
  comparison: boolean;
  lead: boolean;
}

function createDistinctFunnelState(): DistinctFunnelState {
  return {
    search: false,
    profile: false,
    shortlist: false,
    comparison: false,
    lead: false
  };
}

function toProgressiveDistinctState(state: DistinctFunnelState): DistinctFunnelState {
  const lead = state.lead;
  const comparison = state.comparison || lead;
  const shortlist = state.shortlist || comparison;
  const profile = state.profile || shortlist;
  const search = state.search || profile;

  return {
    search,
    profile,
    shortlist,
    comparison,
    lead
  };
}

function isPosthogConfigured() {
  return Boolean(process.env.POSTHOG_PROJECT_API_KEY?.trim() || process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
}

function resolveAnalyticsFilePath() {
  return process.env.ANALYTICS_EVENTS_FILE?.trim() || "/tmp/eduadvisor-analytics-events.ndjson";
}

function toNumber(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}

function toPercent(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return 0;
  }

  return toNumber((numerator / denominator) * 100, 2);
}

function parsePositiveNumber(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function resolveWebVitalBudgets() {
  return {
    LCP: {
      unit: DEFAULT_WEB_VITAL_BUDGETS.LCP.unit,
      target:
        parsePositiveNumber(process.env.WEB_VITAL_BUDGET_LCP_TARGET) ?? DEFAULT_WEB_VITAL_BUDGETS.LCP.target,
      max: parsePositiveNumber(process.env.WEB_VITAL_BUDGET_LCP_MAX) ?? DEFAULT_WEB_VITAL_BUDGETS.LCP.max
    },
    CLS: {
      unit: DEFAULT_WEB_VITAL_BUDGETS.CLS.unit,
      target:
        parsePositiveNumber(process.env.WEB_VITAL_BUDGET_CLS_TARGET) ?? DEFAULT_WEB_VITAL_BUDGETS.CLS.target,
      max: parsePositiveNumber(process.env.WEB_VITAL_BUDGET_CLS_MAX) ?? DEFAULT_WEB_VITAL_BUDGETS.CLS.max
    },
    INP: {
      unit: DEFAULT_WEB_VITAL_BUDGETS.INP.unit,
      target:
        parsePositiveNumber(process.env.WEB_VITAL_BUDGET_INP_TARGET) ?? DEFAULT_WEB_VITAL_BUDGETS.INP.target,
      max: parsePositiveNumber(process.env.WEB_VITAL_BUDGET_INP_MAX) ?? DEFAULT_WEB_VITAL_BUDGETS.INP.max
    },
    FCP: {
      unit: DEFAULT_WEB_VITAL_BUDGETS.FCP.unit,
      target:
        parsePositiveNumber(process.env.WEB_VITAL_BUDGET_FCP_TARGET) ?? DEFAULT_WEB_VITAL_BUDGETS.FCP.target,
      max: parsePositiveNumber(process.env.WEB_VITAL_BUDGET_FCP_MAX) ?? DEFAULT_WEB_VITAL_BUDGETS.FCP.max
    },
    TTFB: {
      unit: DEFAULT_WEB_VITAL_BUDGETS.TTFB.unit,
      target:
        parsePositiveNumber(process.env.WEB_VITAL_BUDGET_TTFB_TARGET) ?? DEFAULT_WEB_VITAL_BUDGETS.TTFB.target,
      max: parsePositiveNumber(process.env.WEB_VITAL_BUDGET_TTFB_MAX) ?? DEFAULT_WEB_VITAL_BUDGETS.TTFB.max
    }
  } satisfies Record<WebVitalName, WebVitalBudget>;
}

function resolveWebVitalMinSamples() {
  return Math.max(
    1,
    Math.floor(parsePositiveNumber(process.env.WEB_VITAL_MIN_SAMPLES_FOR_BUDGET) ?? WEB_VITAL_MIN_SAMPLES_DEFAULT)
  );
}

function evaluateWebVitalAlerts(input: {
  budgets: Record<WebVitalName, WebVitalBudget>;
  p75: Record<WebVitalName, number | null>;
  samples: Record<WebVitalName, number>;
  minSamples: number;
}) {
  const alerts: WebVitalAlert[] = [];

  for (const metric of WEB_VITAL_LIST) {
    const budget = input.budgets[metric];
    const p75 = input.p75[metric];
    const samples = input.samples[metric];

    if (samples < input.minSamples || p75 === null) {
      alerts.push({
        metric,
        status: "WARN",
        message: `Muestras insuficientes (${samples}/${input.minSamples})`,
        p75,
        samples,
        budget
      });
      continue;
    }

    if (p75 > budget.max) {
      alerts.push({
        metric,
        status: "FAIL",
        message: `p75 fuera de límite (max ${budget.max}${budget.unit === "ms" ? "ms" : ""})`,
        p75,
        samples,
        budget
      });
      continue;
    }

    if (p75 > budget.target) {
      alerts.push({
        metric,
        status: "WARN",
        message: `p75 sobre target (${budget.target}${budget.unit === "ms" ? "ms" : ""})`,
        p75,
        samples,
        budget
      });
      continue;
    }

    alerts.push({
      metric,
      status: "PASS",
      message: "Dentro de budget",
      p75,
      samples,
      budget
    });
  }

  const hasFail = alerts.some((item) => item.status === "FAIL");
  const hasWarn = alerts.some((item) => item.status === "WARN");
  const budgetStatus: HealthStatus = hasFail ? "FAIL" : hasWarn ? "WARN" : "PASS";

  return {
    alerts,
    budgetStatus
  };
}

function toP75(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil(0.75 * sorted.length) - 1;
  const safeIndex = Math.max(0, Math.min(sorted.length - 1, index));
  return toNumber(sorted[safeIndex] ?? sorted[sorted.length - 1], 2);
}

function createVitalQuality(): WebVitalQuality {
  return {
    good: 0,
    needsImprovement: 0,
    poor: 0
  };
}

function normalizeWebVitalName(value: Primitive): WebVitalName | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if (!WEB_VITAL_NAMES.has(normalized as WebVitalName)) {
    return null;
  }

  return normalized as WebVitalName;
}

function normalizeWebVitalRating(value: Primitive): WebVitalRating | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase() as WebVitalRating;
  if (normalized !== "good" && normalized !== "needs_improvement" && normalized !== "poor") {
    return null;
  }

  return normalized;
}

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function safeParseLine(line: string): StoredAnalyticsEvent | null {
  try {
    const parsed = JSON.parse(line) as StoredAnalyticsEvent;
    if (!parsed?.event || !parsed?.timestamp) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

async function ensureParentDir(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

export async function appendAnalyticsEvent(event: StoredAnalyticsEvent) {
  const filePath = resolveAnalyticsFilePath();
  await ensureParentDir(filePath);
  await writeFile(filePath, `${JSON.stringify(event)}\n`, { encoding: "utf8", flag: "a" });
}

async function readEventsFile(filePath: string) {
  try {
    await stat(filePath);
  } catch {
    return [] as StoredAnalyticsEvent[];
  }

  const content = await readFile(filePath, "utf8");
  if (!content.trim()) {
    return [] as StoredAnalyticsEvent[];
  }

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => safeParseLine(line))
    .filter((event): event is StoredAnalyticsEvent => Boolean(event));
}

export async function getAnalyticsSnapshot(windowDays = 7): Promise<AnalyticsSnapshot> {
  const filePath = resolveAnalyticsFilePath();
  const now = new Date();
  const since = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  const allEvents = await readEventsFile(filePath);
  const events = allEvents.filter((event) => {
    const timestamp = new Date(event.timestamp);
    return Number.isFinite(timestamp.getTime()) && timestamp >= since && timestamp <= now;
  });

  const dailyMap = new Map<string, DailyFunnelPoint>();
  for (let offset = windowDays - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    const key = toDayKey(date);
    dailyMap.set(key, {
      date: key,
      searches: 0,
      profileViews: 0,
      leads: 0
    });
  }

  let searches = 0;
  let profileViews = 0;
  let savedSchools = 0;
  let comparisons = 0;
  let leads = 0;
  let reviews = 0;
  let schoolRequests = 0;

  const topSchoolMap = new Map<string, { profileViews: number; leads: number }>();
  const distinctFunnelMap = new Map<string, DistinctFunnelState>();
  let lastCapturedAt: string | null = null;
  let trackedFunnelEvents = 0;
  const webVitalValues: Record<WebVitalName, number[]> = {
    LCP: [],
    CLS: [],
    INP: [],
    FCP: [],
    TTFB: []
  };
  const webVitalQuality: Record<WebVitalName, WebVitalQuality> = {
    LCP: createVitalQuality(),
    CLS: createVitalQuality(),
    INP: createVitalQuality(),
    FCP: createVitalQuality(),
    TTFB: createVitalQuality()
  };

  for (const event of events) {
    const eventDate = new Date(event.timestamp);
    const dayKey = toDayKey(eventDate);
    const day = dailyMap.get(dayKey);
    const schoolSlug = typeof event.properties.schoolSlug === "string" ? event.properties.schoolSlug : null;

    if (!lastCapturedAt || event.timestamp > lastCapturedAt) {
      lastCapturedAt = event.timestamp;
    }
    if (isFunnelEventName(event.event)) {
      trackedFunnelEvents += 1;
    }

    if (SEARCH_EVENTS.has(event.event)) {
      searches += 1;
      if (day) {
        day.searches += 1;
      }
    }

    if (PROFILE_VIEW_EVENTS.has(event.event)) {
      profileViews += 1;
      if (day) {
        day.profileViews += 1;
      }

      if (schoolSlug) {
        const schoolRow = topSchoolMap.get(schoolSlug) ?? { profileViews: 0, leads: 0 };
        schoolRow.profileViews += 1;
        topSchoolMap.set(schoolSlug, schoolRow);
      }
    }

    if (SAVED_SCHOOL_EVENTS.has(event.event)) {
      savedSchools += 1;
    }

    if (COMPARISON_EVENTS.has(event.event)) {
      comparisons += 1;
    }

    if (LEAD_EVENTS.has(event.event)) {
      leads += 1;
      if (day) {
        day.leads += 1;
      }

      if (schoolSlug) {
        const schoolRow = topSchoolMap.get(schoolSlug) ?? { profileViews: 0, leads: 0 };
        schoolRow.leads += 1;
        topSchoolMap.set(schoolSlug, schoolRow);
      }
    }

    if (REVIEW_EVENTS.has(event.event)) {
      reviews += 1;
    }

    if (SCHOOL_REQUEST_EVENTS.has(event.event)) {
      schoolRequests += 1;
    }

    if (event.event === WEB_VITAL_EVENT) {
      const metricName = normalizeWebVitalName(event.properties.metricName ?? null);
      const metricValueRaw = event.properties.metricValue ?? null;
      const metricRating = normalizeWebVitalRating(event.properties.metricRating ?? null);

      if (metricName && typeof metricValueRaw === "number" && Number.isFinite(metricValueRaw)) {
        webVitalValues[metricName].push(metricValueRaw);

        if (metricRating === "good") {
          webVitalQuality[metricName].good += 1;
        } else if (metricRating === "needs_improvement") {
          webVitalQuality[metricName].needsImprovement += 1;
        } else if (metricRating === "poor") {
          webVitalQuality[metricName].poor += 1;
        }
      }
    }

    if (event.distinctId) {
      const state = distinctFunnelMap.get(event.distinctId) ?? createDistinctFunnelState();

      if (SEARCH_EVENTS.has(event.event)) {
        state.search = true;
      }
      if (PROFILE_VIEW_EVENTS.has(event.event)) {
        state.profile = true;
      }
      if (SAVED_SCHOOL_EVENTS.has(event.event)) {
        state.shortlist = true;
      }
      if (COMPARISON_EVENTS.has(event.event)) {
        state.comparison = true;
      }
      if (LEAD_EVENTS.has(event.event)) {
        state.lead = true;
      }

      distinctFunnelMap.set(event.distinctId, state);
    }
  }

  const topSchools = Array.from(topSchoolMap.entries())
    .map(([schoolSlug, metrics]) => ({
      schoolSlug,
      profileViews: metrics.profileViews,
      leads: metrics.leads
    }))
    .sort((a, b) => {
      if (b.leads !== a.leads) {
        return b.leads - a.leads;
      }

      return b.profileViews - a.profileViews;
    })
    .slice(0, 8);

  const funnelUsers = {
    searchUsers: 0,
    profileUsers: 0,
    shortlistUsers: 0,
    comparisonUsers: 0,
    leadUsers: 0
  };

  for (const state of distinctFunnelMap.values()) {
    const progressive = toProgressiveDistinctState(state);
    if (progressive.search) {
      funnelUsers.searchUsers += 1;
    }
    if (progressive.profile) {
      funnelUsers.profileUsers += 1;
    }
    if (progressive.shortlist) {
      funnelUsers.shortlistUsers += 1;
    }
    if (progressive.comparison) {
      funnelUsers.comparisonUsers += 1;
    }
    if (progressive.lead) {
      funnelUsers.leadUsers += 1;
    }
  }

  const webVitalBudgets = resolveWebVitalBudgets();
  const webVitalMinSamples = resolveWebVitalMinSamples();
  const webVitalSamples: Record<WebVitalName, number> = {
    LCP: webVitalValues.LCP.length,
    CLS: webVitalValues.CLS.length,
    INP: webVitalValues.INP.length,
    FCP: webVitalValues.FCP.length,
    TTFB: webVitalValues.TTFB.length
  };
  const webVitalP75: Record<WebVitalName, number | null> = {
    LCP: toP75(webVitalValues.LCP),
    CLS: toP75(webVitalValues.CLS),
    INP: toP75(webVitalValues.INP),
    FCP: toP75(webVitalValues.FCP),
    TTFB: toP75(webVitalValues.TTFB)
  };
  const webVitalBudgetEvaluation = evaluateWebVitalAlerts({
    budgets: webVitalBudgets,
    p75: webVitalP75,
    samples: webVitalSamples,
    minSamples: webVitalMinSamples
  });

  return {
    windowDays,
    totals: {
      searches,
      profileViews,
      savedSchools,
      comparisons,
      leads,
      reviews,
      schoolRequests
    },
    conversion: {
      searchToProfileRate: toPercent(profileViews, searches),
      searchToLeadRate: toPercent(leads, searches),
      profileToLeadRate: toPercent(leads, profileViews)
    },
    trend: Array.from(dailyMap.values()),
    topSchools,
    funnel: {
      version: ANALYTICS_FUNNEL_VERSION,
      stages: funnelUsers,
      conversion: {
        searchToProfileRate: toPercent(funnelUsers.profileUsers, funnelUsers.searchUsers),
        profileToShortlistRate: toPercent(funnelUsers.shortlistUsers, funnelUsers.profileUsers),
        shortlistToComparisonRate: toPercent(funnelUsers.comparisonUsers, funnelUsers.shortlistUsers),
        comparisonToLeadRate: toPercent(funnelUsers.leadUsers, funnelUsers.comparisonUsers),
        searchToLeadRate: toPercent(funnelUsers.leadUsers, funnelUsers.searchUsers)
      }
    },
    webVitals: {
      windowDays,
      samples: webVitalSamples,
      p75: webVitalP75,
      quality: {
        LCP: webVitalQuality.LCP,
        CLS: webVitalQuality.CLS,
        INP: webVitalQuality.INP,
        FCP: webVitalQuality.FCP,
        TTFB: webVitalQuality.TTFB
      },
      budgets: webVitalBudgets,
      minSamplesForBudget: webVitalMinSamples,
      budgetStatus: webVitalBudgetEvaluation.budgetStatus,
      alerts: webVitalBudgetEvaluation.alerts
    },
    meta: {
      trackedEvents: events.length,
      trackedFunnelEvents,
      lastCapturedAt,
      filePath,
      posthogEnabled: isPosthogConfigured(),
      funnelVersion: ANALYTICS_FUNNEL_VERSION
    }
  };
}
