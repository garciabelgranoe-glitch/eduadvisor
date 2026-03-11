# Sprint 11 - AI Recommendation System Architecture

## 1) Arquitectura técnica

Sprint 11 implementa el motor de recomendación "AI School Matching" para calcular compatibilidad colegio-familia desde cuestionario + texto libre.

### Backend (NestJS)

Módulo `matches` deja de ser skeleton y pasa a servicio productivo:

- `GET /v1/matches`
- `POST /v1/matches/recommend`

Se incorporan:

- DTO de entrada con validación (`class-validator`) para ubicación, edad, presupuesto, nivel, distancia, prioridades y texto libre.
- Algoritmo de scoring ponderado con breakdown explícito:
  - distancia,
  - presupuesto,
  - ajuste de nivel educativo,
  - calidad (rating + EduAdvisor Score),
  - intención (prioridades, tipos preferidos e inferencias desde texto).
- Inferencia semántica básica sobre `queryText` para detectar señales como "inglés", "jornada completa", "internacional", "deportes", etc.
- Persistencia analítica:
  - `MatchSession` (sesión de recomendación),
  - `ParentPreference` (preferencias capturadas),
  - `MatchResult` (resultados con `scoreBreakdown`).

### Frontend (Next.js)

Ruta `/matches` actualizada a flujo real:

- formulario completo de preferencias familiares,
- consulta al backend con filtros en querystring,
- cards de resultados con:
  - score total,
  - highlights,
  - breakdown por componente,
  - datos del colegio (cuota, rating, ubicación, niveles).

## 2) Escalabilidad y mantenibilidad

- Estrategia de búsqueda en 2 etapas:
  1. candidatos estrictos (ciudad/provincia/país + nivel),
  2. fallback amplio para evitar resultados vacíos.
- Agregaciones de rating en lote (`groupBy`) para evitar N+1.
- Persistencia diseñada para evolución a modelos ML supervisados sin romper contrato API.
