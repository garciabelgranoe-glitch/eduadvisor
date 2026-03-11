import { Module } from "@nestjs/common";
import { AdminApiKeyGuard } from "../common/guards/admin-api-key.guard";
import { SearchModule } from "../modules/search/search.module";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

@Module({
  imports: [SearchModule],
  controllers: [HealthController],
  providers: [HealthService, AdminApiKeyGuard]
})
export class HealthModule {}
