# Sprint 17 - Technical Explanation

## Que se resolvio

- Autenticacion basada solo en cookie de rol sin identidad real.
- Acceso de dashboards sin scope persistente por colegio.
- Riesgo de fuga funcional por navegacion no alineada al estado de sesion.
- Login de familias sin OAuth dedicado y login de colegios sin verificación estricta.

## Enfoque aplicado

- Se centralizo el alta de sesion en backend (`/v1/auth/session`) con validaciones de dominio.
- Se introdujo cookie firmada (`eduadvisor_session`) con expiracion y payload minimo.
- Se reforzo middleware con RBAC y scope enforcement para dashboard de colegio.
- Se implemento Google OAuth para familias (`/api/session/google/start` + callback).
- Se habilito `GET /v1/auth/school-claim-status` y UI de consulta de estado de claim.
- Se bloqueo acceso institucional si no existe claim aprobado y colegio verificado.

## Resultado

- Sesiones trazables por usuario y rol.
- School dashboard acotado al colegio permitido por sesion.
- Menor superficie de error entre estado visual de UI y permisos efectivos.
- Flujo de ingreso alineado con producto: padres con Google y colegios con verificación previa.

## Riesgos y siguiente paso

- Todavia no hay proveedor externo (Clerk/Auth.js) ni MFA.
- Proximo sprint: auditoria de sesiones (revocacion, rotacion de secreto, device fingerprint opcional).
