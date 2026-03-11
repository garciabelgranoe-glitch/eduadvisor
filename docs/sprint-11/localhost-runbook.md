# Sprint 11 - Runbook localhost

## Variables mínimas

```bash
API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/eduadvisor
```

## URL principal

- `http://localhost:3000/matches`

## Validación API

```bash
curl "http://localhost:4000/v1/matches?city=longchamps&childAge=9&educationLevel=PRIMARIA&budgetMax=280000&maxDistanceKm=8&priorities=Ingles%20fuerte,Jornada%20completa&queryText=Busco%20colegio%20con%20buen%20ingles"

curl -X POST "http://localhost:4000/v1/matches/recommend" \
  -H "content-type: application/json" \
  -d '{
    "city":"longchamps",
    "childAge":9,
    "educationLevel":"PRIMARIA",
    "budgetMax":280000,
    "maxDistanceKm":8,
    "preferredTypes":["BILINGUAL"],
    "priorities":["Ingles fuerte","Jornada completa"],
    "queryText":"Busco colegio con buen inglés y jornada completa"
  }'
```

## Verificación build/lint

```bash
corepack pnpm --filter @eduadvisor/api build
corepack pnpm --filter @eduadvisor/web lint
corepack pnpm --filter @eduadvisor/web build
```
