# Sprint 16 - Technical Explanation

## Qué se resolvió

- Falta de protección en `POST /search/reindex`.
- Seguridad sin granularidad de permisos en endpoints admin.
- Ausencia de telemetría agregada para operación en producción.

## Enfoque aplicado

- Guard global de rate limiting con defaults seguros y override por decorator.
- `AdminApiKeyGuard` extendido con scopes declarativos por endpoint.
- Interceptor global para logging estructurado + métricas agregadas.
- Endpoint operativo `/health/metrics` protegido con scope `read`.

## Resultado

- Superficie de abuso reducida (throttling transversal).
- Menor riesgo operativo por permisos excesivos de claves admin.
- Mayor visibilidad del comportamiento HTTP y salud de proceso para debugging y monitoreo.
