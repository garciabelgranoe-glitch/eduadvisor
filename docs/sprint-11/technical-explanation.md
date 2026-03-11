# Sprint 11 - Explicación técnica

## 1) Qué se implementó

- Sistema real de AI School Matching con scoring multi-factor.
- Persistencia de sesión, preferencias y resultados para analítica futura.
- Pantalla `/matches` conectada al backend con formulario completo y resultados explicables.
- Inferencia desde texto libre para enriquecer matching sin depender de un LLM externo en esta fase.

## 2) Decisiones clave

- Scoring transparente (no caja negra) para dar confianza a padres y colegios.
- Contrato API único para web y futuros canales (mobile/B2B).
- Persistencia desde Sprint 11 para habilitar mejora de algoritmo con datos históricos en Sprints posteriores.

## 3) Verificación

- `corepack pnpm --filter @eduadvisor/api build` ✅
- `corepack pnpm --filter @eduadvisor/web lint` ✅
- `corepack pnpm --filter @eduadvisor/web build` ✅

## 4) Deuda explícita

- Falta aprendizaje supervisado / reranking por conversión real de leads.
- Falta señales externas (tiempos de traslado reales, idioma certificado, jornada formal estructurada).
- Falta personalización por historial de comportamiento autenticado (cuando se integre auth completo).
