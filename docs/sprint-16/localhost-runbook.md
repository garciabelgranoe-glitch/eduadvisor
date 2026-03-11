# Sprint 16 - Localhost Runbook

## Variables recomendadas

```bash
ADMIN_API_KEY=dev-admin-key
RATE_LIMIT_MAX_REQUESTS=120
RATE_LIMIT_WINDOW_MS=60000
```

## Validación rápida

```bash
corepack pnpm --filter @eduadvisor/api test
corepack pnpm --filter @eduadvisor/api build
```

## Probar endpoint de métricas

```bash
curl -H "x-admin-key: dev-admin-key" http://localhost:4000/v1/health/metrics
```

## Probar `reindex` protegido

```bash
curl -X POST -H "x-admin-key: dev-admin-key" http://localhost:4000/v1/search/reindex
```
