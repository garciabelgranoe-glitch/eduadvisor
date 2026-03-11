# Sprint 24 - Billing Architecture

## Objetivo

Implementar la base transaccional de monetización sin acoplarse todavía a un PSP final (Stripe/Mercado Pago), dejando:

- lifecycle de suscripción robusto
- checkout session modelado
- invoice ledger persistente
- intake y trazabilidad de webhooks con deduplicación

## Diseño del dominio

Se incorporan entidades nuevas:

- `SchoolBillingCustomer`
- `BillingCheckoutSession`
- `BillingInvoice`
- `BillingWebhookEvent`

Y extensiones en `SchoolSubscription`:

- `provider`
- `sourceExternalId`
- `sourceEventId`

## Estrategia provider-agnostic

- `BillingProvider` centraliza origen (`MANUAL`, `STRIPE`, `MERCADO_PAGO`).
- Webhooks se procesan por contrato genérico (`id`, `type`, `data.object`).
- Simulación admin permite validar ciclo completo sin gateway real.

## Estado comercial y entitlements

Regla aplicada:

- `ACTIVE` / `TRIAL` -> `School.profileStatus = PREMIUM`
- `PAST_DUE` / `CANCELED` / `EXPIRED` -> downgrade a `VERIFIED` (si estaba `PREMIUM`)

Esto mantiene coherencia con features premium ya implementadas (export de leads, priorización, etc.).

## Hardening

- dedupe por `provider + externalEventId`
- control de firma webhook por:
  - `BILLING_WEBHOOK_SECRET_<PROVIDER>`
  - fallback `BILLING_WEBHOOK_SECRET`
- estados de procesamiento: `RECEIVED`, `PROCESSED`, `FAILED`, `DUPLICATE`, `IGNORED`
- invalidación de cache de catálogo/rankings al cambiar estado comercial

