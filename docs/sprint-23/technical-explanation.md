# Sprint 23 - Technical Explanation

## Qué se resolvió

- no había operación comercial para activar o cancelar premium por colegio.
- dashboard de colegio no mostraba estado de plan ni capacidades de monetización.
- no existía una feature premium tangible para validar valor del plan.
- bug de regresión: edición de perfil podía degradar estado `VERIFIED/PREMIUM`.

## Enfoque aplicado

- se agregó endpoint admin para gestionar suscripción por colegio.
- se conectó sincronización entre suscripción y `profileStatus` del colegio.
- se incorporó cálculo de entitlements comerciales en backend.
- se implementó exportación CSV de leads como capacidad premium.
- se extendió UI admin y school dashboard con señales de plan y acciones comerciales.
- se corrigió preservación de status en `updateSchoolProfile`.

## Resultado

- el equipo puede operar premium de forma explícita y auditable.
- colegios ven su estado comercial y beneficios disponibles.
- existe diferenciación funcional clara entre verificado y premium.

## Riesgos y siguiente paso

- aún no hay pasarela de cobro ni webhooks (Stripe/Mercado Pago).
- siguiente sprint recomendado: billing transaccional (checkout, invoice, webhooks, retries).
