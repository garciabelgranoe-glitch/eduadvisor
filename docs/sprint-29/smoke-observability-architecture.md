# Sprint 29 - Smoke Post-Deploy + Observabilidad (GTM-028)

## Objetivo

Cerrar `GTM-028` con un gate de smoke post-deploy ejecutable sobre producción y criterios explícitos de observabilidad operativa.

## Alcance del smoke gate

El smoke valida en orden:

1. API liveness (`/v1/health/live`) con reintentos.
2. API readiness (`/v1/health/ready`) aceptando `ready|degraded`, exigiendo DB disponible.
3. Search health (`/v1/search/health`).
4. Admin health (`/v1/admin/health`).
5. Endpoints observables con scope admin (`/v1/health/metrics`, `/v1/admin/overview`) cuando hay key.
6. Rutas críticas web (`/`, `/search`, `/robots.txt`, `/sitemap_index.xml`).
7. Captura de tracking (`/api/analytics/capture`) para confirmar pipeline analítico mínimo.

## Decisiones de diseño

- Implementación en bash para portabilidad y ejecución simple en CI/CD.
- `retry` configurable para absorber propagación de deploys (Vercel/Railway).
- Salida fail-fast para bloquear releases con regresiones críticas.
- Modo degradado controlado si no se define `SMOKE_ADMIN_READ_API_KEY` (omite checks protegidos).

## Tuning de observabilidad

- Se adopta `health/metrics` como checkpoint estándar post-deploy.
- Se incorpora verificación explícita del endpoint de capture analytics como indicador de integridad de tracking.
- Se deja script reusable para incident response y validación manual fuera de CI.
