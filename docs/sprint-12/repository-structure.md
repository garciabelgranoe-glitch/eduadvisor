# Sprint 12 - Estructura de carpetas (Producción)

```text
.github/workflows/
  ci.yml
  deploy.yml
  db-backup.yml

apps/api/
  Dockerfile
  src/common/interceptors/
    request-logging.interceptor.ts
  src/health/
    health.controller.ts
    health.module.ts
    health.service.ts
  src/modules/search/
    search.module.ts
  src/main.ts

apps/web/
  Dockerfile

infra/scripts/
  backup-postgres.sh
  restore-postgres.sh

.
  .dockerignore
  package.json
  README.md

docs/sprint-12/
  production-architecture.md
  repository-structure.md
  ci-cd-runbook.md
  backup-runbook.md
  technical-explanation.md
```
