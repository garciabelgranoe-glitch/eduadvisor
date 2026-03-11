# EDUADVISOR

Plataforma de búsqueda, comparación y evaluación de colegios privados en Latinoamérica.

## Monorepo

- `apps/web`: Frontend Next.js 14 (App Router)
- `apps/api`: Backend NestJS
- `packages/database`: Prisma schema y migraciones
- `packages/shared`: Tipos y contratos compartidos
- `infra`: Infraestructura local (Postgres, Redis, Meilisearch)
- `docs/sprint-1`: Arquitectura técnica de Sprint 1
- `docs/sprint-14`: Arquitectura de caching e invalidación
- `docs/sprint-15`: Calidad y confiabilidad (tests + hardening local)
- `docs/sprint-16`: Seguridad y observabilidad (rate limit + RBAC + metrics)
- `docs/sprint-17`: Identity & session hardening (auth + scope por colegio)
- `docs/sprint-18`: Parent favorites (saved schools + dashboard real)
- `docs/sprint-19`: Parent persistent comparisons
- `docs/sprint-20`: Parent alerts y engagement loops base
- `docs/sprint-21`: Event engine y alertas automáticas por cambios de producto
- `docs/sprint-22`: Growth funnel y activación de conversión
- `docs/sprint-23`: Monetización B2B (suscripciones premium + entitlements)
- `docs/sprint-24`: Billing transaccional agnóstico (checkout + invoice ledger + webhooks)

## Quickstart

```bash
cp .env.example .env
docker compose -f infra/docker-compose.local.yml up -d
pnpm install
pnpm --filter @eduadvisor/database prisma:migrate
pnpm --filter @eduadvisor/database prisma:seed
pnpm --filter @eduadvisor/api prisma:generate
pnpm dev
```

Si prefieres correr por Turbo:

```bash
pnpm dev:turbo
```

## Core backend (Sprint 3)

Endpoints disponibles en `http://localhost:4000/v1`:

- `GET /schools`
- `GET /schools/seo/cities`
- `GET /schools/seo/cities/:citySlug`
- `GET /schools/seo/sitemap`
- `GET /schools/:slug`
- `POST /reviews`
- `POST /leads`
- `POST /schools/claim-requests`
- `GET /search`
- `GET /search/health`
- `POST /search/reindex` (requiere `x-admin-key`, scope `write`)
- `GET /matches`
- `POST /matches/recommend`
- `GET /rankings`
- `GET /market-insights`
- `POST /market-insights/recompute` (requiere `x-admin-key`)
- `GET /schools/id/:schoolId/dashboard` (requiere `x-admin-key`)
- `PATCH /schools/id/:schoolId/profile` (requiere `x-admin-key`)
- `GET /admin/overview` (requiere `x-admin-key`)
- `GET /admin/schools` (requiere `x-admin-key`)
- `GET /admin/product-events` (requiere `x-admin-key`, scope `read`)
- `GET /admin/growth-funnel` (requiere `x-admin-key`, scope `read`)
- `POST /admin/growth-funnel/recompute` (requiere `x-admin-key`, scope `write`)
- `PATCH /admin/schools/:schoolId/status` (requiere `x-admin-key`)
- `PATCH /admin/schools/:schoolId/subscription` (requiere `x-admin-key`, scope `write`)
- `GET /admin/billing/overview` (requiere `x-admin-key`, scope `read`)
- `GET /admin/billing/invoices` (requiere `x-admin-key`, scope `read`)
- `GET /admin/billing/webhook-events` (requiere `x-admin-key`, scope `read`)
- `GET /admin/billing/checkout-sessions/:sessionId` (requiere `x-admin-key`, scope `read`)
- `POST /admin/billing/checkout-sessions` (requiere `x-admin-key`, scope `write`)
- `POST /admin/billing/events/simulate` (requiere `x-admin-key`, scope `write`)
- `GET /admin/claim-requests` (requiere `x-admin-key`)
- `PATCH /admin/claim-requests/:claimRequestId/status` (requiere `x-admin-key`)
- `POST /admin/import-runs` (requiere `x-admin-key`)
- `GET /admin/import-runs` (requiere `x-admin-key`)
- `GET /admin/import-runs/:runId` (requiere `x-admin-key`)
- `GET /reviews/school/:schoolId`
- `GET /reviews/moderation/queue` (requiere `x-admin-key`)
- `PATCH /reviews/:reviewId/moderate` (requiere `x-admin-key`)
- `GET /leads/school/:schoolId` (requiere `x-admin-key`)
- `GET /leads/school/:schoolId/summary` (requiere `x-admin-key`)
- `PATCH /leads/:leadId/status` (requiere `x-admin-key`)
- `GET /schools/id/:schoolId/billing` (requiere `x-admin-key`, scope `read`)
- `GET /schools/id/:schoolId/leads/export` (requiere `x-admin-key`, scope `read`, premium requerido)
- `POST /billing/webhooks/:provider` (ingesta de webhooks de provider)
- `GET /parents/:userId/dashboard` (requiere `x-admin-key`, scope `read`)
- `GET /parents/:userId/saved-schools` (requiere `x-admin-key`, scope `read`)
- `POST /parents/:userId/saved-schools` (requiere `x-admin-key`, scope `write`)
- `DELETE /parents/:userId/saved-schools/:schoolId` (requiere `x-admin-key`, scope `write`)
- `GET /parents/:userId/comparisons` (requiere `x-admin-key`, scope `read`)
- `POST /parents/:userId/comparisons` (requiere `x-admin-key`, scope `write`)
- `DELETE /parents/:userId/comparisons/:comparisonId` (requiere `x-admin-key`, scope `write`)
- `GET /parents/:userId/alerts` (requiere `x-admin-key`, scope `read`)
- `POST /parents/:userId/alerts/:alertId/read` (requiere `x-admin-key`, scope `write`)
- `GET /health/live`
- `GET /health/ready`
- `GET /health/metrics` (requiere `x-admin-key` con scope `read`)

Caching backend (Sprint 14):

- cache read-through en `search`, `schools`, `rankings`, `market-insights`
- invalidación por namespace en writes (`leads`, `reviews`, `school profile`, `reindex`)
- Redis first con fallback in-memory

Quality & Reliability (Sprint 15):

- tests Jest para `cache`, `search`, `leads`, `reviews`
- script `dev:clean` en web para resetear `.next`
- `web start` forzado en `NODE_ENV=production`

Security & Observability (Sprint 16):

- rate limiting global (`RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_MS`)
- scopes admin por API key (`read` / `write`)
- endpoint de métricas operativas `GET /health/metrics`
- `POST /search/reindex` ahora protegido por `x-admin-key` (`write`)

Acceso UI admin (web):

- no aparece en navegación pública ni en `/ingresar`
- acceso por URL privada: `/admin?adminToken=<ADMIN_CONSOLE_TOKEN>`
- luego de validar token, se crea cookie de sesión admin (12h)

Identity & Session (Sprint 17):

- nuevo endpoint backend: `POST /auth/session` (admin scope `write`)
- sesión web firmada con `AUTH_SESSION_SECRET` (`eduadvisor_session`)
- `GET /api/session/me` expone identidad real (`email`, `appRole`, `schoolSlug`)
- middleware RBAC estricto:
  - `parent-dashboard` requiere rol `PARENT`
  - `school-dashboard` requiere rol `SCHOOL_ADMIN` + scope `schoolSlug`
- `/ingresar`:
  - familias: acceso con Google OAuth
  - colegios: acceso solo para cuentas verificadas con claim aprobado

Variables nuevas recomendadas:

- `AUTH_SESSION_SECRET`
- `AUTH_PARENT_ACCESS_CODE` (opcional)
- `AUTH_SCHOOL_ACCESS_CODE` (opcional)
- `AUTH_ALLOW_UNCLAIMED_SCHOOL_LOGIN=false` (mantener desactivado en producción)
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI` (opcional, default `/api/session/google/callback`)

Parent Favorites (Sprint 18):

- nuevo modelo persistente `SavedSchool` para shortlist por familia
- botón `Guardar` en cards y perfil de colegio
- `parent-dashboard` conectado a backend real (`/v1/parents/:userId/dashboard`)

Parent Comparisons (Sprint 19):

- nuevo modelo `SavedComparison` para guardar comparaciones (2-3 colegios)
- botón `Guardar comparación` en `/compare/[ids]`
- dashboard con bloque de comparaciones reusables

Parent Alerts (Sprint 20):

- nuevo modelo `ParentAlert` para alertas persistentes
- endpoints `GET /v1/parents/:userId/alerts` y `POST /v1/parents/:userId/alerts/:alertId/read`
- panel de alertas en `parent-dashboard` con acción `Marcar leída`

Event Engine (Sprint 21):

- nuevo modelo `ProductEvent` con `dedupeKey` único y trazabilidad
- motor central `ProductEventsService` para fan-out de alertas a familias por `SavedSchool`
- triggers automáticos:
  - reviews moderadas a `APPROVED`
  - actualización de perfil de colegio
  - cambios significativos de EduAdvisor Score en recompute diario
- endpoint admin de auditoría: `GET /v1/admin/product-events`

Variables nuevas recomendadas:

- `PARENT_ALERT_SCORE_DELTA_THRESHOLD=4`

Growth Funnel (Sprint 22):

- nuevo modelo `GrowthFunnelSnapshot` para tendencia de conversión por etapas
- endpoints admin:
  - `GET /v1/admin/growth-funnel`
  - `POST /v1/admin/growth-funnel/recompute`
- `admin/analytics` ahora muestra etapas, conversiones, drop-offs y recomendaciones
- `parent-dashboard` ahora incluye `nextAction` (siguiente mejor paso de activación)

Monetización B2B (Sprint 23):

- endpoint admin de suscripciones: `PATCH /v1/admin/schools/:schoolId/subscription`
- dashboard de colegio con bloque de plan comercial y entitlements
- export CSV de leads con gating premium (`/v1/schools/id/:schoolId/leads/export`)
- endpoint de billing por colegio (`/v1/schools/id/:schoolId/billing`)
- regla de estado comercial:
  - `ACTIVE`/`TRIAL` => `PREMIUM`
  - `CANCELED`/`PAST_DUE`/`EXPIRED` => downgrade automático a `VERIFIED`

Billing Transaccional (Sprint 24):

- módulo `Billing` con entidades:
  - checkout sessions
  - invoices
  - webhook events
  - billing customers
- endpoint público de webhooks por provider (`/v1/billing/webhooks/:provider`)
- simulador admin para probar eventos sin gateway real (`/v1/admin/billing/events/simulate`)
- panel operativo en `/admin/billing` con KPIs, ledger y auditoría de webhooks
- checkout demo interno en `/checkout/[sessionId]`

## Frontend core (Sprint 5)

Páginas conectadas al backend real:

- `/`
- `/search`
- `/school/[slug]`
- `/colegios-en-[ciudad]` (ejemplo: `/colegios-en-longchamps`)
- `/compare`
- `/school-dashboard` (edición de perfil + estadísticas + pipeline)
- `/admin`
- `/admin/schools`
- `/admin/reviews`
- `/admin/billing`
- `/admin/analytics`
- `/checkout/[sessionId]`

Para cargar datos de Argentina:

```bash
pnpm --filter @eduadvisor/database exec prisma db push --schema prisma/schema.prisma --accept-data-loss
pnpm --filter @eduadvisor/database prisma:seed
```

Para reconstruir índice de búsqueda:

```bash
curl -X POST \
  -H "x-admin-key: dev-admin-key" \
  http://localhost:4000/v1/search/reindex
```

Ejecutar importación de catálogo (fixture fallback de Google Places):

```bash
# Requiere GOOGLE_PLACES_API_KEY en .env
curl -X POST \
  -H "x-admin-key: dev-admin-key" \
  -H "content-type: application/json" \
  -d '{"source":"GOOGLE_PLACES","countryCode":"AR","province":"Mendoza","city":"Mendoza","maxPages":3,"fetchDetails":true}' \
  http://localhost:4000/v1/admin/import-runs
```

Fallback local (solo si se desea explícitamente):

```bash
curl -X POST \
  -H "x-admin-key: dev-admin-key" \
  -H "content-type: application/json" \
  -d '{"source":"GOOGLE_PLACES","countryCode":"AR","province":"Mendoza","city":"Mendoza","useFixtureFallback":true}' \
  http://localhost:4000/v1/admin/import-runs
```

Script para importar 15 ciudades grandes de Argentina:

```bash
bash infra/scripts/import-google-schools-ar.sh
```

Parámetros útiles:

```bash
IMPORT_MAX_PAGES=2 RUN_REINDEX=true bash infra/scripts/import-google-schools-ar.sh
DRY_RUN=true bash infra/scripts/import-google-schools-ar.sh
```

Google Maps Embed (frontend):

```bash
# Recomendado: key separada para navegador con API restringida a Maps Embed
NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY=tu_key
```

Moderación de reviews (ejemplo):

```bash
curl -H "x-admin-key: dev-admin-key" "http://localhost:4000/v1/reviews/moderation/queue?status=PENDING"
```

Servicios esperados:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## Producción (Sprint 12)

Workflows:

- `CI`: `.github/workflows/ci.yml`
- `Deploy`: `.github/workflows/deploy.yml` (hooks Vercel/Railway vía secrets)
- `DB Backup`: `.github/workflows/db-backup.yml` (diario + manual)

Secrets recomendados:

- `VERCEL_DEPLOY_HOOK_URL`
- `RAILWAY_DEPLOY_HOOK_URL`
- `PRODUCTION_DATABASE_URL`

Backups manuales:

```bash
DATABASE_URL=postgresql://... pnpm backup:db
DATABASE_URL=postgresql://... pnpm restore:db -- ./artifacts/backups/eduadvisor_<timestamp>.dump
```

Health checks:

```bash
curl http://localhost:4000/v1/health/live
curl http://localhost:4000/v1/health/ready
```
