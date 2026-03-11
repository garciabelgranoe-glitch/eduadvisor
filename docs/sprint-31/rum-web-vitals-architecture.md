# Sprint 31 - RUM Core Web Vitals

## Objetivo

Incorporar medición real de experiencia de usuario (RUM) para performance frontend y exponerla en el panel admin.

## Arquitectura

1. Captura cliente:
- `WebVitalsTracker` se monta en layout global.
- Observa métricas: `LCP`, `CLS`, `INP`, `FCP`, `TTFB`.
- Envía eventos `web_vital_reported` vía `/api/analytics/capture`.

2. Ingesta:
- Reutiliza el pipeline de analytics existente (NDJSON local + Posthog opcional).
- Enriquecimiento por evento con:
  - `metricName`
  - `metricValue`
  - `metricUnit`
  - `metricRating`
  - `routePath`

3. Agregación:
- `analytics-store` calcula:
  - muestras por métrica,
  - p75 por métrica,
  - distribución de calidad (`good`, `needs_improvement`, `poor`).

4. Visualización:
- Admin Analytics muestra bloque “Core Web Vitals (7 días)” con p75 y volumen de muestras.

## Impacto de producto

- Permite priorizar optimizaciones por evidencia real de usuarios.
- Alinea criterios de calidad premium con métricas de industria (CWV).
