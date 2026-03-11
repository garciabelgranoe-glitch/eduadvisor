# Sprint 14 - Localhost Runbook

## Servicios base

```bash
docker compose -f infra/docker-compose.local.yml up -d
```

## Variables

Usar `.env` con:

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/eduadvisor` (si tu Postgres local está en 5433)
- `REDIS_URL=redis://localhost:6379`
- `MEILISEARCH_HOST=http://localhost:7700`

## Preparación DB

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/eduadvisor corepack pnpm --filter @eduadvisor/database exec prisma db push
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/eduadvisor corepack pnpm --filter @eduadvisor/database prisma:seed
corepack pnpm --filter @eduadvisor/api prisma:generate
```

## Run

```bash
corepack pnpm --filter @eduadvisor/api dev
corepack pnpm --filter @eduadvisor/web dev
```

URLs:

- `http://localhost:3000`
- `http://localhost:4000/v1/health/live`
