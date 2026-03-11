# Sprint 4 - Runbook localhost

## Levantar servicios

```bash
docker compose -f infra/docker-compose.local.yml up -d
```

## Instalar dependencias

```bash
pnpm install
```

## Preparar base de datos

```bash
pnpm --filter @eduadvisor/database prisma:migrate
pnpm --filter @eduadvisor/database prisma:seed
```

## Generar cliente Prisma para API

```bash
pnpm --filter @eduadvisor/api prisma:generate
```

## Levantar app + api

```bash
pnpm dev
```

URLs:

- Frontend: `http://localhost:3000`
- API: `http://localhost:4000`
- Swagger: `http://localhost:4000/docs`
- Meilisearch health: `http://localhost:7700/health`

## Reindex de búsqueda

```bash
curl -X POST http://localhost:4000/v1/search/reindex
```

## Probar búsqueda

```bash
curl "http://localhost:4000/v1/search?q=ingles&city=longchamps&level=PRIMARIA&feeMax=300000&ratingMin=4"
```
