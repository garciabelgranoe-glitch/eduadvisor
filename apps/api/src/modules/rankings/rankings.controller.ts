import { Controller, Get, Query } from "@nestjs/common";
import { ListRankingsDto } from "./dto/list-rankings.dto";
import { RankingsService } from "./rankings.service";

@Controller("rankings")
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Get()
  async list(@Query() query: ListRankingsDto) {
    return this.rankingsService.list(query);
  }
}
