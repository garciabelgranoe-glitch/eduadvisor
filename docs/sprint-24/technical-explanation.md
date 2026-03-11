# Sprint 24 - Technical Explanation

## Qué se resolvió

- faltaba un backend de cobro transaccional listo para conectar PSP real.
- no existía ledger de facturas ni trazabilidad formal de webhooks.
- no había forma de probar lifecycle comercial end-to-end en local.

## Enfoque aplicado

- se creó un módulo `Billing` independiente y desacoplado de proveedor.
- se modelaron clientes, checkout sessions, invoices y webhook events.
- se implementó intake de webhooks con:
  - validación de firma
  - deduplicación
  - estados de procesamiento
- se incorporó simulador admin para disparar eventos críticos.
- se conectó UI admin (`/admin/billing`) y checkout demo (`/checkout/[sessionId]`).

## Resultado

- el producto ya tiene base de cobro “production-like” sin gateway definitivo.
- podemos operar/supervisar billing desde admin y testear escenarios de pago, mora y cancelación.
- la transición a Stripe/Mercado Pago queda acotada a adapters y mapeo de eventos.

## Riesgos y siguiente paso

- aún no hay cobro real (tokenización, checkout hosted real, conciliación bancaria).
- siguiente sprint recomendado:
  - adapter Stripe/Mercado Pago
  - reintentos automáticos de cobro
  - notificaciones transaccionales (email/whatsapp) por eventos de factura.

