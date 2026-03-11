# Sprint 13 - Runbook localhost

## Variables mínimas

```bash
API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_API_KEY=dev-admin-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/eduadvisor
```

## URLs frontend

- `http://localhost:3000/rankings`
- `http://localhost:3000/market-insights`

## Validación API

```bash
curl "http://localhost:4000/v1/rankings?country=AR&limit=10"

curl "http://localhost:4000/v1/market-insights?country=AR&windowDays=30&topLimit=5"

curl -X POST \
  -H "x-admin-key: dev-admin-key" \
  "http://localhost:4000/v1/market-insights/recompute"
```

## Validación técnica

```bash
corepack pnpm --filter @eduadvisor/api build
corepack pnpm --filter @eduadvisor/web lint
corepack pnpm --filter @eduadvisor/web build
```
