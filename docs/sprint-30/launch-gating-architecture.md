# Sprint 30 - Launch Gating + Go/No-Go (GTM-030)

## Objetivo

Cerrar la salida a mercado con un modelo de lanzamiento controlado y una evaluación operativa reproducible en admin.

## Arquitectura de lanzamiento

Se define `LAUNCH_MODE` con tres estados:

1. `PRIVATE`: familias y colegios por invitación.
2. `PUBLIC`: familias abiertas, colegios por invitación.
3. `OPEN`: acceso abierto sin gating de beta.

La resolución de modo queda centralizada en `apps/web/lib/beta/launch-mode.ts` y se aplica en:

- `middleware` para guardas de dashboards.
- guards BFF (`requireParentSession`, `requireSchoolAdminSession`).
- endpoint de estado de beta (`/api/beta/status`).
- UX de acceso (`/ingresar`, `/beta-acceso`).

## Go/No-Go operativo

Se incorpora snapshot de readiness (`apps/web/lib/admin/launch-readiness.ts`) que evalúa:

- salud API/web (live, ready, search, admin, rutas web críticas),
- endpoints observables (`/v1/health/metrics`, `/v1/admin/overview`),
- variables de entorno requeridas/optativas,
- reglas de invitación según modo (`PRIVATE/PUBLIC`).

El panel `/admin/launch` muestra:

- estado consolidado (`PASS/WARN/FAIL`),
- detalle por check con latencia/http status,
- recomendaciones accionables para decisión go/no-go.
