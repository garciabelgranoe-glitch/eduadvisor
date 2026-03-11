# Sprint 12 - Producción Architecture

## 1) Arquitectura técnica

Sprint 12 prepara EduAdvisor para operación productiva con foco en confiabilidad operativa.

### CI/CD

- CI reforzado con jobs separados de `quality` y `build` en GitHub Actions.
- Deploy automático en `main` mediante deploy hooks:
  - frontend (Vercel),
  - backend (Railway/Fly compatible por webhook).

### Monitoring y logs

- Interceptor global de logging HTTP en API con:
  - `requestId` (header `x-request-id`),
  - método, path, statusCode,
  - latencia (`durationMs`),
  - logging de errores por request.
- Health endpoints operativos:
  - `GET /v1/health/live`
  - `GET /v1/health/ready`
- Readiness valida dependencias críticas:
  - PostgreSQL (query `SELECT 1`),
  - estado de motor de búsqueda (Meilisearch).

### Backup y restore

- Script de backup PostgreSQL en formato custom (`pg_dump`):
  - `infra/scripts/backup-postgres.sh`
- Script de restore (`pg_restore`):
  - `infra/scripts/restore-postgres.sh`
- Workflow diario programado `DB Backup` para generar artefacto desde `PRODUCTION_DATABASE_URL`.

### Deploy containers

- Dockerfiles productivos para:
  - `apps/api/Dockerfile`
  - `apps/web/Dockerfile`
- `.dockerignore` para minimizar contexto y ruido de build.

## 2) Seguridad y resiliencia

- `app.enableShutdownHooks()` para apagado controlado.
- `keepAliveTimeout` y `headersTimeout` configurados para comportamiento estable detrás de proxies.
- Logging con correlación por request para troubleshooting rápido.
