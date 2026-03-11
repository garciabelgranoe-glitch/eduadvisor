import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { MatchRecommendationDto } from "./dto/match-recommendation.dto";
import { MatchesService } from "./matches.service";

@Controller("matches")
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async list(@Query() query: MatchRecommendationDto) {
    return this.matchesService.recommend(query);
  }

  @Post("recommend")
  async recommend(@Body() payload: MatchRecommendationDto) {
    return this.matchesService.recommend(payload);
  }
}
