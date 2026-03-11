# Sprint 28 - Localhost Runbook (GTM-027)

## Variables recomendadas

```bash
POSTHOG_PROJECT_API_KEY=phc_xxx   # opcional
POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

## Ejecutar validación

1. Suite de funnel + analytics:
   - `corepack pnpm --filter @eduadvisor/web test -- tests/product-analytics.spec.ts tests/gtm-posthog-funnel.spec.ts`
2. Lint web:
   - `corepack pnpm --filter @eduadvisor/web lint`

## Qué verificar en UI admin

- `/admin/analytics` muestra sección `Funnel de eventos (Posthog)`.
- Se ven métricas por etapa y conversiones.
- `Estado de tracking` muestra:
  - Posthog habilitado (sí/no)
  - versión de funnel activa.
