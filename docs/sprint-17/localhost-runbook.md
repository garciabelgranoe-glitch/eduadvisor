# Sprint 17 - Localhost Runbook

## Variables recomendadas

```bash
AUTH_SESSION_SECRET=dev-auth-session-secret
AUTH_PARENT_ACCESS_CODE=
AUTH_SCHOOL_ACCESS_CODE=
AUTH_ALLOW_UNCLAIMED_SCHOOL_LOGIN=false
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=
```

## Preparacion base

```bash
docker compose -f infra/docker-compose.local.yml up -d
corepack pnpm --filter @eduadvisor/database prisma:migrate
corepack pnpm --filter @eduadvisor/database prisma:seed
corepack pnpm --filter @eduadvisor/api prisma:generate
```

## Run

```bash
corepack pnpm --filter @eduadvisor/api dev
corepack pnpm --filter @eduadvisor/web dev:clean
```

## Smoke tests

```bash
curl -H "x-admin-key: dev-admin-key" http://localhost:4000/v1/health/live

curl -X POST http://localhost:3000/api/session/role \
  -H "content-type: application/json" \
  -d '{"role":"PARENT","email":"familia@ejemplo.com"}' -i
```

Validar estado de claim institucional:

```bash
curl -H "x-admin-key: dev-admin-key" \
  "http://localhost:4000/v1/auth/school-claim-status?email=colegio@ejemplo.com&schoolSlug=colegio-ejemplo"
```

Flujos UI:

- `http://localhost:3000/ingresar`
- `http://localhost:3000/parent-dashboard`
- `http://localhost:3000/school-dashboard`
