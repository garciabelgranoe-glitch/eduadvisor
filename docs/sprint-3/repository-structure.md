# Sprint 3 - Estructura de backend

```text
apps/api/src/
  app.module.ts
  main.ts
  prisma/
    prisma.module.ts
    prisma.service.ts
  common/
    dto/
      pagination-query.dto.ts
  modules/
    schools/
      dto/list-schools.dto.ts
      schools.controller.ts
      schools.service.ts
      schools.module.ts
    search/
      dto/search.dto.ts
      search.controller.ts
      search.service.ts
      search.module.ts
    reviews/
      dto/create-review.dto.ts
      reviews.controller.ts
      reviews.service.ts
      reviews.module.ts
    leads/
      dto/create-lead.dto.ts
      leads.controller.ts
      leads.service.ts
      leads.module.ts

packages/database/
  prisma/
    schema.prisma
    seed.ts
```

## Criterios de organización

- DTOs separados por módulo para evitar acoplamiento.
- Lógica de negocio concentrada en services.
- Prisma centralizado vía `PrismaService` global.
