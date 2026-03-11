import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { CacheService } from "../../common/cache/cache.service";
import { SearchDto } from "./dto/search.dto";
import { SchoolsService } from "../schools/schools.service";
import { SearchIndexService } from "./search-index.service";

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly schoolsService: SchoolsService,
    private readonly searchIndexService: SearchIndexService,
    private readonly cache: CacheService
  ) {}

  async search(query: SearchDto) {
    return this.cache.getOrSetJson("search", query, 90, async () => {
      try {
        const result = await this.searchIndexService.search(query);

        return {
          engine: "meilisearch",
          query: query.q ?? null,
          ...result
        };
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }

        this.logger.warn(`Search fallback to postgres: ${error instanceof Error ? error.message : String(error)}`);
      }

      const result = await this.schoolsService.searchSchools(query);

      return {
        engine: "postgres_fallback",
        query: query.q ?? null,
        ...result
      };
    });
  }

  async reindex() {
    const response = await this.searchIndexService.reindexSchools();
    await this.cache.invalidateMany([
      "search",
      "schools:list",
      "schools:search",
      "schools:detail",
      "rankings",
      "insights"
    ]);
    return response;
  }

  async health() {
    return this.searchIndexService.getHealth();
  }
}
