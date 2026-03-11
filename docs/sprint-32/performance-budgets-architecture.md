# Sprint 32 - Performance Budgets + Alertas

## Objetivo

Agregar control operativo continuo sobre experiencia frontend con budgets explícitos de Core Web Vitals y alertas automáticas.

## Diseño

1. **Budgets configurables por entorno**
- Variables env para cada métrica:
  - `WEB_VITAL_BUDGET_*_TARGET`
  - `WEB_VITAL_BUDGET_*_MAX`
- Regla de evaluación:
  - `PASS`: p75 <= target
  - `WARN`: p75 > target y <= max
  - `FAIL`: p75 > max

2. **Guardrail de muestra mínima**
- `WEB_VITAL_MIN_SAMPLES_FOR_BUDGET` (default 20).
- Si una métrica no alcanza muestra mínima, se marca `WARN` por evidencia insuficiente.

3. **Estado global de performance**
- `budgetStatus` agregado al snapshot de analytics:
  - `FAIL` si existe alguna métrica `FAIL`
  - `WARN` si no hay `FAIL` pero sí `WARN`
  - `PASS` en caso contrario

4. **Alertas automáticas en admin**
- `alerts[]` por métrica en snapshot.
- Panel `Admin > Analytics` muestra:
  - estado general,
  - budgets activos,
  - lista de alertas accionables.

## Resultado esperado

La operación puede detectar degradaciones de UX reales sin depender solo de percepciones o debugging manual.
