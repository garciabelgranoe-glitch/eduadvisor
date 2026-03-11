import { Module } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { SchoolsModule } from "../schools/schools.module";
import { SearchController } from "./search.controller";
import { SearchIndexService } from "./search-index.service";
import { SearchService } from "./search.service";

@Module({
  imports: [SchoolsModule],
  controllers: [SearchController],
  providers: [SearchService, SearchIndexService, AdminApiKeyGuard],
  exports: [SearchIndexService]
})
export class SearchModule {}
