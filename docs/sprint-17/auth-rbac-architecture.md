# Sprint 17 - Identity & Session Architecture

Objetivo: cerrar el gap entre navegación por rol simulada y una sesión autenticada con identidad, alcance y expiración.

## Capas implementadas

- Backend (`NestJS`):
  - Nuevo módulo `AuthModule`.
  - Endpoint `POST /v1/auth/session` protegido por `AdminApiKeyGuard` + scope `write`.
  - Endpoint `GET /v1/auth/school-claim-status` (scope `read`) para consultar elegibilidad institucional.
  - Resolución de identidad:
    - `PARENT`: upsert de usuario.
    - `SCHOOL_ADMIN`: login permitido solo si existe claim aprobado para ese email y colegio verificado.
- Web (`Next.js`):
  - Migración de cookie de rol simple a cookie de sesión firmada (`eduadvisor_session`).
  - Firma/verificación HMAC SHA-256 con `AUTH_SESSION_SECRET`.
  - Payload de sesión: `userId`, `email`, `role`, `schoolId`, `schoolSlug`, `issuedAt`, `expiresAt`.
  - Login de familias por Google OAuth (`/api/session/google/start` + callback).
- Middleware RBAC:
  - `/parent-dashboard`: requiere sesión `PARENT`.
  - `/school-dashboard`: requiere sesión `SCHOOL_ADMIN` + `schoolSlug`.
  - se fuerza scope de colegio en query param (`?school=<slug>`).

## Decisiones de diseño

- Mantener login web sin exponer credenciales sensibles en cliente.
- Resolver identidad en backend con estado real de datos (users/schools/representatives).
- Sostener compatibilidad temporal con cookie legacy (`eduadvisor_session_role`) para transición sin corte.
