# EduAdvisor - Backlog Ejecutable 30 Dias (Seguridad + Go To Market)

Fecha base: 2026-03-07  
Ventana operativa: 2026-03-08 a 2026-04-06  
Fuente: [security-hardening-roadmap.md](/Users/emilianobel/Desktop/Eduadvisor/docs/security/security-hardening-roadmap.md)

## 1. Reglas de ejecucion

- Cada ticket pasa por estados: `todo -> in_progress -> qa -> done`.
- No se abre tarea P1 si quedan P0 abiertos.
- Todo cambio de seguridad debe incluir prueba automatizada o prueba manual documentada.
- Merge a `main` solo si pasa CI + security gates definidos.

## 2. Definition of Done (DoD)

Un ticket se considera `done` solo si:

1. Codigo implementado.
2. Test agregado/actualizado y verde.
3. Documentacion de cambio actualizada.
4. Validacion manual registrada (ruta, payload, resultado esperado/obtenido).

## 3. Tablero de tickets (resumen)

## P0 - Bloqueo critico

- `SEC-P0-001` Remover admin token por query y cookie estatica.
- `SEC-P0-002` Guard de sesion admin + RBAC para `app/api/admin/*`.
- `SEC-P0-003` Guard de ownership para `app/api/schools/profile`.
- `SEC-P0-004` Guard de ownership para `app/api/schools/leads-export`.
- `SEC-P0-005` Guard de ownership para `app/api/reviews/respond`.
- `SEC-P0-006` Guard de ownership para `app/api/reviews/moderate`.
- `SEC-P0-007` Guard de ownership para `app/api/leads/status`.
- `SEC-P0-008` Eliminar fallbacks inseguros de secretos.
- `SEC-P0-009` Fail-fast de envs criticas en runtime no-local.
- `SEC-P0-010` Regression pack authz (admin/school/parent/anon).

## P1 - Exposicion y hardening

- `SEC-P1-011` Hardening anti-enumeracion en `school-claim-status`.
- `SEC-P1-012` Rate limit distribuido con Redis.
- `SEC-P1-013` Policy de headers seguridad en `apps/web`.
- `SEC-P1-014` Hardening headers/CORS en `apps/api`.
- `SEC-P1-015` Endurecer cookies y sesion.
- `SEC-P1-016` Security tests para abuse paths.

## P1/P2 - Operacion y pipeline

- `SEC-OPS-017` CI gate SAST (semgrep).
- `SEC-OPS-018` CI gate secret scanning.
- `SEC-OPS-019` CI gate dependency audit con severidad.
- `SEC-OPS-020` Corregir `.dockerignore` para secretos.
- `SEC-OPS-021` Logging de auditoria con redaccion PII.
- `SEC-OPS-022` Runbook incidente y rotacion secretos.
- `SEC-P2-023` Webhook billing robusto (firma + antireplay).
- `SEC-P2-024` Anti abuso avanzado en leads/reviews/claim.

## Go To Market y release

- `GTM-025` QA funcional integral (search, login, dashboards, billing).
- `GTM-026` QA SEO y contenido landing ciudades.
- `GTM-027` Tracking funnel final en Posthog.
- `GTM-028` Smoke test post deploy.
- `GTM-029` Beta privada controlada.
- `GTM-030` Beta publica controlada + monitoreo.

## 4. Plan dia por dia (30 dias)

## Semana 1 - P0 (Dias 1 a 7)

### Dia 1 (2026-03-08)
- `SEC-P0-001` diseño + implementacion inicial.
- Archivos foco:
  - `apps/web/middleware.ts`
  - `apps/web/app/ingresar/page.tsx`
  - `apps/web/lib/auth/*`
- Criterio:
  - `/admin?adminToken=...` deja de otorgar sesion.

### Dia 2 (2026-03-09)
- `SEC-P0-002` admin guard + RBAC en:
  - `apps/web/app/api/admin/schools/status/route.ts`
  - `apps/web/app/api/admin/claim-requests/status/route.ts`
  - `apps/web/app/api/admin/subscriptions/status/route.ts`
  - `apps/web/app/api/admin/billing/*`

### Dia 3 (2026-03-10)
- `SEC-P0-003`, `SEC-P0-004` ownership checks:
  - `apps/web/app/api/schools/profile/route.ts`
  - `apps/web/app/api/schools/leads-export/route.ts`

### Dia 4 (2026-03-11)
- `SEC-P0-005`, `SEC-P0-006`, `SEC-P0-007` ownership checks:
  - `apps/web/app/api/reviews/respond/route.ts`
  - `apps/web/app/api/reviews/moderate/route.ts`
  - `apps/web/app/api/leads/status/route.ts`

### Dia 5 (2026-03-12)
- `SEC-P0-008` eliminar fallbacks:
  - `apps/api/src/common/guards/admin-api-key.guard.ts`
  - `apps/web/lib/auth/session.ts`
  - `apps/web/app/api/session/role/route.ts`

### Dia 6 (2026-03-13)
- `SEC-P0-009` fail-fast envs criticas:
  - `apps/api/src/main.ts`
  - `apps/web/*` bootstrap/config
- documentar envs obligatorias en `.env.example`.

### Dia 7 (2026-03-14)
- `SEC-P0-010` regression pack + cierre P0.
- evidencia no-auth access blocked en endpoints sensibles.

## Semana 2 - P1 tecnico (Dias 8 a 14)

### Dia 8 (2026-03-15)
- `SEC-P1-011` anti enumeracion:
  - `apps/web/app/api/session/school-claim-status/route.ts`

### Dia 9 (2026-03-16)
- `SEC-P1-012` rate limit Redis (backend):
  - `apps/api/src/common/rate-limit/*`
  - integrar Redis provider/cache module.

### Dia 10 (2026-03-17)
- `SEC-P1-013` headers web:
  - `apps/web/next.config.mjs`
  - middleware complementario si aplica.

### Dia 11 (2026-03-18)
- `SEC-P1-014` headers/CORS api:
  - `apps/api/src/main.ts`

### Dia 12 (2026-03-19)
- `SEC-P1-015` cookies y sesion:
  - revisar `SameSite`, `Secure`, TTL, rotacion.
  - `apps/web/lib/auth/session.ts`
  - `apps/web/app/api/session/*`

### Dia 13 (2026-03-20)
- `SEC-P1-016` tests de abuso/rate-limit/authz.

### Dia 14 (2026-03-21)
- cierre semana 2 + gate P1 critico.

## Semana 3 - CI/AppSec/Operacion (Dias 15 a 21)

### Dia 15 (2026-03-22)
- `SEC-OPS-017` SAST en CI:
  - `.github/workflows/ci.yml`

### Dia 16 (2026-03-23)
- `SEC-OPS-018` secret scanning CI.

### Dia 17 (2026-03-24)
- `SEC-OPS-019` dependency audit gate.

### Dia 18 (2026-03-25)
- `SEC-OPS-020` `.dockerignore` + build context hardening.

### Dia 19 (2026-03-26)
- `SEC-OPS-021` logging auditoria + redaccion PII.

### Dia 20 (2026-03-27)
- `SEC-OPS-022` runbook incidente + runbook rotacion secretos.

### Dia 21 (2026-03-28)
- verificacion integral seguridad + operacion.

## Semana 4 - P2 + Go To Market (Dias 22 a 30)

### Dia 22 (2026-03-29)
- `SEC-P2-023` webhook billing robusto:
  - `apps/api/src/modules/billing/billing.service.ts`

### Dia 23 (2026-03-30)
- `SEC-P2-024` anti abuso avanzado leads/reviews/claim.

### Dia 24 (2026-03-31)
- `GTM-025` QA funcional integral.

### Dia 25 (2026-04-01)
- `GTM-026` QA SEO + contenido.

### Dia 26 (2026-04-02)
- `GTM-027` funnel final Posthog + dashboards de conversion.

### Dia 27 (2026-04-03)
- `GTM-028` smoke test post deploy + tuning observabilidad.

### Dia 28 (2026-04-04)
- `GTM-029` beta privada controlada (colegios + familias invitadas).

### Dia 29 (2026-04-05)
- hardening de feedback beta + fixes bloqueantes.

### Dia 30 (2026-04-06)
- `GTM-030` beta publica controlada + decision Go/No-Go final.

## 5. Matriz de riesgo a ticket

- `P0-1` -> `SEC-P0-002`
- `P0-2` -> `SEC-P0-003` a `SEC-P0-007`
- `P0-3` -> `SEC-P0-001`
- `P0-4` -> `SEC-P0-008`, `SEC-P0-009`
- `P1-1` -> `SEC-P1-011`
- `P1-2` -> `SEC-P1-012`
- `P1-3` -> `SEC-P1-013`, `SEC-P1-014`, `SEC-P1-015`
- `P1-4` -> `SEC-OPS-017`, `SEC-OPS-018`, `SEC-OPS-019`
- `P1-5` -> `SEC-OPS-020`
- `P2-1` -> `SEC-P2-023`

## 6. Indicadores semanales

- `% endpoints sensibles protegidos con authz valida`
- `% P0 cerrados`
- `% P1 cerrados`
- `% PR con security checks aprobados`
- `error rate` y `auth failure rate` por endpoint critico

## 7. Estado de ejecucion (actual)

- `SEC-P0-001` completado el 2026-03-07.
- `SEC-P0-002` completado el 2026-03-07.
  - aplicado guard de sesion admin + RBAC en:
    - `apps/web/app/api/admin/schools/status/route.ts`
    - `apps/web/app/api/admin/claim-requests/status/route.ts`
    - `apps/web/app/api/admin/subscriptions/status/route.ts`
    - `apps/web/app/api/admin/billing/checkout/route.ts`
    - `apps/web/app/api/admin/billing/simulate/route.ts`
- `SEC-P0-003` completado el 2026-03-07.
  - aplicado guard de sesion escolar + ownership check en:
    - `apps/web/app/api/schools/profile/route.ts`
- `SEC-P0-004` completado el 2026-03-07.
  - aplicado guard de sesion escolar + ownership check en:
    - `apps/web/app/api/schools/leads-export/route.ts`
- `SEC-P0-005` completado el 2026-03-07.
  - aplicado guard de sesion escolar + ownership check en:
    - `apps/web/app/api/reviews/respond/route.ts`
- `SEC-P0-006` completado el 2026-03-07.
  - aplicado guard de sesion admin en:
    - `apps/web/app/api/reviews/moderate/route.ts`
- `SEC-P0-007` completado el 2026-03-07.
  - aplicado guard de sesion escolar + ownership check en:
    - `apps/web/app/api/leads/status/route.ts`
- `SEC-P0-008` completado el 2026-03-07.
  - eliminados fallbacks inseguros en:
    - `apps/api/src/common/guards/admin-api-key.guard.ts`
    - `apps/web/lib/auth/session.ts`
    - `apps/web/app/api/session/role/route.ts`
  - removido fallback `dev-admin-key` en rutas BFF y cliente server-side (`apps/web/**`).
- `SEC-P0-009` completado el 2026-03-07.
  - fail-fast de envs críticas en runtime no-local:
    - `apps/api/src/main.ts`
    - `apps/web/lib/env/critical.ts`
    - `apps/web/middleware.ts`
  - documentación de envs críticas actualizada:
    - `.env.example`
- `SEC-P0-010` completado el 2026-03-07.
  - regression pack authz (`admin/school/parent/anon`):
    - `apps/web/tests/security-admin-rbac.spec.ts`
    - `apps/web/tests/security-school-profile-ownership.spec.ts`
    - `apps/web/tests/security-authz-regression.spec.ts`
- `SEC-P1-011` completado el 2026-03-07.
  - anti-enumeracion aplicado en:
    - `apps/web/app/api/session/school-claim-status/route.ts`
  - controles agregados:
    - rate limit por IP
    - response shaping sin metadata sensible
    - política `no-store`
  - soporte técnico:
    - `apps/web/lib/security/in-memory-rate-limit.ts`
  - regression tests:
    - `apps/web/tests/security-claim-status-enumeration.spec.ts`
- `SEC-P1-012` completado el 2026-03-07.
  - rate limit distribuido con Redis en backend:
    - `apps/api/src/common/rate-limit/rate-limit.service.ts`
    - `apps/api/src/common/rate-limit/rate-limit.guard.ts`
  - fallback controlado a in-memory cuando Redis no está disponible.
  - tests unitarios actualizados:
    - `apps/api/src/common/rate-limit/rate-limit.service.spec.ts`
- `SEC-P1-013` completado el 2026-03-07.
  - policy de headers web aplicada en:
    - `apps/web/next.config.mjs`
  - tests de regresión:
    - `apps/web/tests/security-headers-web.spec.ts`
- `SEC-P1-014` completado el 2026-03-07.
  - hardening headers/CORS API aplicado en:
    - `apps/api/src/main.ts`
    - `apps/api/src/common/http-security/http-security.config.ts`
  - controles:
    - allowlist CORS (`NEXT_PUBLIC_APP_URL` + `CORS_ALLOWED_ORIGINS` + localhost)
    - remoción de `X-Powered-By`
    - headers de seguridad base + HSTS en entornos no locales
  - tests unitarios:
    - `apps/api/src/common/http-security/http-security.config.spec.ts`
- `SEC-P1-015` completado el 2026-03-07.
  - endurecimiento de cookies/sesion en:
    - `apps/web/lib/auth/session.ts`
    - `apps/web/app/api/session/role/route.ts`
    - `apps/web/app/api/session/google/start/route.ts`
    - `apps/web/app/api/session/google/callback/route.ts`
    - `apps/web/app/api/session/admin/route.ts`
    - `apps/web/app/api/session/logout/route.ts`
    - `apps/web/app/api/session/me/route.ts`
  - controles:
    - políticas de cookie centralizadas (HttpOnly, SameSite, Priority, Secure contextual por host/protocolo)
    - TTL de sesión configurable con límites (`AUTH_SESSION_TTL_SECONDS`)
    - renovación automática de sesión en ventana de expiración
    - limpieza consistente de cookies de sesión/OAuth/admin
  - tests de regresión:
    - `apps/web/tests/security-session-cookie-hardening.spec.ts`
- `SEC-P1-016` completado el 2026-03-07.
  - security tests de abuso/rate-limit/authz:
    - `apps/web/tests/security-login-rate-limit.spec.ts`
    - `apps/web/tests/security-claim-status-enumeration.spec.ts`
    - `apps/web/tests/security-session-cookie-hardening.spec.ts`
    - `apps/api/src/common/rate-limit/rate-limit.guard.spec.ts`
  - hardening anti-bruteforce aplicado en:
    - `apps/web/app/api/session/role/route.ts`
    - `apps/web/app/api/session/admin/route.ts`
    - `apps/web/app/ingresar/page.tsx` (mensaje UX `rate_limit`)
- `SEC-OPS-017` configurado el 2026-03-07.
  - CI gate SAST (Semgrep) en:
    - `.github/workflows/ci.yml`
- `SEC-OPS-018` configurado el 2026-03-07.
  - CI gate secret scanning (Gitleaks) en:
    - `.github/workflows/ci.yml`
- `SEC-OPS-019` configurado el 2026-03-07.
  - CI gate dependency audit (severidad crítica) en:
    - `.github/workflows/ci.yml`
- `SEC-OPS-020` completado el 2026-03-07.
  - hardening de contexto Docker en:
    - `.dockerignore`
- `SEC-OPS-021` completado el 2026-03-08.
  - auditoría estructurada + redacción PII en:
    - `apps/api/src/common/observability/audit-log.service.ts`
    - `apps/api/src/common/interceptors/request-logging.interceptor.ts`
    - `apps/api/src/common/observability/observability.module.ts`
  - tests unitarios:
    - `apps/api/src/common/observability/audit-log.service.spec.ts`
- `SEC-OPS-022` completado el 2026-03-08.
  - runbook de incidente:
    - `docs/security/runbook-security-incident.md`
  - runbook de rotación de secretos:
    - `docs/security/runbook-secret-rotation.md`
- `SEC-P2-023` completado el 2026-03-08.
  - webhook billing robusto (firma + timestamp + anti-replay) en:
    - `apps/api/src/modules/billing/billing.service.ts`
    - `apps/api/src/common/cache/cache.service.ts`
  - cobertura de tests:
    - `apps/api/src/modules/billing/billing.service.spec.ts`
    - `apps/api/src/common/cache/cache.service.spec.ts`
  - configuración:
    - `.env.example` (`BILLING_WEBHOOK_MAX_AGE_SECONDS`, `BILLING_WEBHOOK_REPLAY_TTL_SECONDS`)
- `SEC-P2-024` completado el 2026-03-08.
  - anti-abuso avanzado en formularios públicos (`leads`, `reviews`, `claim/publish`) con:
    - honeypot
    - velocidad mínima de envío
    - heurísticas anti-spam de contenido
    - rate-limit por IP y por objetivo
  - implementación web:
    - `apps/web/lib/security/public-abuse-protection.ts`
    - `apps/web/app/api/leads/route.ts`
    - `apps/web/app/api/reviews/route.ts`
    - `apps/web/app/api/schools/publish/route.ts`
    - formularios con metadatos anti-bot:
      - `apps/web/components/school/lead-capture-form.tsx`
      - `apps/web/components/sections/review-form.tsx`
      - `apps/web/components/sections/school-publish-form.tsx`
  - refuerzo API:
    - `apps/api/src/modules/leads/leads.controller.ts` (`@RateLimit`)
    - `apps/api/src/modules/reviews/reviews.controller.ts` (`@RateLimit`)
    - `apps/api/src/modules/schools/schools.controller.ts` (`@RateLimit`)
  - tests de seguridad:
    - `apps/web/tests/security-public-form-abuse.spec.ts`
- `GTM-025` completado el 2026-03-08.
  - QA funcional integral en journeys críticos:
    - `search`
    - `login/guardas de sesión`
    - `dashboards (parent/school)`
    - `billing admin`
  - suite E2E dedicada:
    - `apps/web/tests/gtm-functional-integral.spec.ts`
  - documentación de sprint:
    - `docs/sprint-26/qa-architecture.md`
    - `docs/sprint-26/technical-explanation.md`
    - `docs/sprint-26/localhost-runbook.md`
- `GTM-026` completado el 2026-03-08.
  - QA SEO y contenido en landings de ciudad:
    - `apps/web/tests/gtm-seo-city-content.spec.ts`
    - `apps/web/tests/seo.spec.ts`
  - cobertura:
    - sitemap geo (`urlset` y `sitemap index` por chunks)
    - metadata/canonical en landings `/colegios`
    - schema JSON-LD (`BreadcrumbList`, `ItemList`, `FAQPage`)
    - redirect legacy `/colegios-en-[ciudad]`
    - noindex en paginación profunda
  - documentación de sprint:
    - `docs/sprint-27/qa-seo-architecture.md`
    - `docs/sprint-27/technical-explanation.md`
    - `docs/sprint-27/localhost-runbook.md`
- `GTM-027` completado el 2026-03-08.
  - tracking funnel final en Posthog:
    - esquema canónico de eventos funnel (`v1`)
    - enriquecimiento server-side (`funnelStep`, `funnelVersion`)
    - métricas de funnel por `distinctId` y conversiones por etapa en admin analytics
  - implementación:
    - `apps/web/lib/analytics-schema.ts`
    - `apps/web/lib/analytics.ts`
    - `apps/web/app/api/analytics/capture/route.ts`
    - `apps/web/lib/server/analytics-store.ts`
    - `apps/web/app/admin/analytics/page.tsx`
    - instrumentación de hitos:
      - `apps/web/components/search/search-analytics-tracker.tsx`
      - `apps/web/components/school/profile-analytics-tracker.tsx`
      - `apps/web/components/parent/save-school-button.tsx`
      - `apps/web/components/parent/save-comparison-button.tsx`
      - `apps/web/components/school/lead-capture-form.tsx`
  - QA:
    - `apps/web/tests/gtm-posthog-funnel.spec.ts`
    - `apps/web/tests/product-analytics.spec.ts`
  - documentación de sprint:
    - `docs/sprint-28/posthog-funnel-architecture.md`
    - `docs/sprint-28/technical-explanation.md`
    - `docs/sprint-28/localhost-runbook.md`
- `GTM-028` completado el 2026-03-08.
  - smoke post-deploy + tuning observabilidad:
    - script ejecutable: `infra/scripts/smoke-post-deploy.sh`
    - integración CI deploy: `.github/workflows/deploy.yml` (`post-deploy-smoke`)
    - comando repo: `pnpm smoke:post-deploy`
  - cobertura smoke:
    - `GET /v1/health/live`
    - `GET /v1/health/ready`
    - `GET /v1/search/health`
    - `GET /v1/admin/health`
    - `GET /v1/health/metrics` (con admin key)
    - `GET /v1/admin/overview` (con admin key)
    - web critical routes (`/`, `/search`, `/robots.txt`, `/sitemap_index.xml`)
    - `POST /api/analytics/capture`
  - documentación de sprint:
    - `docs/sprint-29/smoke-observability-architecture.md`
    - `docs/sprint-29/technical-explanation.md`
    - `docs/sprint-29/localhost-runbook.md`
- `GTM-029` completado el 2026-03-08.
  - beta privada formalizada con allowlists por rol:
    - `apps/web/lib/beta/private-beta.ts`
    - `apps/web/middleware.ts`
    - `apps/web/lib/auth/api-access.ts`
    - `apps/web/app/api/beta/status/route.ts`
    - `apps/web/app/beta-acceso/page.tsx`
  - cobertura QA:
    - `apps/web/tests/gtm-private-beta-access.spec.ts`
- `GTM-030` completado el 2026-03-08.
  - beta pública controlada con launch mode:
    - `apps/web/lib/beta/launch-mode.ts`
    - `apps/web/lib/beta/private-beta.ts`
    - `apps/web/app/ingresar/page.tsx`
    - `apps/web/tests/gtm-public-beta-access.spec.ts`
  - Go/No-Go operativo en admin:
    - `apps/web/lib/admin/launch-readiness.ts`
    - `apps/web/app/api/admin/launch-readiness/route.ts`
    - `apps/web/app/admin/launch/page.tsx`
    - `apps/web/components/admin/admin-nav.tsx`
  - regresión ejecutada:
    - `apps/web/tests/gtm-functional-integral.spec.ts`
    - `apps/web/tests/product-analytics.spec.ts`
  - documentación de sprint:
    - `docs/sprint-30/launch-gating-architecture.md`
    - `docs/sprint-30/technical-explanation.md`
    - `docs/sprint-30/localhost-runbook.md`
    - `docs/sprint-30/repository-structure.md`
- `POST-GTM-031` completado el 2026-03-08.
  - observabilidad de performance real (RUM Core Web Vitals):
    - `apps/web/components/analytics/web-vitals-tracker.tsx`
    - `apps/web/lib/server/analytics-store.ts`
    - `apps/web/app/admin/analytics/page.tsx`
    - `apps/web/tests/product-analytics.spec.ts`
  - documentación:
    - `docs/sprint-31/rum-web-vitals-architecture.md`
    - `docs/sprint-31/technical-explanation.md`
    - `docs/sprint-31/localhost-runbook.md`
    - `docs/sprint-31/repository-structure.md`
- `POST-GTM-032` completado el 2026-03-08.
  - budgets y alertas automáticas de Core Web Vitals:
    - `apps/web/lib/server/analytics-store.ts`
    - `apps/web/app/admin/analytics/page.tsx`
    - `apps/web/tests/product-analytics.spec.ts`
    - `.env.example`
  - documentación:
    - `docs/sprint-32/performance-budgets-architecture.md`
    - `docs/sprint-32/technical-explanation.md`
    - `docs/sprint-32/localhost-runbook.md`
    - `docs/sprint-32/repository-structure.md`
- `POST-GTM-033` completado el 2026-03-08.
  - alerting accionable de performance (Slack/email webhook + dedupe):
    - `apps/web/lib/server/performance-alerting.ts`
    - `apps/web/app/api/analytics/capture/route.ts`
    - `apps/web/app/admin/analytics/page.tsx`
    - `apps/web/lib/admin/launch-readiness.ts`
    - `.env.example`
  - QA:
    - `apps/web/tests/product-analytics.spec.ts`
  - documentación:
    - `docs/sprint-33/performance-alerting-architecture.md`
    - `docs/sprint-33/technical-explanation.md`
    - `docs/sprint-33/localhost-runbook.md`
    - `docs/sprint-33/repository-structure.md`

## 7. Decision gates

- Gate 1 (fin semana 1): P0 cerrados o no se continua GTM.
- Gate 2 (fin semana 2): P1 criticos cerrados.
- Gate 3 (fin semana 3): CI AppSec obligatorio activo.
- Gate 4 (dia 30): salida controlada solo con evidencia de estabilidad y seguridad.
