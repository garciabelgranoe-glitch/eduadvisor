# Sprint 22 - Localhost Runbook

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

## 4) Recompute embudo de crecimiento

```bash
curl -X POST \
  -H "x-admin-key: dev-admin-key" \
  -H "content-type: application/json" \
  -d '{"windowDays":30}' \
  http://localhost:4000/v1/admin/growth-funnel/recompute
```

## 5) Consultar embudo

```bash
curl -H "x-admin-key: dev-admin-key" \
  "http://localhost:4000/v1/admin/growth-funnel?windowDays=30&trendDays=14"
```

## 6) Validar UI admin

1. abrir `/ingresar?admin=1&next=/admin/analytics` e iniciar con Google (admin) o fallback local de desarrollo.
2. verificar bloques:
   - etapas de funnel
   - conversiones por etapa
   - drop-offs y recomendaciones

## 7) Validar UI padres

1. iniciar sesión como padre
2. abrir `/parent-dashboard`
3. verificar bloque `Siguiente paso` con CTA contextual
