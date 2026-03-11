# Sprint 23 - Localhost Runbook

## 1) Infra local

```bash
docker compose -f infra/docker-compose.local.yml up -d
```

## 2) Levantar API y Web

```bash
corepack pnpm dev
```

Servicios:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## 3) Activar premium para un colegio (admin)

```bash
curl -X PATCH \
  -H "x-admin-key: dev-admin-key" \
  -H "content-type: application/json" \
  -d '{"status":"ACTIVE","planCode":"premium","priceMonthly":99000,"durationMonths":12}' \
  http://localhost:4000/v1/admin/schools/<SCHOOL_ID>/subscription
```

## 4) Verificar billing y entitlements

```bash
curl -H "x-admin-key: dev-admin-key" \
  http://localhost:4000/v1/schools/id/<SCHOOL_ID>/billing
```

## 5) Exportar leads CSV (premium)

```bash
curl -H "x-admin-key: dev-admin-key" \
  http://localhost:4000/v1/schools/id/<SCHOOL_ID>/leads/export
```

## 6) Validar UI

1. abrir `/ingresar?admin=1&next=/admin/schools` e iniciar con Google (admin) o fallback local de desarrollo.
2. abrir `/school-dashboard?school=<slug>` para ver tarjeta de plan y botón `Exportar leads CSV`.
3. si no está premium, debe verse upsell de upgrade.
