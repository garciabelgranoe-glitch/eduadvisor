# Sprint 26 - Localhost Runbook (GTM-025)

## Prerrequisitos

- `.env` configurado en raíz
- frontend levantado en `http://localhost:3000`

## Ejecutar QA funcional integral

1. Desde raíz:
   - `corepack pnpm --filter @eduadvisor/web test -- tests/gtm-functional-integral.spec.ts`
2. Pack recomendado junto con seguridad crítica:
   - `corepack pnpm --filter @eduadvisor/web test -- tests/gtm-functional-integral.spec.ts tests/security-public-form-abuse.spec.ts tests/security-login-rate-limit.spec.ts`

## Resultado esperado

- Todas las pruebas en verde.
- Si backend está caído, el suite sigue validando fallbacks controlados (sin pantalla blanca ni loops de redirección).
