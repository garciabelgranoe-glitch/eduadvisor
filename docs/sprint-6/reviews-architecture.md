# Sprint 6 - Reviews System Architecture

## 1) Arquitectura técnica

Sprint 6 implementa el ciclo completo de reviews:

1. Padre crea review desde frontend.
2. API persiste review con estado `PENDING`.
3. Moderador revisa cola editorial.
4. Moderación marca `APPROVED` o `REJECTED`.
5. Solo reviews `APPROVED` se muestran en perfiles públicos.

### Backend

- `POST /v1/reviews`: alta de review con validación estricta.
- `GET /v1/reviews/school/:schoolId`: listado público (solo aprobadas).
- `GET /v1/reviews/moderation/queue`: cola de moderación (admin key).
- `PATCH /v1/reviews/:reviewId/moderate`: acción de moderación (admin key).

### Seguridad de moderación

Se agregó guard `AdminApiKeyGuard` que valida `x-admin-key` contra `ADMIN_API_KEY`.

### Frontend

- `/review`: formulario real conectado a backend.
- `/admin/reviews`: cola de moderación operativa.
- Rutas internas Next para proxy:
  - `POST /api/reviews`
  - `PATCH /api/reviews/moderate`

