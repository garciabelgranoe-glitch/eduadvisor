import { Module } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, AdminApiKeyGuard]
})
export class ReviewsModule {}
