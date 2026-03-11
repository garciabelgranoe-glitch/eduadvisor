import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminApiKeyGuard } from "../common/guards/admin-api-key.guard";
import { AdminScopes } from "../common/guards/admin-scope.decorator";
import { SkipRateLimit } from "../common/rate-limit/rate-limit.decorator";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @SkipRateLimit()
  checkLiveness() {
    return this.healthService.getLiveness();
  }

  @Get("live")
  @SkipRateLimit()
  checkLive() {
    return this.healthService.getLiveness();
  }

  @Get("ready")
  @SkipRateLimit()
  async checkReadiness() {
    return this.healthService.getReadiness();
  }

  @Get("metrics")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  checkMetrics() {
    return this.healthService.getMetrics();
  }
}
