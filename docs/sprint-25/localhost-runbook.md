# Sprint 25 - Localhost Runbook

## Prerrequisitos

- Docker levantado (PostgreSQL local)
- `.env` configurado en raíz del monorepo

## Arranque recomendado

1. Levantar base local:
   - `docker compose -f infra/docker-compose.local.yml up -d postgres redis`
2. Sincronizar esquema + seed:
   - `corepack pnpm --filter @eduadvisor/database exec prisma db push --schema prisma/schema.prisma --accept-data-loss`
   - `corepack pnpm --filter @eduadvisor/database prisma:seed`
3. Levantar frontend y backend:
   - `corepack pnpm dev`

## URLs de verificación

- `http://localhost:3000/`
- `http://localhost:3000/ingresar`
- `http://localhost:3000/school-dashboard`
- `http://localhost:3000/admin/billing` (requiere iniciar sesión admin vía `/ingresar?next=/admin/billing`)
- `http://localhost:4000/v1/health/liveness`

## Si algo falla

- si `/admin/billing` devuelve error de módulo:
  - repetir `db push` + `seed`
- si login colegio falla:
  - usar representante seed: `maria.torres@example.eduadvisor`
  - colegio: `north-hills-college`
- si no conecta localhost:
  - verificar puertos `3000/4000/5434` libres y Docker operativo
