# Sprint 9 - Admin Panel Architecture

## 1) Arquitectura técnica

Sprint 9 incorpora panel administrador operativo para:

1. Gestionar colegios (activar/desactivar).
2. Moderar reviews (flujo editorial).
3. Monitorear analytics globales de plataforma.

### Backend

Módulo `admin` con endpoints privados protegidos por `x-admin-key`:

- `GET /v1/admin/overview`
- `GET /v1/admin/schools`
- `PATCH /v1/admin/schools/:schoolId/status`

Se consolidan métricas cruzando `schools`, `reviews`, `leads` y ciudades.

### Frontend

Nuevas rutas:

- `/admin` (overview)
- `/admin/schools` (gestión de colegios)
- `/admin/reviews` (moderación)
- `/admin/analytics` (insights globales)

Acciones client-side protegidas mediante rutas internas Next (`/api/admin/...`) para no exponer claves en cliente.
