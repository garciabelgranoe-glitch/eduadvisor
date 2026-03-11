# Sprint 7 - Lead Generation Architecture

## 1) Arquitectura técnica

Sprint 7 implementa la captación y operación de leads de punta a punta:

1. Padre envía consulta desde el perfil del colegio.
2. API valida y persiste lead en `Lead` con estado inicial `NEW`.
3. Colegio visualiza pipeline de leads en dashboard.
4. Colegio actualiza estado (`CONTACTED`, `QUALIFIED`, `CLOSED`).

### Backend

- `POST /v1/leads`: alta pública de lead.
- `GET /v1/leads/school/:schoolId`: listado operativo para colegio.
- `GET /v1/leads/school/:schoolId/summary`: métricas por estado.
- `PATCH /v1/leads/:leadId/status`: actualización de pipeline.

### Seguridad

Endpoints operativos se protegen con `AdminApiKeyGuard` via `x-admin-key`.

### Calidad de datos

- Normalización de email/teléfono/nombre.
- Validaciones de edad/nivel/email.
- Detección de duplicados recientes (últimos 7 días) para evitar spam.

