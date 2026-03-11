import { resolveLaunchMode, type LaunchMode } from "@/lib/beta/launch-mode";
import { getPerformanceAlertChannelStatus } from "@/lib/server/performance-alerting";

export type LaunchCheckStatus = "PASS" | "WARN" | "FAIL";

export interface LaunchReadinessCheck {
  id: string;
  label: string;
  status: LaunchCheckStatus;
  required: boolean;
  target: string;
  message: string;
  httpStatus: number | null;
  latencyMs: number | null;
}

export interface LaunchReadinessSnapshot {
  generatedAt: string;
  launchMode: LaunchMode;
  summary: {
    status: LaunchCheckStatus;
    pass: number;
    warn: number;
    fail: number;
  };
  checks: LaunchReadinessCheck[];
  recommendations: string[];
}

const DEFAULT_TIMEOUT_MS = 2_500;
const APP_BASE = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
const API_BASE = process.env.API_URL?.trim() || "http://localhost:4000";

function parseCsvToSet(value: string | undefined) {
  if (!value) {
    return new Set<string>();
  }

  return new Set(
    value
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

function isTruthy(rawValue: string | undefined, fallback = false) {
  if (typeof rawValue !== "string") {
    return fallback;
  }
  const value = rawValue.trim().toLowerCase();
  if (value.length === 0) {
    return fallback;
  }
  return ["1", "true", "yes", "on"].includes(value);
}

function classifyHttpStatus(httpStatus: number | null): LaunchCheckStatus {
  if (httpStatus === null) {
    return "FAIL";
  }

  if (httpStatus >= 200 && httpStatus < 400) {
    return "PASS";
  }

  return "FAIL";
}

async function probeHttp(input: {
  id: string;
  label: string;
  required: boolean;
  target: string;
  headers?: Record<string, string>;
  validateBody?: (body: unknown) => { status: LaunchCheckStatus; message: string } | null;
}): Promise<LaunchReadinessCheck> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const response = await fetch(input.target, {
      method: "GET",
      cache: "no-store",
      headers: input.headers,
      signal: controller.signal
    });
    const latencyMs = Date.now() - startedAt;
    const httpStatus = response.status;
    const httpStatusClass = classifyHttpStatus(httpStatus);

    let status: LaunchCheckStatus = httpStatusClass;
    let message = httpStatusClass === "PASS" ? "Disponible" : `HTTP ${httpStatus}`;

    if (httpStatusClass === "PASS" && input.validateBody) {
      const body = await response.json().catch(() => null);
      const validation = input.validateBody(body);
      if (validation) {
        status = validation.status;
        message = validation.message;
      }
    }

    return {
      id: input.id,
      label: input.label,
      required: input.required,
      target: input.target,
      status,
      message,
      httpStatus,
      latencyMs
    };
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    const reason =
      error && typeof error === "object" && "name" in error && error.name === "AbortError"
        ? `Timeout > ${DEFAULT_TIMEOUT_MS}ms`
        : "No disponible";

    return {
      id: input.id,
      label: input.label,
      required: input.required,
      target: input.target,
      status: "FAIL",
      message: reason,
      httpStatus: null,
      latencyMs
    };
  } finally {
    clearTimeout(timeout);
  }
}

function runEnvChecks(launchMode: LaunchMode): LaunchReadinessCheck[] {
  const challengeRequired = isTruthy(process.env.PUBLIC_FORM_CHALLENGE_REQUIRED, false);

  const requiredEnv = [
    "AUTH_SESSION_SECRET",
    "ADMIN_API_KEY",
    "REDIS_URL",
    "GOOGLE_OAUTH_CLIENT_ID",
    "GOOGLE_OAUTH_CLIENT_SECRET",
    "API_URL",
    "NEXT_PUBLIC_APP_URL"
  ] as const;

  const optionalEnv = [
    "POSTHOG_PROJECT_API_KEY",
    "NEXT_PUBLIC_POSTHOG_KEY",
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY"
  ] as const;

  const requiredChecks = requiredEnv.map((key) => {
    const value = process.env[key];
    const present = Boolean(value?.trim());

    return {
      id: `env:${key.toLowerCase()}`,
      label: `ENV ${key}`,
      required: true,
      target: key,
      status: present ? ("PASS" as const) : ("FAIL" as const),
      message: present ? "Configurado" : "Variable faltante",
      httpStatus: null,
      latencyMs: null
    };
  });

  const optionalChecks: LaunchReadinessCheck[] = optionalEnv.map((key) => {
    const value = process.env[key];
    const present = Boolean(value?.trim());
    const status: LaunchCheckStatus = present ? "PASS" : "WARN";
    return {
      id: `env:${key.toLowerCase()}`,
      label: `ENV ${key}`,
      required: false,
      target: key,
      status,
      message: present ? "Configurado" : "Opcional no configurado",
      httpStatus: null,
      latencyMs: null
    };
  });

  const challengeChecks: LaunchReadinessCheck[] = [
    {
      id: "env:public_form_challenge_required",
      label: "ENV PUBLIC_FORM_CHALLENGE_REQUIRED",
      required: launchMode !== "PRIVATE",
      target: "PUBLIC_FORM_CHALLENGE_REQUIRED",
      status: challengeRequired ? "PASS" : launchMode === "PRIVATE" ? "WARN" : "FAIL",
      message: challengeRequired ? "Challenge anti-bot requerido" : "Challenge anti-bot desactivado",
      httpStatus: null,
      latencyMs: null
    },
    {
      id: "env:turnstile_provider",
      label: "ENV PUBLIC_FORM_CHALLENGE_PROVIDER",
      required: challengeRequired,
      target: "PUBLIC_FORM_CHALLENGE_PROVIDER",
      status:
        (process.env.PUBLIC_FORM_CHALLENGE_PROVIDER?.trim().toLowerCase() || "turnstile") === "turnstile"
          ? "PASS"
          : "FAIL",
      message:
        (process.env.PUBLIC_FORM_CHALLENGE_PROVIDER?.trim().toLowerCase() || "turnstile") === "turnstile"
          ? "Provider configurado: turnstile"
          : "Provider inválido (solo turnstile soportado)",
      httpStatus: null,
      latencyMs: null
    }
  ];

  if (challengeRequired) {
    for (const check of optionalChecks) {
      if (check.target === "NEXT_PUBLIC_TURNSTILE_SITE_KEY" || check.target === "TURNSTILE_SECRET_KEY") {
        check.required = true;
        check.status = check.status === "PASS" ? "PASS" : "FAIL";
        check.message = check.status === "PASS" ? "Configurado" : "Variable faltante";
      }
    }
  }

  const parentAllowList = parseCsvToSet(process.env.BETA_PRIVATE_ALLOWED_PARENT_EMAILS);
  const schoolSlugAllowList = parseCsvToSet(process.env.BETA_PRIVATE_ALLOWED_SCHOOL_SLUGS);
  const schoolEmailAllowList = parseCsvToSet(process.env.BETA_PRIVATE_ALLOWED_SCHOOL_EMAILS);
  const schoolAllowListSize = schoolSlugAllowList.size + schoolEmailAllowList.size;

  const launchPolicyChecks: LaunchReadinessCheck[] = [];
  const performanceAlerting = getPerformanceAlertChannelStatus();

  if (launchMode === "PRIVATE") {
    launchPolicyChecks.push({
      id: "launch:private-parent-allowlist",
      label: "Allowlist padres (private beta)",
      required: true,
      target: "BETA_PRIVATE_ALLOWED_PARENT_EMAILS",
      status: parentAllowList.size > 0 ? "PASS" : "FAIL",
      message: parentAllowList.size > 0 ? "Hay cuentas habilitadas" : "No hay cuentas de padres invitadas",
      httpStatus: null,
      latencyMs: null
    });
  }

  if (launchMode === "PRIVATE" || launchMode === "PUBLIC") {
    launchPolicyChecks.push({
      id: "launch:school-allowlist",
      label: "Allowlist colegios",
      required: true,
      target: "BETA_PRIVATE_ALLOWED_SCHOOL_SLUGS/BETA_PRIVATE_ALLOWED_SCHOOL_EMAILS",
      status: schoolAllowListSize > 0 ? "PASS" : "FAIL",
      message: schoolAllowListSize > 0 ? "Hay colegios habilitados" : "No hay colegios invitados",
      httpStatus: null,
      latencyMs: null
    });
  }

  launchPolicyChecks.push({
    id: "launch:perf-alerting-enabled",
    label: "Alerting performance habilitado",
    required: launchMode !== "PRIVATE",
    target: "PERF_ALERTS_ENABLED",
    status: performanceAlerting.enabled ? "PASS" : launchMode === "PRIVATE" ? "WARN" : "FAIL",
    message: performanceAlerting.enabled ? "Habilitado" : "Deshabilitado",
    httpStatus: null,
    latencyMs: null
  });

  const channelsConfigured = performanceAlerting.slackConfigured || performanceAlerting.emailWebhookConfigured;
  launchPolicyChecks.push({
    id: "launch:perf-alerting-channels",
    label: "Canales alertas performance",
    required: launchMode === "OPEN",
    target: "PERF_ALERT_SLACK_WEBHOOK_URL/PERF_ALERT_EMAIL_WEBHOOK_URL",
    status: channelsConfigured ? "PASS" : launchMode === "OPEN" ? "FAIL" : "WARN",
    message: channelsConfigured ? "Al menos un canal configurado" : "Sin canales configurados",
    httpStatus: null,
    latencyMs: null
  });

  return [...requiredChecks, ...optionalChecks, ...challengeChecks, ...launchPolicyChecks];
}

function summarize(checks: LaunchReadinessCheck[]) {
  const pass = checks.filter((check) => check.status === "PASS").length;
  const warn = checks.filter((check) => check.status === "WARN").length;
  const fail = checks.filter((check) => check.status === "FAIL").length;
  const hasRequiredFailure = checks.some((check) => check.required && check.status === "FAIL");

  if (hasRequiredFailure || fail > 0) {
    return {
      status: "FAIL" as const,
      pass,
      warn,
      fail
    };
  }

  if (warn > 0) {
    return {
      status: "WARN" as const,
      pass,
      warn,
      fail
    };
  }

  return {
    status: "PASS" as const,
    pass,
    warn,
    fail
  };
}

function buildRecommendations(snapshot: { launchMode: LaunchMode; checks: LaunchReadinessCheck[] }) {
  const recommendations: string[] = [];
  const failedRequired = snapshot.checks.filter((check) => check.required && check.status === "FAIL");
  const failedHealthChecks = snapshot.checks.filter((check) => check.id.startsWith("health:") && check.status !== "PASS");
  const warnedChecks = snapshot.checks.filter((check) => check.status === "WARN");

  if (failedRequired.length > 0) {
    recommendations.push("Bloquear Go-Live hasta resolver todos los FAIL requeridos (config + accesibilidad).");
  }

  if (failedHealthChecks.length > 0) {
    recommendations.push("Repetir smoke post-deploy y estabilizar endpoints críticos antes de abrir tráfico.");
  }

  if (snapshot.launchMode === "PUBLIC") {
    recommendations.push("Mantener colegios por invitación y ampliar lotes semanales según capacidad operativa.");
  }

  if (snapshot.launchMode === "PRIVATE") {
    recommendations.push("Verificar lista de invitaciones y SLA de soporte antes de invitar nuevos usuarios.");
  }

  if (warnedChecks.length > 0) {
    recommendations.push("Planificar cierre de WARN operativos durante la primera semana de beta pública.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Checklist sin desvíos. Plataforma en condiciones para salida controlada.");
  }

  return recommendations;
}

export async function getLaunchReadinessSnapshot(): Promise<LaunchReadinessSnapshot> {
  const launchMode = resolveLaunchMode();
  const adminReadApiKey = process.env.ADMIN_READ_API_KEY?.trim() || process.env.ADMIN_API_KEY?.trim() || "";

  const healthChecks = await Promise.all([
    probeHttp({
      id: "health:api-live",
      label: "API liveness",
      required: true,
      target: `${API_BASE}/v1/health/live`
    }),
    probeHttp({
      id: "health:api-ready",
      label: "API readiness",
      required: true,
      target: `${API_BASE}/v1/health/ready`,
      validateBody: (body) => {
        if (!body || typeof body !== "object") {
          return {
            status: "FAIL",
            message: "Body inválido en readiness"
          };
        }

        const value = body as Record<string, unknown>;
        const status = typeof value.status === "string" ? value.status.trim().toLowerCase() : "";
        const databaseOk = value.database === "available";

        if ((status === "ready" || status === "degraded") && databaseOk) {
          return {
            status: status === "ready" ? "PASS" : "WARN",
            message: status === "ready" ? "ready + database available" : "degraded + database available"
          };
        }

        return {
          status: "FAIL",
          message: "Readiness no cumple criterio de base de datos disponible"
        };
      }
    }),
    probeHttp({
      id: "health:search",
      label: "Search health",
      required: true,
      target: `${API_BASE}/v1/search/health`
    }),
    probeHttp({
      id: "health:admin",
      label: "Admin health",
      required: true,
      target: `${API_BASE}/v1/admin/health`
    }),
    probeHttp({
      id: "health:web-home",
      label: "Web home",
      required: true,
      target: `${APP_BASE}/`
    }),
    probeHttp({
      id: "health:web-search",
      label: "Web search",
      required: true,
      target: `${APP_BASE}/search`
    }),
    probeHttp({
      id: "health:web-robots",
      label: "Web robots",
      required: true,
      target: `${APP_BASE}/robots.txt`
    }),
    probeHttp({
      id: "health:web-sitemap",
      label: "Web sitemap",
      required: true,
      target: `${APP_BASE}/sitemap_index.xml`
    })
  ]);

  const adminReadChecks = adminReadApiKey
    ? await Promise.all([
        probeHttp({
          id: "health:metrics",
          label: "API metrics endpoint",
          required: false,
          target: `${API_BASE}/v1/health/metrics`,
          headers: {
            "x-admin-key": adminReadApiKey
          }
        }),
        probeHttp({
          id: "health:admin-overview",
          label: "Admin overview",
          required: false,
          target: `${API_BASE}/v1/admin/overview`,
          headers: {
            "x-admin-key": adminReadApiKey
          }
        })
      ])
    : ([
        {
          id: "health:metrics",
          label: "API metrics endpoint",
          required: false,
          target: "ADMIN_READ_API_KEY",
          status: "WARN" as const,
          message: "Sin ADMIN_READ_API_KEY para validar métricas",
          httpStatus: null,
          latencyMs: null
        },
        {
          id: "health:admin-overview",
          label: "Admin overview",
          required: false,
          target: "ADMIN_READ_API_KEY",
          status: "WARN" as const,
          message: "Sin ADMIN_READ_API_KEY para validar admin overview",
          httpStatus: null,
          latencyMs: null
        }
      ] satisfies LaunchReadinessCheck[]);

  const envChecks = runEnvChecks(launchMode);
  const checks = [...healthChecks, ...adminReadChecks, ...envChecks];
  const summary = summarize(checks);

  return {
    generatedAt: new Date().toISOString(),
    launchMode,
    summary,
    checks,
    recommendations: buildRecommendations({ launchMode, checks })
  };
}
