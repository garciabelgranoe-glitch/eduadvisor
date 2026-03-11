# Sprint 28 - Tracking Funnel Final (GTM-027)

## Objetivo

Cerrar `GTM-027` con un funnel canónico de producto listo para Posthog, medible extremo a extremo y visible en panel admin.

## Diseño implementado

- Se definió un esquema central de funnel (`v1`) compartido por cliente y servidor.
- Cada hito del journey dispara evento canónico:
  - `funnel_search_results_viewed`
  - `funnel_school_profile_viewed`
  - `funnel_school_saved`
  - `funnel_comparison_saved`
  - `funnel_lead_submitted`
- Captura server-side en `/api/analytics/capture`:
  - añade automáticamente `funnelStep` + `funnelVersion` para eventos canónicos.
  - persiste local (NDJSON) y reenvía a Posthog cuando hay API key.
- Snapshot analítico (`getAnalyticsSnapshot`) ahora expone:
  - volumen por etapa
  - conversiones por transición
  - estado de configuración Posthog
  - versión activa de funnel

## Decisiones de producto

- Mantener eventos legacy para continuidad histórica.
- Dual tracking (legacy + funnel canónico) para migración sin pérdida de datos.
- Soportar modo parcial sin backend de API: admin analytics sigue operativo con fallback.
