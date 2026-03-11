# Sprint 13 - Explicación técnica

## 1) Qué se implementó

- Rankings reales por ciudad basados en `EduAdvisorScore`.
- Market insights reales con métricas de cuota, demanda, satisfacción, búsqueda y tendencia.
- Recompute job protegido para generar snapshots diarios de inteligencia.
- Frontend conectado a backend real en `/rankings`, `/market-insights` y Home.

## 2) Decisiones clave

- Mantener cálculo analítico centralizado en backend para coherencia entre canales.
- Diseñar recompute como endpoint admin para poder orquestarlo desde cron/CI sin acoplar a un proveedor.
- Persistir snapshots diarios para habilitar benchmarking histórico y modelos más avanzados.

## 3) Verificación

- `corepack pnpm --filter @eduadvisor/api build` ✅
- `corepack pnpm --filter @eduadvisor/web lint` ✅
- `corepack pnpm --filter @eduadvisor/web build` ✅

## 4) Deuda explícita

- Falta scheduler interno (BullMQ/cron job) para ejecutar recompute automáticamente sin dependencia externa.
- Falta instrumentar data lineage/versionado de algoritmo de score.
- Falta incluir señales externas de mercado (tránsito, inflación educativa, competencia por zona).
