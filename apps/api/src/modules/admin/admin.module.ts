import { Module } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { SchoolsModule } from "../schools/schools.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [SchoolsModule],
  controllers: [AdminController],
  providers: [AdminService, AdminApiKeyGuard]
})
export class AdminModule {}
