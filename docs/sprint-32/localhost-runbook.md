# Sprint 32 - Localhost Runbook (Performance Budgets)

## Configuración de budgets

En `.env`:

```bash
WEB_VITAL_BUDGET_LCP_TARGET=2500
WEB_VITAL_BUDGET_LCP_MAX=4000
WEB_VITAL_BUDGET_CLS_TARGET=0.1
WEB_VITAL_BUDGET_CLS_MAX=0.25
WEB_VITAL_BUDGET_INP_TARGET=200
WEB_VITAL_BUDGET_INP_MAX=500
WEB_VITAL_BUDGET_FCP_TARGET=1800
WEB_VITAL_BUDGET_FCP_MAX=3000
WEB_VITAL_BUDGET_TTFB_TARGET=800
WEB_VITAL_BUDGET_TTFB_MAX=1800
WEB_VITAL_MIN_SAMPLES_FOR_BUDGET=20
```

## Verificación visual

1. Navegar por frontend para generar eventos.
2. Ingresar a `/admin/analytics`.
3. Revisar bloque:
   - `Estado de performance`
   - `Budget LCP/CLS/INP/FCP/TTFB`
   - `Alertas activas de performance` (si aplica)

## QA automatizado

```bash
corepack pnpm --filter @eduadvisor/web test -- tests/product-analytics.spec.ts
```
