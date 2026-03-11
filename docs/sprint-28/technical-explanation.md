# Sprint 28 - Technical Explanation

## Qué problema resolvimos

El tracking estaba distribuido y con nomenclaturas heterogéneas, lo que complicaba cerrar un funnel único en Posthog para toma de decisiones de crecimiento.

## Implementación

- Se creó `analytics-schema` con eventos canónicos y versión de funnel.
- Se agregó helper `trackFunnelStep` para emitir hitos consistentes desde UI.
- Se instrumentaron hitos críticos del producto:
  - resultados de búsqueda
  - vista de perfil
  - guardado en shortlist
  - guardado de comparación
  - envío de lead
- El endpoint de captura enriquece eventos canónicos con metadatos de funnel antes de persistir/enviar.
- El snapshot de analytics calcula embudo por `distinctId` (progresivo) y conversiones por etapa.
- El panel admin muestra métricas del funnel Posthog y estado de configuración.

## Validación

- Playwright:
  - `tests/gtm-posthog-funnel.spec.ts`
  - `tests/product-analytics.spec.ts`
- Lint:
  - `pnpm --filter @eduadvisor/web lint`
