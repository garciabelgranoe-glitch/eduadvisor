# Sprint 21 - Localhost Runbook

## 1) Infra local

```bash
docker compose -f infra/docker-compose.local.yml up -d
```

## 2) Sincronizar DB + seed

```bash
set -a; source .env; set +a
corepack pnpm --filter @eduadvisor/database exec prisma db push --schema prisma/schema.prisma
corepack pnpm --filter @eduadvisor/database prisma:seed
```

## 3) Levantar API y Web

```bash
corepack pnpm dev
```

Servicios:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## 4) Validar trigger de review aprobada

1. crear una review `PENDING` desde UI/API.
2. moderar a `APPROVED`:

```bash
curl -X PATCH \
  -H "x-admin-key: dev-admin-key" \
  -H "content-type: application/json" \
  -d '{"status":"APPROVED"}' \
  http://localhost:4000/v1/reviews/<REVIEW_ID>/moderate
```

## 5) Validar trigger de actualización de perfil

```bash
curl -X PATCH \
  -H "x-admin-key: dev-admin-key" \
  -H "content-type: application/json" \
  -d '{"monthlyFeeEstimate":260000,"description":"Perfil actualizado para Sprint 21"}' \
  http://localhost:4000/v1/schools/id/<SCHOOL_ID>/profile
```

## 6) Validar trigger de score change

```bash
curl -X POST \
  -H "x-admin-key: dev-admin-key" \
  http://localhost:4000/v1/market-insights/recompute
```

## 7) Auditar eventos emitidos

```bash
curl -H "x-admin-key: dev-admin-key" \
  "http://localhost:4000/v1/admin/product-events?limit=20"
```

## 8) Ver alertas en dashboard padre

1. iniciar sesión como padre
2. abrir `/parent-dashboard`
3. revisar bloque `Alertas` para notificaciones automáticas nuevas
