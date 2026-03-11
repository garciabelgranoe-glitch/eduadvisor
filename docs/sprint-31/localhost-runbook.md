# Sprint 31 - Localhost Runbook (RUM)

## Cómo verificar captura de Web Vitals

1. Levantar frontend y navegar por `/`, `/search`, `/school/[slug]`.
2. Abrir `/admin/analytics` con sesión admin.
3. Validar bloque:
   - `Core Web Vitals (7 días)`
   - métricas p75 (`LCP`, `CLS`, `INP`, `FCP`, `TTFB`)
   - contador de muestras por métrica.

## Inspección directa de eventos

Archivo NDJSON local:

```bash
cat /tmp/eduadvisor-analytics-events.ndjson | rg "web_vital_reported"
```

Campos esperados en `properties`:

- `metricName`
- `metricValue`
- `metricUnit`
- `metricRating`
- `routePath`

## QA automatizado

```bash
corepack pnpm --filter @eduadvisor/web test -- tests/product-analytics.spec.ts
```
