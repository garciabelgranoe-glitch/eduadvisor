# Sprint 6 - Explicación técnica

## 1) Qué se implementó

- Formulario de reviews conectado al backend real.
- Persistencia con estado editorial `PENDING`.
- Cola de moderación y acción de aprobar/rechazar.
- Endpoint público de reviews aprobadas por colegio.
- Panel operativo mínimo para moderación en frontend.

## 2) Decisiones clave

- Moderación protegida por `x-admin-key` mientras llega auth completa.
- Publicación pública exclusivamente de reviews aprobadas.
- Proxy en Next (`/api/reviews`) para desacoplar frontend del host del backend.

## 3) Calidad y verificación

- `corepack pnpm --filter @eduadvisor/api build` ✅
- `corepack pnpm --filter @eduadvisor/web lint` ✅
- `corepack pnpm --filter @eduadvisor/web build` ✅

## 4) Deuda explícita

- Falta identidad de autor verificada (se resolverá con auth en sprintes posteriores).
- Falta razón de rechazo persistida en DB (moderación avanzada).
- Falta rate limiting/captcha para hardening anti-spam.
