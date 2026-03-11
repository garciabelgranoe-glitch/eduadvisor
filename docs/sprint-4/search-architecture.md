# Sprint 4 - Search Engine Architecture

## 1) Arquitectura técnica

Se incorporó Meilisearch como motor de búsqueda primario con fallback automático a PostgreSQL.

### Componentes

- `SearchController`
  - `GET /v1/search`
  - `GET /v1/search/health`
  - `POST /v1/search/reindex`
- `SearchService`
  - Orquesta búsqueda principal + fallback.
- `SearchIndexService`
  - Configura índice.
  - Reindexa desde PostgreSQL.
  - Ejecuta búsquedas con filtros y orden.

### Flujo de búsqueda

1. API recibe filtros (`ubicación`, `nivel`, `cuota`, `rating`).
2. `SearchService` intenta resolver en Meilisearch.
3. Si Meilisearch falla/no está disponible, cae a `SchoolsService` (PostgreSQL).
4. Se devuelve respuesta con `engine: "meilisearch"` o `engine: "postgres_fallback"`.

### Índice `schools`

Campos relevantes indexados:

- Identidad: `id`, `slug`, `name`, `description`
- Geografía: `countryName`, `provinceName`, `cityName`, `countryCode` + claves normalizadas
- Oferta: `levels`, `monthlyFeeEstimate`, `studentsCount`
- Señales calidad: `ratingAverage`, `ratingCount`, `eduAdvisorScore`
- Localización: `latitude`, `longitude`, `_geo`

### Configuración de índice

- `searchableAttributes`: nombre, descripción, ciudad, provincia, país, niveles
- `filterableAttributes`: ubicación, niveles, cuota, rating, score
- `sortableAttributes`: nombre, cuota, rating, score, fecha

