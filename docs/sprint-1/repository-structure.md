# Sprint 1 - Estructura de repositorio

```text
eduadvisor/
  apps/
    web/                # Next.js 14 App Router
    api/                # NestJS API
  packages/
    database/           # Prisma schema + migraciones
    shared/             # Tipos/contratos compartidos
  infra/
    docker-compose.local.yml
  docs/
    sprint-1/
      product-architecture.md
      er-diagram.md
      repository-structure.md
      seo-strategy.md
  .github/workflows/
    ci.yml
```

## Decisiones

- Monorepo para versionar frontend/backend/data contracts en un único ciclo de release.
- `packages/shared` evita drift de tipos entre API y Web.
- `packages/database` centraliza evolución de datos para soportar multi-país.
