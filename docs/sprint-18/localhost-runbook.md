# Sprint 18 - Localhost Runbook

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

## 4) Validar favoritos

1. iniciar sesión como padre
2. ir a `/search` o a un perfil de colegio
3. usar botón `Guardar`
4. abrir `/parent-dashboard` y verificar lista real de favoritos

## 5) Validar endpoint backend (opcional)

```bash
curl -H "x-admin-key: dev-admin-key" \
  "http://localhost:4000/v1/parents/<USER_ID>/dashboard"
```
