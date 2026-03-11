# Sprint 32 - Technical Explanation

## Qué problema resolvimos

Teníamos métricas de Core Web Vitals visibles, pero sin umbrales operativos ni semaforización para actuar rápido.

## Implementación

- Extensión de snapshot analytics con:
  - budgets por métrica,
  - muestra mínima configurable,
  - `budgetStatus` global,
  - `alerts[]` por métrica.
- Variables env incorporadas para budgets y muestra mínima.
- UI admin analytics extendida con:
  - badge de estado de performance,
  - visualización de budgets target/max,
  - listado de alertas activas.

## Archivos clave

- `apps/web/lib/server/analytics-store.ts`
- `apps/web/app/admin/analytics/page.tsx`
- `.env.example`
- `apps/web/tests/product-analytics.spec.ts`

## Validación

- `corepack pnpm --filter @eduadvisor/web build` -> OK.
- `corepack pnpm --filter @eduadvisor/web test -- tests/product-analytics.spec.ts` -> 1 passed.
