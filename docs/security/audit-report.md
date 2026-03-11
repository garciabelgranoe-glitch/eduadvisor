# Auditoria de Seguridad Tecnica

Fecha de auditoria: 7 de marzo de 2026
Alcance: `apps/web` (Next.js 14 App Router), `apps/api` (NestJS), `packages/database` (Prisma/Postgres), CI/CD y configuracion base.
Modalidad: analisis estatico de codigo y configuracion, sin cambios funcionales ni ejecucion de pentest dinamico.

## 1. Resumen ejecutivo

El estado actual muestra avances en validacion de input (DTO + `ValidationPipe`) y una sesion firmada para usuarios en web. Sin embargo, la postura sigue siendo insuficiente para salida a produccion por tres motivos principales:

1. Existen `route handlers` sensibles en Next que proxyfian acciones de alto privilegio con `ADMIN_API_KEY` sin control de sesion/rol.
2. El acceso admin web depende de un secreto estatico (`adminToken`) en query/cookie.
3. Persisten fallbacks inseguros de secretos (`dev-admin-key`, `dev-auth-session-secret`).

Conclusion: **No Go-Live** hasta cerrar todos los riesgos `P0` y la mayoria de `P1`.

## 2. Superficie de ataque (attack surface map)

### 2.1 Activos criticos

- PII de leads y claims: nombre, email, telefono, edad de hijo.
- Privilegios de admin/plataforma para moderacion, estados, billing y claims.
- Sesiones y cookies de usuario/admin.
- Secretos de backend y despliegue (`ADMIN_API_KEY`, secrets OAuth/billing/webhook, DB URL).
- Datos financieros (suscripciones, eventos de cobro, facturas).

### 2.2 Actores

- Visitante anonimo.
- Padre autenticado.
- Representante/colegio autenticado.
- Admin plataforma.
- Atacante externo (spam, scraping, abuso de endpoints, escalacion de privilegios).

### 2.3 Entradas y fronteras de confianza

- Navegador -> Next `app/api/*` (BFF).
- Next server -> Nest API (`x-admin-key` en multiples proxies).
- Nest API -> Postgres/Redis/Meilisearch.
- Proveedores externos -> webhooks billing.
- CI/CD -> pipelines de build/deploy.

### 2.4 Endpoints de alto riesgo identificados

- Proxies admin sin verificacion de sesion:
  - `/app/api/admin/schools/status`
  - `/app/api/admin/claim-requests/status`
  - `/app/api/admin/subscriptions/status`
  - `/app/api/admin/billing/*`
- Proxies de colegio/reviews/leads export sin verificacion de sesion:
  - `/app/api/schools/profile`
  - `/app/api/schools/leads-export`
  - `/app/api/reviews/respond`
  - `/app/api/reviews/moderate`
  - `/app/api/leads/status`
- Acceso admin por query token:
  - `middleware` con `adminToken` y cookie `eduadmin_session`.

## 3. Top 10 riesgos priorizados

## P0-1: Proxies admin en Next sin autenticacion/autorizacion de sesion

- Riesgo: un atacante puede invocar endpoints `app/api/admin/*` que internamente reenvian con `x-admin-key`.
- Impacto: cambios de estado de colegios, claims, suscripciones y operaciones billing.
- Evidencia:
  - `apps/web/app/api/admin/schools/status/route.ts:6`
  - `apps/web/app/api/admin/claim-requests/status/route.ts:6`
  - `apps/web/app/api/admin/subscriptions/status/route.ts:6`
  - `apps/web/app/api/admin/billing/checkout/route.ts:6`

## P0-2: Proxies sensibles de colegio sin control de ownership

- Riesgo: acciones sobre perfil, export de leads y respuestas/moderacion de reviews sin validar que el actor sea duenio/rol valido.
- Impacto: exposicion de PII, manipulacion de datos de colegios, abuso reputacional.
- Evidencia:
  - `apps/web/app/api/schools/profile/route.ts:7`
  - `apps/web/app/api/schools/leads-export/route.ts:19`
  - `apps/web/app/api/reviews/respond/route.ts:6`
  - `apps/web/app/api/reviews/moderate/route.ts:6`
  - `apps/web/app/api/leads/status/route.ts:7`

## P0-3: Acceso admin por secreto estatico en URL/cookie

- Riesgo: `adminToken` en query puede filtrarse por logs, historial, herramientas de terceros o captura de trafico.
- Impacto: toma de sesion admin web.
- Evidencia:
  - `apps/web/middleware.ts:125`
  - `apps/web/middleware.ts:131`

## P0-4: Fallbacks inseguros de secretos

- Riesgo: cuando falta configuracion, se habilitan secretos conocidos.
- Impacto: elevacion de privilegios en entornos mal configurados.
- Evidencia:
  - `apps/api/src/common/guards/admin-api-key.guard.ts:40`
  - `apps/web/lib/auth/session.ts:39`
  - `apps/web/app/api/session/role/route.ts:195`

## P1-1: Endpoint de estado de claim expuesto para enumeracion

- Riesgo: consulta de estado por `email + schoolSlug` sin sesion.
- Impacto: fuga de metadata operativa/comercial, ayuda a ataques de phishing social.
- Evidencia:
  - `apps/web/app/api/session/school-claim-status/route.ts:48`
  - `apps/web/app/api/session/school-claim-status/route.ts:62`

## P1-2: Rate limiting no distribuido y facil de evadir

- Riesgo: limiter en memoria por proceso, sin coordinacion horizontal.
- Impacto: bypass en despliegues multi-instancia, proteccion debil contra abuso.
- Evidencia:
  - `apps/api/src/common/rate-limit/rate-limit.service.ts:18`
  - `apps/api/src/common/rate-limit/rate-limit.guard.ts:85`

## P1-3: Hardening HTTP incompleto (headers/CSP/HSTS)

- Riesgo: falta de politicas estrictas de cabeceras.
- Impacto: mayor exposicion a XSS, clickjacking, downgrade y fugas por referrer.
- Evidencia:
  - `apps/web/next.config.mjs:1`
  - `apps/api/src/main.ts:10`

## P1-4: CI sin controles de seguridad obligatorios

- Riesgo: no hay SAST/secret scanning/dependency scanning como gate.
- Impacto: regresiones de seguridad llegan a main/deploy.
- Evidencia:
  - `.github/workflows/ci.yml:27`
  - `apps/api/package.json:10` (`lint` placeholder)

## P1-5: `.dockerignore` no excluye `.env`

- Riesgo: inclusion accidental de `.env` en contexto de build/container.
- Impacto: exposicion de secretos en imagen o capas de build.
- Evidencia:
  - `.dockerignore:1`

## P2-1: Verificacion webhook basada en secreto plano en header

- Riesgo: modelo de verificacion simplificado (comparacion directa).
- Impacto: menor robustez frente a replay/forja si hay leak del secreto.
- Evidencia:
  - `apps/api/src/modules/billing/billing.service.ts:1076`

## 4. Controles existentes (positivos)

- Validacion DTO + `ValidationPipe` global:
  - `apps/api/src/main.ts:15`
- Scope de llaves admin (`read`/`write`):
  - `apps/api/src/common/guards/admin-api-key.guard.ts:18`
- Sesion firmada en web para parent/school:
  - `apps/web/lib/auth/session.ts:187`
  - `apps/web/lib/auth/session.ts:198`
- Sanitizacion basica de `next` path para redirecciones:
  - `apps/web/app/api/session/role/route.ts:27`

Estos controles son necesarios pero no suficientes para baseline de produccion.

## 5. Roadmap de hardening (2 semanas)

### Semana 1 (cerrar P0)

1. Reemplazar acceso admin por query token con auth real de usuarios admin (sin secreto compartido en URL/cookie).
2. Poner guard de sesion + RBAC en **todos** los handlers `app/api/admin/*`, `app/api/schools/*` sensibles y `app/api/reviews/*` sensibles.
3. Eliminar fallbacks `dev-*` para secretos en runtime productivo; fail-fast si faltan envs criticas.
4. Implementar ownership checks estrictos (school scope) para operaciones de colegio y PII.
5. Mover throttling a Redis/distribuido y reglas especificas por endpoint de alto riesgo.

### Semana 2 (P1 + gates de lanzamiento)

1. Hardening HTTP: CSP estricta, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
2. Anti-abuso avanzado: captcha/challenge en `leads`, `reviews`, `claim`; verificacion email/telefono para claim.
3. CI security gates: SAST (semgrep), secret scanning, dependency audit + politica de severidad.
4. Logging/auditoria: trazabilidad de actor, accion, recurso, resultado; redaccion de PII en logs.
5. Preparar checklist Launch Gate (go/no-go) y plan de respuesta a incidentes.

## 6. Criterio de salida a produccion

Minimo obligatorio:

1. Todos los P0 cerrados y testeados automaticamente.
2. P1 criticos (headers, CI security gates, rate limiting distribuido) cerrados.
3. Evidencia de pruebas de seguridad repetibles en CI.
4. Runbooks de incidente y rotacion de secretos aprobados.

Estado actual: **NO APTO para lanzamiento productivo**.

