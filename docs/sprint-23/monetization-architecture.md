# Sprint 23 - Monetization Architecture

## Objetivo

Activar un flujo comercial operativo para colegios:

- gestión de suscripciones premium desde admin
- sincronización de estado comercial con perfil de colegio
- capacidades premium reales en dashboard de colegio

## Diseño backend

### Gestión de suscripción

Nuevo endpoint admin:

- `PATCH /v1/admin/schools/:schoolId/subscription`

Comportamiento:

- crea snapshot de `SchoolSubscription`
- si estado es `ACTIVE` o `TRIAL`:
  - colegio pasa a `profileStatus = PREMIUM`
  - se actualizan `premiumSince` y `premiumUntil`
- si estado es `CANCELED`, `EXPIRED` o `PAST_DUE`:
  - colegio sale de premium (fallback a `VERIFIED` si estaba `PREMIUM`)

### Entitlements

Se calculan por combinación de:

- `profileStatus`
- estado/vencimiento de suscripción

Entitlements implementados:

- `canManageLeads`
- `canRespondReviews`
- `canUsePremiumLeadExport`
- `canAccessPriorityPlacement`

### Feature premium concreta

Export de leads CSV (premium):

- `GET /v1/schools/id/:schoolId/leads/export`
- bloquea acceso si no hay entitlement premium activo

## Diseño frontend

### Admin

- tabla de colegios ahora muestra plan/estado comercial
- toggle comercial para activar/quitar premium por colegio

### School dashboard

- nueva tarjeta de plan comercial
- botón `Exportar leads CSV` (habilitado solo para premium activo)
- upsell contextual si no hay premium

## Hardening aplicado

- invalidación de cache de catálogo/rankings al cambiar estado o suscripción
- fix crítico: editar perfil ya no degrada colegios `VERIFIED/PREMIUM` a `CURATED`
