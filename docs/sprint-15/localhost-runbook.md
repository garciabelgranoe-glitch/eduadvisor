# Sprint 15 - Localhost Runbook

## Backend tests

```bash
corepack pnpm --filter @eduadvisor/api test
```

## Frontend estable

Modo dev limpio:

```bash
corepack pnpm --filter @eduadvisor/web dev:clean
```

Modo preview producción local:

```bash
corepack pnpm --filter @eduadvisor/web build
corepack pnpm --filter @eduadvisor/web start
```
