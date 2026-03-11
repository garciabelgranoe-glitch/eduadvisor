import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { getAnalyticsSnapshot } from "@/lib/server/analytics-store";

type DispatchStatus = "sent" | "skipped" | "failed";

interface PerformanceAlertMetric {
  metric: string;
  status: "PASS" | "WARN" | "FAIL";
  message: string;
  p75: number | null;
  samples: number;
}

export interface PerformanceAlertDispatchRecord {
  id: string;
  emittedAt: string;
  source: string;
  budgetStatus: "WARN" | "FAIL";
  dedupeKey: string;
  metrics: PerformanceAlertMetric[];
  channels: {
    slack: DispatchStatus;
    emailWebhook: DispatchStatus;
  };
  errors: string[];
}

interface AlertingConfig {
  enabled: boolean;
  dedupeWindowMinutes: number;
  dispatchFilePath: string;
  slackWebhookUrl: string | null;
  emailWebhookUrl: string | null;
  emailTo: string | null;
}

function isTruthy(value: string | undefined, defaultValue = false) {
  if (!value) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function getConfig(): AlertingConfig {
  const slackWebhookUrl = process.env.PERF_ALERT_SLACK_WEBHOOK_URL?.trim() || null;
  const emailWebhookUrl = process.env.PERF_ALERT_EMAIL_WEBHOOK_URL?.trim() || null;
  const emailTo = process.env.PERF_ALERT_EMAIL_TO?.trim() || null;

  return {
    enabled: isTruthy(process.env.PERF_ALERTS_ENABLED, true),
    dedupeWindowMinutes: parsePositiveInt(process.env.PERF_ALERT_DEDUPE_WINDOW_MINUTES, 360),
    dispatchFilePath:
      process.env.PERF_ALERT_DISPATCH_FILE?.trim() || "/tmp/eduadvisor-performance-alert-dispatch.ndjson",
    slackWebhookUrl,
    emailWebhookUrl,
    emailTo
  };
}

function toNumber(value: number | null) {
  if (value === null) {
    return null;
  }

  return Number(value.toFixed(2));
}

function serializeP75(metric: PerformanceAlertMetric) {
  if (metric.p75 === null) {
    return "n/a";
  }

  if (metric.metric === "CLS") {
    return metric.p75.toFixed(3);
  }

  return `${Math.round(metric.p75)}ms`;
}

function sanitizeRecord(input: unknown): PerformanceAlertDispatchRecord | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const value = input as Record<string, unknown>;
  if (
    typeof value.id !== "string" ||
    typeof value.emittedAt !== "string" ||
    typeof value.source !== "string" ||
    (value.budgetStatus !== "WARN" && value.budgetStatus !== "FAIL") ||
    typeof value.dedupeKey !== "string" ||
    !Array.isArray(value.metrics) ||
    typeof value.channels !== "object" ||
    !value.channels
  ) {
    return null;
  }

  return {
    id: value.id,
    emittedAt: value.emittedAt,
    source: value.source,
    budgetStatus: value.budgetStatus,
    dedupeKey: value.dedupeKey,
    metrics: value.metrics.filter(Boolean) as PerformanceAlertMetric[],
    channels: value.channels as PerformanceAlertDispatchRecord["channels"],
    errors: Array.isArray(value.errors) ? (value.errors.filter((item) => typeof item === "string") as string[]) : []
  };
}

async function ensureParentDir(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function readDispatchRecords(filePath: string) {
  try {
    await stat(filePath);
  } catch {
    return [] as PerformanceAlertDispatchRecord[];
  }

  const content = await readFile(filePath, "utf8");
  if (!content.trim()) {
    return [] as PerformanceAlertDispatchRecord[];
  }

  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return sanitizeRecord(JSON.parse(line));
      } catch {
        return null;
      }
    })
    .filter((item): item is PerformanceAlertDispatchRecord => item !== null);
}

async function appendDispatchRecord(filePath: string, record: PerformanceAlertDispatchRecord) {
  await ensureParentDir(filePath);
  await writeFile(filePath, `${JSON.stringify(record)}\n`, { encoding: "utf8", flag: "a" });
}

function buildDedupeKey(input: { budgetStatus: "WARN" | "FAIL"; metrics: PerformanceAlertMetric[] }) {
  const metricsSignature = input.metrics
    .map((metric) => `${metric.metric}:${metric.status}:${metric.message}`)
    .sort()
    .join("|");
  return `perf-budget:${input.budgetStatus}:${metricsSignature}`;
}

function buildMessage(input: {
  budgetStatus: "WARN" | "FAIL";
  source: string;
  emittedAt: string;
  metrics: PerformanceAlertMetric[];
}) {
  const lines = [
    `[EduAdvisor][${input.budgetStatus}] Alerta de performance`,
    `Fuente: ${input.source}`,
    `Emitido: ${input.emittedAt}`,
    "",
    ...input.metrics.map(
      (metric) =>
        `- ${metric.metric}: ${metric.message} (p75 ${serializeP75(metric)} | muestras ${metric.samples})`
    )
  ];

  return {
    subject: `[EduAdvisor] Core Web Vitals ${input.budgetStatus}`,
    text: lines.join("\n")
  };
}

async function sendSlack(input: { webhookUrl: string; subject: string; text: string }) {
  const payload = {
    text: `${input.subject}\n${input.text}`
  };
  const response = await fetch(input.webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Slack webhook responded ${response.status}`);
  }
}

async function sendEmailWebhook(input: { webhookUrl: string; to: string; subject: string; text: string }) {
  const payload = {
    to: input.to,
    subject: input.subject,
    text: input.text
  };
  const response = await fetch(input.webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Email webhook responded ${response.status}`);
  }
}

export function getPerformanceAlertChannelStatus() {
  const config = getConfig();
  return {
    enabled: config.enabled,
    slackConfigured: Boolean(config.slackWebhookUrl),
    emailWebhookConfigured: Boolean(config.emailWebhookUrl && config.emailTo),
    dedupeWindowMinutes: config.dedupeWindowMinutes
  };
}

export async function listPerformanceAlertDispatches(limit = 20) {
  const config = getConfig();
  const items = await readDispatchRecords(config.dispatchFilePath);
  return items
    .sort((a, b) => {
      if (a.emittedAt > b.emittedAt) {
        return -1;
      }
      if (a.emittedAt < b.emittedAt) {
        return 1;
      }
      return 0;
    })
    .slice(0, limit);
}

export async function triggerPerformanceBudgetAlert(source: string) {
  const config = getConfig();
  if (!config.enabled) {
    return {
      skipped: true as const,
      reason: "ALERTING_DISABLED"
    };
  }

  const snapshot = await getAnalyticsSnapshot(7);
  if (snapshot.webVitals.budgetStatus === "PASS") {
    return {
      skipped: true as const,
      reason: "BUDGET_PASS"
    };
  }

  const activeMetrics = snapshot.webVitals.alerts
    .filter((item) => item.status !== "PASS")
    .map((item) => ({
      metric: item.metric,
      status: item.status,
      message: item.message,
      p75: toNumber(item.p75),
      samples: item.samples
    }));

  if (activeMetrics.length === 0) {
    return {
      skipped: true as const,
      reason: "NO_ACTIVE_ALERTS"
    };
  }

  const nowIso = new Date().toISOString();
  const dedupeKey = buildDedupeKey({
    budgetStatus: snapshot.webVitals.budgetStatus,
    metrics: activeMetrics
  });

  const previous = await readDispatchRecords(config.dispatchFilePath);
  const dedupeSince = Date.now() - config.dedupeWindowMinutes * 60 * 1000;
  const deduped = previous.some((item) => {
    if (item.dedupeKey !== dedupeKey) {
      return false;
    }
    const emittedAtMs = new Date(item.emittedAt).getTime();
    return Number.isFinite(emittedAtMs) && emittedAtMs >= dedupeSince;
  });

  if (deduped) {
    return {
      skipped: true as const,
      reason: "DEDUPED"
    };
  }

  const message = buildMessage({
    budgetStatus: snapshot.webVitals.budgetStatus,
    source,
    emittedAt: nowIso,
    metrics: activeMetrics
  });

  const errors: string[] = [];
  let slackStatus: DispatchStatus = "skipped";
  let emailWebhookStatus: DispatchStatus = "skipped";

  if (config.slackWebhookUrl) {
    try {
      await sendSlack({
        webhookUrl: config.slackWebhookUrl,
        subject: message.subject,
        text: message.text
      });
      slackStatus = "sent";
    } catch (error) {
      slackStatus = "failed";
      errors.push(error instanceof Error ? error.message : "Slack dispatch failed");
    }
  }

  if (config.emailWebhookUrl && config.emailTo) {
    try {
      await sendEmailWebhook({
        webhookUrl: config.emailWebhookUrl,
        to: config.emailTo,
        subject: message.subject,
        text: message.text
      });
      emailWebhookStatus = "sent";
    } catch (error) {
      emailWebhookStatus = "failed";
      errors.push(error instanceof Error ? error.message : "Email webhook dispatch failed");
    }
  }

  const record: PerformanceAlertDispatchRecord = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    emittedAt: nowIso,
    source,
    budgetStatus: snapshot.webVitals.budgetStatus,
    dedupeKey,
    metrics: activeMetrics,
    channels: {
      slack: slackStatus,
      emailWebhook: emailWebhookStatus
    },
    errors
  };

  await appendDispatchRecord(config.dispatchFilePath, record);

  if (errors.length > 0) {
    return {
      skipped: false as const,
      partialFailure: true as const,
      record
    };
  }

  return {
    skipped: false as const,
    partialFailure: false as const,
    record
  };
}
