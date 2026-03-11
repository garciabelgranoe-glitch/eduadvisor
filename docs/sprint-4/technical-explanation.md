# Sprint 4 - Explicación técnica

## 1) Qué se implementó

- Integración real con Meilisearch.
- Indexación de colegios con señales de rating y score.
- Filtros de negocio requeridos: ubicación, nivel educativo, cuota y rating.
- Endpoint de reindex manual para operaciones.
- Fallback automático a base relacional para resiliencia.

## 2) Decisiones de diseño

- Fallback en `SearchService` evita caída funcional cuando el motor no está disponible.
- Claves normalizadas (`cityKey`, `provinceKey`, `countryKey`) mejoran robustez de filtros.
- Bootstrap de índice si está vacío durante la primera búsqueda.

## 3) Riesgos / deuda explícita

- Reindex actual es full rebuild (no incremental por eventos todavía).
- No hay cola asíncrona para sincronización near real-time (se resuelve en siguientes sprintes de infra/ops).
