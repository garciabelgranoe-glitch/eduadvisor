import { Module } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { SearchIndexService } from "../search/search-index.service";
import { SchoolsController } from "./schools.controller";
import { SchoolsService } from "./schools.service";

@Module({
  controllers: [SchoolsController],
  providers: [SchoolsService, AdminApiKeyGuard, SearchIndexService],
  exports: [SchoolsService]
})
export class SchoolsModule {}
