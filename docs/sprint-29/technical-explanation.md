# Sprint 29 - Technical Explanation

## Qué problema resolvimos

El deploy disparaba hooks pero no tenía validación automática de funcionamiento real (API, web, admin, tracking) luego del release.

## Implementación

- Script `infra/scripts/smoke-post-deploy.sh` con chequeos secuenciales y reintentos.
- Integración en workflow de deploy (`post-deploy-smoke`) para ejecución automática tras deploy API.
- Parametrización por secrets/env para ambientes productivos.
- Script publicado como comando de repositorio (`pnpm smoke:post-deploy`).

## Resultado esperado

- Deploys con confirmación técnica mínima antes de considerarse “sanos”.
- Detección temprana de caídas de health/readiness y regresiones de web/analytics.
- Base estable para etapas de beta controlada (`GTM-029`, `GTM-030`).
