# Sprint 9 - Explicación técnica

## 1) Qué se implementó

- Backend admin con overview y gestión de colegios.
- Frontend admin multi-sección con navegación dedicada.
- Tabla de colegios con toggle de estado en vivo.
- Analytics globales para operación y seguimiento.

## 2) Decisiones clave

- Separar administración en módulo propio para evitar mezclar reglas públicas con privadas.
- Reusar `AdminApiKeyGuard` para consistencia operativa inmediata.
- Mantener moderación de reviews como flujo especializado bajo `/admin/reviews`.

## 3) Verificación

- `corepack pnpm --filter @eduadvisor/api build` ✅
- `corepack pnpm --filter @eduadvisor/web lint` ✅
- `corepack pnpm --filter @eduadvisor/web build` ✅

## 4) Deuda explícita

- Falta RBAC por rol/permisos granulares (super-admin, moderador, operador).
- Falta auditoría de acciones admin con historial de cambios.
- Falta alerting automático sobre picos de leads/reviews pendientes.
