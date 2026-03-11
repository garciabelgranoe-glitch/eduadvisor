# Sprint 12 - Explicación técnica

## 1) Qué se implementó

- CI/CD productivo en GitHub Actions (calidad, build y deploy hooks).
- Healthchecks de liveness/readiness con validación de dependencias.
- Logging HTTP estructurado con correlación por request.
- Scripts de backup/restore de PostgreSQL y workflow diario de backup.
- Dockerfiles para API y Web listos para despliegue en plataformas managed.

## 2) Decisiones clave

- Deploy hooks para desacoplar pipeline de proveedor y mantener simplicidad inicial.
- Readiness centrado en dependencias críticas para minimizar falsos positivos.
- Backups en formato `custom` de PostgreSQL para restauración granular y confiable.

## 3) Verificación

- `corepack pnpm --filter @eduadvisor/api build` ✅
- `corepack pnpm --filter @eduadvisor/web lint` ✅
- `corepack pnpm --filter @eduadvisor/web build` ✅

## 4) Deuda explícita

- Falta shipping de logs a stack centralizado (Datadog/ELK/Grafana Loki).
- Falta alerting automático sobre `health/ready` degradado.
- Falta cifrado y replicación externa de backups en frío.
