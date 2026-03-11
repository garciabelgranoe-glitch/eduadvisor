# Sprint 5 - Runbook localhost

## 1) Levantar infraestructura

```bash
docker compose -f infra/docker-compose.local.yml up -d
```

## 2) Instalar y preparar datos

```bash
corepack pnpm install
corepack pnpm --filter @eduadvisor/database prisma:migrate
corepack pnpm --filter @eduadvisor/database prisma:seed
corepack pnpm --filter @eduadvisor/api prisma:generate
```

## 3) Levantar API y web

```bash
corepack pnpm dev
```

## 4) Reindex search

```bash
curl -X POST http://localhost:4000/v1/search/reindex
```

## 5) URLs para validar

- `http://localhost:3000/`
- `http://localhost:3000/search?city=longchamps&level=PRIMARIA&feeMax=300000&ratingMin=4`
- `http://localhost:3000/school/north-hills-college`
- `http://localhost:3000/compare?schools=north-hills-college,colegio-san-lucas`
