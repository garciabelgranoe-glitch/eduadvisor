# Sprint 18 - Favorites Architecture

## Objetivo

Pasar de dashboard de padres con datos mock a una experiencia real basada en cuenta:

- guardar/quitar colegios desde cards y perfil
- listar favoritos reales en `parent-dashboard`
- mantener backend idempotente y consistente

## Diseño backend

Nueva entidad relacional:

- `SavedSchool(userId, schoolId)` con `unique(userId, schoolId)`
- índices para lectura por usuario y por colegio

Flujos:

1. `POST /v1/parents/:userId/saved-schools`
2. `DELETE /v1/parents/:userId/saved-schools/:schoolId`
3. `GET /v1/parents/:userId/saved-schools`
4. `GET /v1/parents/:userId/dashboard`

Reglas:

- solo usuarios con rol `PARENT`
- colegio debe existir y estar `active`
- operación de guardado idempotente (`upsert`)

## Diseño frontend

Componente cliente reutilizable:

- `SaveSchoolButton`
- usa React Query para cache compartida de favoritos
- resuelve autenticación contra `/api/parent/saved-schools`
- redirige a `/ingresar?next=...` cuando no hay sesión de padre

Integración:

- cards de resultados (`SearchResultCard`)
- CTAs en perfil de colegio (`SchoolProfileCtas`)
- dashboard de padres con lista y métricas reales

## Escalabilidad

- lectura de favoritos acotada por límite en endpoint
- cálculos de rating agregados por `groupBy` para evitar N+1
- invalidación puntual del cache de React Query tras mutaciones
