import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { AdminScopes } from "../../common/guards/admin-scope.decorator";
import { SearchDto } from "./dto/search.dto";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async get(@Query() query: SearchDto) {
    return this.searchService.search(query);
  }

  @Get("health")
  async health() {
    return this.searchService.health();
  }

  @Post("reindex")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async reindex() {
    return this.searchService.reindex();
  }
}
