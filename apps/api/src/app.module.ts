import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { CacheModule } from "./common/cache/cache.module";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor";
import { ObservabilityModule } from "./common/observability/observability.module";
import { RateLimitGuard } from "./common/rate-limit/rate-limit.guard";
import { RateLimitService } from "./common/rate-limit/rate-limit.service";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BillingModule } from "./modules/billing/billing.module";
import { HealthModule } from "./health/health.module";
import { IntelligenceModule } from "./modules/intelligence/intelligence.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { MatchesModule } from "./modules/matches/matches.module";
import { ParentsModule } from "./modules/parents/parents.module";
import { ProductEventsModule } from "./modules/product-events/product-events.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RankingsModule } from "./modules/rankings/rankings.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { SchoolsModule } from "./modules/schools/schools.module";
import { SearchModule } from "./modules/search/search.module";

@Module({
  imports: [
    CacheModule,
    ObservabilityModule,
    PrismaModule,
    HealthModule,
    BillingModule,
    SchoolsModule,
    ReviewsModule,
    LeadsModule,
    ParentsModule,
    ProductEventsModule,
    AuthModule,
    SearchModule,
    MatchesModule,
    IntelligenceModule,
    RankingsModule,
    AdminModule
  ],
  providers: [
    RateLimitService,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor
    }
  ]
})
export class AppModule {}
