# Sprint 33 - Localhost Runbook (Alerting)

## Variables mínimas

```bash
PERF_ALERTS_ENABLED=true
PERF_ALERT_DEDUPE_WINDOW_MINUTES=360
PERF_ALERT_SLACK_WEBHOOK_URL=
PERF_ALERT_EMAIL_WEBHOOK_URL=
PERF_ALERT_EMAIL_TO=
PERF_ALERT_DISPATCH_FILE=/tmp/eduadvisor-performance-alert-dispatch.ndjson
```

## Flujo de validación

1. Generar eventos CWV (`web_vital_reported`) navegando la app o vía endpoint de capture.
2. Entrar a `/admin/analytics`.
3. Revisar sección:
   - `Alertas de performance enviadas`
   - estado de canales configurados
   - registros recientes de dispatch.

## Inspección manual del historial

```bash
cat /tmp/eduadvisor-performance-alert-dispatch.ndjson
```

## Launch gate

Ir a `/admin/launch` y verificar checks:

- `Alerting performance habilitado`
- `Canales alertas performance`
