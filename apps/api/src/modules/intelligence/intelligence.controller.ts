import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { AdminScopes } from "../../common/guards/admin-scope.decorator";
import { ListMarketInsightsDto } from "./dto/list-market-insights.dto";
import { IntelligenceService } from "./intelligence.service";

@Controller("market-insights")
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Get()
  async list(@Query() query: ListMarketInsightsDto) {
    return this.intelligenceService.list(query);
  }

  @Post("recompute")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async recompute() {
    return this.intelligenceService.recomputeDailySnapshots();
  }
}
