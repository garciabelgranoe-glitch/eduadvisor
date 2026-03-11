# Sprint 20 - Localhost Runbook

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

## 4) Validar alertas en dashboard de padre

1. iniciar sesión como padre
2. abrir `/parent-dashboard`
3. revisar bloque `Alertas`
4. usar `Marcar leída` y confirmar actualización de contador

## 5) Validar endpoints de alertas (opcional)

```bash
curl -H "x-admin-key: dev-admin-key" \
  "http://localhost:4000/v1/parents/<USER_ID>/alerts"
```
