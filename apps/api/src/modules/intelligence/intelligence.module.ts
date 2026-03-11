import { Module } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { IntelligenceController } from "./intelligence.controller";
import { IntelligenceService } from "./intelligence.service";

@Module({
  controllers: [IntelligenceController],
  providers: [IntelligenceService, AdminApiKeyGuard]
})
export class IntelligenceModule {}
