import { Module } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { SchoolsController } from "./schools.controller";
import { SchoolsService } from "./schools.service";

@Module({
  controllers: [SchoolsController],
  providers: [SchoolsService, AdminApiKeyGuard],
  exports: [SchoolsService]
})
export class SchoolsModule {}
