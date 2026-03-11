# Sprint 6 - Estructura de carpetas (Reviews)

```text
apps/api/src/
  common/guards/
    admin-api-key.guard.ts
  modules/reviews/
    dto/
      create-review.dto.ts
      list-school-reviews.dto.ts
      list-moderation-queue.dto.ts
      moderate-review.dto.ts
    reviews.controller.ts
    reviews.service.ts
    reviews.module.ts

apps/web/
  app/review/page.tsx
  app/admin/reviews/page.tsx
  app/api/reviews/route.ts
  app/api/reviews/moderate/route.ts
  components/sections/review-form.tsx
  components/admin/review-moderation-queue.tsx
```
