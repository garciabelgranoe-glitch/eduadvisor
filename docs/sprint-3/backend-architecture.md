# Sprint 3 - Core Backend Architecture

## 1) Arquitectura tecnica

EDUADVISOR API se mantiene en NestJS con arquitectura modular por dominio y persistencia PostgreSQL mediante Prisma.

### Módulos core implementados

- `schools`: catálogo, filtros y detalle.
- `search`: búsqueda unificada sobre catálogo.
- `reviews`: recepción de opiniones de familias.
- `leads`: captación de consultas para colegios.

### Flujo de datos

1. Request HTTP en controller.
2. Validación estricta con DTO + `ValidationPipe` global.
3. Service de dominio aplica reglas de negocio.
4. Prisma ejecuta queries y persistencia en PostgreSQL.
5. Response estructurada con `items` + `meta` en endpoints listados.

### Estrategias de escalabilidad aplicadas en Sprint 3

- Paginación estándar (`page`, `limit`).
- Filtros combinables (`country`, `province`, `city`, `level`, `fee`, `rating`).
- Normalización geográfica relacional (`Country -> Province -> City -> School`).
- Enriquecimiento con agregados (rating promedio + EduAdvisor Score).

## 2) Endpoints core entregados

- `GET /v1/schools`
- `GET /v1/schools/:slug`
- `POST /v1/reviews`
- `POST /v1/leads`
- `GET /v1/search`

Detalles en `api-contract.md`.
