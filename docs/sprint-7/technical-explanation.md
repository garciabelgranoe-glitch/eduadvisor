# Sprint 7 - Explicación técnica

## 1) Qué se implementó

- Captura real de leads desde `/school/[slug]`.
- Pipeline de leads con actualización de estado en `/school-dashboard`.
- Endpoints operativos para listado y métricas por colegio.
- Protección de operaciones sensibles con API key.

## 2) Decisiones clave

- Mantener endpoint de alta público y separar operaciones internas por guard.
- Usar rutas API internas de Next para desacoplar frontend de host backend.
- Devolver `targetSchool` en creación para trazabilidad y futura notificación.

## 3) Verificación

- `corepack pnpm --filter @eduadvisor/api build` ✅
- `corepack pnpm --filter @eduadvisor/web lint` ✅
- `corepack pnpm --filter @eduadvisor/web build` ✅

## 4) Deuda explícita

- Falta distribución automática de leads por email/CRM.
- Falta SLA/recordatorios automáticos para leads sin contacto.
- Falta RBAC real por colegio (hoy protegido por API key de entorno).
