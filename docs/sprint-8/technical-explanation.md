# Sprint 8 - Explicación técnica

## 1) Qué se implementó

- Dashboard privado del colegio con métricas y tendencia de leads.
- Edición de perfil institucional persistida en backend.
- Integración de pipeline comercial + perfil en una sola pantalla operativa.

## 2) Decisiones clave

- Endpoint agregado en `schools` para centralizar visión de negocio del colegio.
- Perfil editable vía patch parcial (campos opcionales, normalización de nulos).
- Niveles académicos gestionados como relación `SchoolToLevel` en transacción.

## 3) Verificación

- `corepack pnpm --filter @eduadvisor/api build` ✅
- `corepack pnpm --filter @eduadvisor/web lint` ✅
- `corepack pnpm --filter @eduadvisor/web build` ✅

## 4) Deuda explícita

- Falta control de acceso por colegio (hoy API key de entorno).
- Falta auditoría de cambios de perfil (historial/rollback).
- Falta integración con notificaciones al cambiar estado de leads.
