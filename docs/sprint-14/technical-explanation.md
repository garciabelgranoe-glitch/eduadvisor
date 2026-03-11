# Sprint 14 - Technical Explanation

Se implementó una capa de caché de aplicación para soportar mayor volumen de lectura.

## Decisiones clave

- `CacheService` centralizado para evitar lógica duplicada por módulo.
- Invalidation por versionado de namespace:
  - cada namespace tiene `vN`
  - los cache keys incluyen la versión
  - invalidar es hacer `INCR` de versión (O(1)).
- Fallback in-memory para no degradar disponibilidad cuando Redis no responde.

## Impacto esperado

- Menor presión sobre PostgreSQL en rutas públicas.
- Menor latencia en listados, rankings e insights agregados.
- Consistencia eventual controlada por invalidación explícita en endpoints de escritura.

## Riesgos controlados

- Caída de Redis: la API sigue operativa por fallback local.
- Claves huérfanas tras invalidación: se controlan con TTL.
- Stale data: mitigado con invalidaciones en eventos de negocio.
