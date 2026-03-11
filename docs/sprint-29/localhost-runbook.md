# Sprint 29 - Localhost Runbook (GTM-028)

## Ejecutar smoke manual

```bash
SMOKE_WEB_BASE_URL=http://localhost:3000 \
SMOKE_API_BASE_URL=http://localhost:4000 \
SMOKE_ADMIN_READ_API_KEY=$ADMIN_READ_API_KEY \
bash infra/scripts/smoke-post-deploy.sh
```

También disponible vía script:

```bash
SMOKE_WEB_BASE_URL=http://localhost:3000 \
SMOKE_API_BASE_URL=http://localhost:4000 \
SMOKE_ADMIN_READ_API_KEY=$ADMIN_READ_API_KEY \
corepack pnpm smoke:post-deploy
```

## Variables opcionales

- `SMOKE_RETRY_ATTEMPTS` (default: `20`)
- `SMOKE_RETRY_SLEEP_SECONDS` (default: `10`)
- `SMOKE_CURL_TIMEOUT_SECONDS` (default: `20`)

## Variables usadas en CI deploy

- `PRODUCTION_WEB_URL`
- `PRODUCTION_API_URL`
- `PRODUCTION_ADMIN_READ_API_KEY` (opcional)

Si no hay `PRODUCTION_WEB_URL` o `PRODUCTION_API_URL`, el job `post-deploy-smoke` se omite.
