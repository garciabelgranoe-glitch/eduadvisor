# Sprint 8 - School Dashboard Architecture

## 1) Arquitectura técnica

Sprint 8 consolida el panel para colegios en tres dominios operativos:

1. Gestión de leads (pipeline y estado comercial).
2. Gestión de perfil institucional (edición de ficha).
3. Métricas de desempeño (conversión, reviews, tendencia de demanda).

### Backend

Se agregaron endpoints privados bajo `schools`:

- `GET /v1/schools/id/:schoolId/dashboard`
  - Retorna perfil + stats + leads recientes + tendencia de 6 meses.
- `PATCH /v1/schools/id/:schoolId/profile`
  - Actualiza datos institucionales editables y niveles académicos.

Protección: `AdminApiKeyGuard` (`x-admin-key`).

### Frontend

- `school-dashboard` consume dashboard privado.
- Editor de perfil client-side con persistencia real.
- Tendencia de leads visual y pipeline con actualización de estados.
- Proxy interno Next para perfil:
  - `PATCH /api/schools/profile`

## 2) Métricas calculadas

- `leadsTotal`
- `leadsByStatus` (`NEW`, `CONTACTED`, `QUALIFIED`, `CLOSED`)
- `conversionRate`
- `reviewsApproved`
- `reviewsPending`
- `ratingAverage`
- `profileCompleteness`
- `leadTrend` (últimos 6 meses)
