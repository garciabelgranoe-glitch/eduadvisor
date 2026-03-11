# Sprint 15 - Quality Architecture

Objetivo: elevar confiabilidad operativa antes de seguir agregando features.

## Principios

- Testear lógica de negocio crítica y no solo render/UI.
- Cubrir paths felices y errores de negocio.
- Garantizar coherencia de caché en writes.

## Cobertura implementada

- `CacheService`
  - cache hit para payload semánticamente equivalente.
  - invalidación por namespace.
- `SearchService`
  - motor principal (Meilisearch).
  - fallback a Postgres.
  - propagación de errores de validación.
  - invalidación tras reindex.
- `LeadsService`
  - normalización y creación de lead.
  - prevención de duplicados.
  - error por lead inexistente al actualizar estado.
- `ReviewsService`
  - creación con estado inicial `PENDING`.
  - validación de moderación.
  - invalidación de caché tras moderación.
  - error por colegio inexistente.
