# Sprint 3 - Explicación técnica

## 1) Qué se implementó

Se reemplazaron stubs por lógica real con Prisma para catálogo, detalle, reviews, leads y búsqueda.

## 2) Decisiones importantes

- Reuso del servicio de `schools` desde `search` para evitar duplicación.
- Filtros por nivel y geografía ejecutados en base de datos.
- `ratingMin` aplicado por agregación de reviews aprobadas.
- Respuestas paginadas con metadata consistente.
- DTOs endurecidos para asegurar calidad de datos de entrada.

## 3) Preparación para siguientes sprints

- Search engine externo (Meilisearch) podrá conectarse al endpoint de búsqueda actual sin romper contrato.
- Sistema de moderación de reviews ya parte con estado `PENDING`.
- Leads ya quedan persistidos y listos para dashboard escolar en Sprint 8.

## 4) Riesgos / deuda explícita

- Filtro `ratingMin` hoy requiere consulta agregada intermedia; se optimiza en Sprint 4 con índice de búsqueda y/o vistas materializadas.
- No se incluyó autenticación obligatoria todavía para crear reviews/leads (se integra con Clerk/Auth.js en sprintes de auth/dashboard).
