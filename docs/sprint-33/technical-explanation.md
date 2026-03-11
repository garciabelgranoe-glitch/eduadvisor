# Sprint 33 - Technical Explanation

## Qué problema resolvimos

Los budgets CWV ya existían, pero no había notificación operativa automática cuando se degradaban.

## Implementación

- Nuevo servicio server-side de alerting:
  - `apps/web/lib/server/performance-alerting.ts`
- Integración en captura analytics:
  - `apps/web/app/api/analytics/capture/route.ts`
- UI admin analytics con historial de dispatch:
  - `apps/web/app/admin/analytics/page.tsx`
- Launch Gate enriquecido con checks de alerting:
  - `apps/web/lib/admin/launch-readiness.ts`
- Configuración env:
  - `.env.example`

## Validación

- `corepack pnpm --filter @eduadvisor/web build` -> OK.
- `corepack pnpm --filter @eduadvisor/web test -- tests/product-analytics.spec.ts` -> 1 passed.
