# Sprint 13 - Data Intelligence Architecture

## 1) Arquitectura técnica

Sprint 13 convierte `rankings` y `market-insights` de skeleton a servicios reales de inteligencia.

### Backend

#### Rankings (`/v1/rankings`)

- Agrupa colegios activos por ciudad.
- Usa el último `EduAdvisorScore` por colegio.
- Calcula por ciudad:
  - `topScore`,
  - `averageScore`,
  - cantidad de colegios,
  - top 3 colegios.
- Ordena ranking por score y volumen, con filtros por país/provincia/ciudad.

#### Market Insights (`/v1/market-insights`)

- Calcula métricas de mercado reales sobre escuelas/leads/reviews:
  - cuota promedio y rango,
  - demanda por nivel educativo,
  - satisfacción promedio,
  - colegios más buscados,
  - tendencia de leads (6 meses),
  - ciudades con mayor actividad.
- Soporta filtros de alcance geográfico y ventana temporal.

#### Job diario de inteligencia (`/v1/market-insights/recompute`)

- Endpoint protegido con `x-admin-key`.
- Recalcula y persiste:
  - `EduAdvisorScore` (nuevo snapshot por colegio),
  - `SchoolMetricsDaily` (upsert diario),
  - `MarketMetricDaily` (snapshots país/provincia/ciudad).

### Frontend

- `/rankings` conectado a backend real.
- `/market-insights` conectado a backend real con tiles + listas + tendencia.
- Home usa ranking real con fallback controlado.

## 2) Escalabilidad y calidad

- Cálculo por lotes y agregaciones server-side para evitar N+1 en frontend.
- Contratos tipados (`types.ts`) para consistencia entre páginas y API.
- Persistencia diaria orientada a analítica histórica y modelos futuros.
