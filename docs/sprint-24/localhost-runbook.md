# Sprint 24 - Localhost Runbook

## 1) Levantar dependencias

```bash
docker compose -f infra/docker-compose.local.yml up -d
```

## 2) Sincronizar schema + seed

```bash
corepack pnpm --filter @eduadvisor/database exec prisma db push --schema prisma/schema.prisma
corepack pnpm --filter @eduadvisor/database prisma:seed
corepack pnpm --filter @eduadvisor/api prisma:generate
```

## 3) Ejecutar plataforma

```bash
corepack pnpm dev
```

URLs:

- web: `http://localhost:3000`
- api: `http://localhost:4000`

## 4) Validar Sprint 24

- Admin billing: `http://localhost:3000/admin/billing?adminToken=dev-admin-console`
- Checkout demo: crear sesión desde admin o desde school dashboard no premium.
- Simulación rápida por API:

```bash
curl -X POST http://localhost:4000/v1/admin/billing/events/simulate \
  -H "x-admin-key: dev-admin-key" \
  -H "content-type: application/json" \
  -d '{"provider":"MANUAL","eventType":"invoice.paid","schoolId":"<schoolId>"}'
```

## Variables nuevas

- `BILLING_WEBHOOK_SECRET`
- `BILLING_WEBHOOK_SECRET_STRIPE`
- `BILLING_WEBHOOK_SECRET_MERCADO_PAGO`

