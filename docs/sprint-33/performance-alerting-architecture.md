# Sprint 33 - Performance Alerting Accionable

## Objetivo

Convertir los budgets de Core Web Vitals en alertas operativas accionables con envío a canales reales y deduplicación.

## Diseño

1. Trigger operativo:
- sobre `web_vital_reported` en `/api/analytics/capture` se evalúa snapshot de CWV (7 días).
- si el estado de budget es `WARN` o `FAIL`, se evalúa envío.

2. Dedupe:
- `dedupeKey` por firma de estado y métricas activas.
- ventana configurable (`PERF_ALERT_DEDUPE_WINDOW_MINUTES`) para evitar spam.

3. Canales de dispatch:
- Slack webhook (`PERF_ALERT_SLACK_WEBHOOK_URL`).
- Email webhook genérico (`PERF_ALERT_EMAIL_WEBHOOK_URL` + `PERF_ALERT_EMAIL_TO`).

4. Persistencia operativa:
- historial local NDJSON de dispatches (`PERF_ALERT_DISPATCH_FILE`).
- cada registro incluye estado por canal (`sent/skipped/failed`) y errores.

5. Visibilidad admin:
- `Admin > Analytics` muestra:
  - estado de configuración de canales,
  - historial reciente de dispatches.
- `Admin > Launch` incorpora checks de readiness para alerting de performance.
