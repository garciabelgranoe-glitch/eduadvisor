# Sprint 10 - Runbook localhost

## Variables mínimas

```bash
API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## URLs SEO nuevas

- `http://localhost:3000/colegios-en-longchamps`
- `http://localhost:3000/sitemap.xml`
- `http://localhost:3000/robots.txt`

## Validación API SEO

```bash
curl "http://localhost:4000/v1/schools/seo/cities?country=AR&limit=20"

curl "http://localhost:4000/v1/schools/seo/cities/longchamps"

curl "http://localhost:4000/v1/schools/seo/sitemap?limit=5000"
```

## Comandos de validación

```bash
corepack pnpm --filter @eduadvisor/api build
corepack pnpm --filter @eduadvisor/web lint
corepack pnpm --filter @eduadvisor/web build
```
