# Sprint 12 - CI/CD Runbook

## 1) CI

Archivo: `.github/workflows/ci.yml`

- Trigger: `push` (`main`, `develop`), `pull_request`, `workflow_dispatch`.
- Jobs:
  - `quality`: install + lint + test
  - `build`: prisma generate + build

## 2) Deploy

Archivo: `.github/workflows/deploy.yml`

- Trigger: `push` a `main` y manual.
- Deploy web: `VERCEL_DEPLOY_HOOK_URL`
- Deploy API: `RAILWAY_DEPLOY_HOOK_URL`

Si un secret no está presente, el job se omite sin romper pipeline.

## 3) Secrets requeridos

- `VERCEL_DEPLOY_HOOK_URL`
- `RAILWAY_DEPLOY_HOOK_URL`
- `PRODUCTION_DATABASE_URL` (para backup)

## 4) Ejecución manual

- Desde GitHub Actions:
  - `CI` (workflow_dispatch)
  - `Deploy` (workflow_dispatch)
  - `DB Backup` (workflow_dispatch)
