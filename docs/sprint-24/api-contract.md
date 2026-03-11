# Sprint 24 - API Contract

## Admin billing endpoints

### `GET /v1/admin/billing/overview`

Headers:

- `x-admin-key` con scope `read`

Respuesta:

- KPIs (subs activas, mora, MRR, revenue 30d, checkouts abiertos)
- distribución por estado de facturas y webhooks

### `GET /v1/admin/billing/invoices`

Headers:

- `x-admin-key` con scope `read`

Query opcional:

- `schoolId`
- `provider` (`MANUAL` | `STRIPE` | `MERCADO_PAGO`)
- `status` (`DRAFT` | `OPEN` | `PAID` | `VOID` | `UNCOLLECTIBLE`)
- `page`, `limit`

### `GET /v1/admin/billing/webhook-events`

Headers:

- `x-admin-key` con scope `read`

Query opcional:

- `schoolId`
- `provider`
- `status` (`RECEIVED` | `PROCESSED` | `FAILED` | `DUPLICATE` | `IGNORED`)
- `page`, `limit`

### `GET /v1/admin/billing/checkout-sessions/:sessionId`

Headers:

- `x-admin-key` con scope `read`

Uso:

- vista checkout demo en frontend (`/checkout/[sessionId]`)

### `POST /v1/admin/billing/checkout-sessions`

Headers:

- `x-admin-key` con scope `write`
- `content-type: application/json`

Body:

```json
{
  "schoolId": "cuid",
  "provider": "MANUAL",
  "planCode": "premium",
  "amountMonthly": 99000,
  "currency": "ARS",
  "intervalMonths": 1,
  "trialDays": 0
}
```

### `POST /v1/admin/billing/events/simulate`

Headers:

- `x-admin-key` con scope `write`
- `content-type: application/json`

Body ejemplo:

```json
{
  "provider": "MANUAL",
  "eventType": "invoice.paid",
  "schoolId": "cuid"
}
```

## Webhook endpoint público

### `POST /v1/billing/webhooks/:provider`

Path param:

- `provider`: `manual` | `stripe` | `mercado_pago`

Headers opcional:

- `x-billing-signature`

Firma:

- valida contra `BILLING_WEBHOOK_SECRET_<PROVIDER>`
- fallback `BILLING_WEBHOOK_SECRET`

Eventos soportados:

- `checkout.session.completed`
- `checkout.session.expired`
- `invoice.paid`
- `invoice.payment_failed`
- `subscription.canceled`
- `customer.subscription.deleted`
- `subscription.renewed`

