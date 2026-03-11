# Sprint 26 - QA Funcional Integral Architecture

## Objetivo

Cerrar `GTM-025` con validación funcional automatizada de los cuatro journeys críticos antes de salida a mercado:

- búsqueda (`/search`)
- autenticación y guardas por rol (`/ingresar`, dashboards protegidos)
- dashboards de usuario (`/parent-dashboard`, `/school-dashboard`)
- módulo de facturación admin (`/admin/billing`)

## Enfoque técnico

- Se agrega un spec Playwright dedicado con cobertura transversal de producto.
- Las pruebas usan sesiones firmadas para evitar dependencia de flujo manual de login durante QA.
- Cada flujo valida modo normal o fallback controlado cuando backend no responde.
- Las aserciones priorizan estabilidad de release: navegación, acceso, render y mensajes operativos.

## Criterios de aceptación GTM-025

1. Search muestra resumen, mapa y estado de resultados.
2. Ingreso muestra CTA por rol y las rutas privadas redirigen sin sesión.
3. Dashboards renderizan con sesión válida sin pantalla blanca.
4. Billing admin abre con sesión admin y muestra datos o fallback explícito.
