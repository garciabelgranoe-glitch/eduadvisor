import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AdminApiKeyGuard } from "../../common/guards/admin-api-key.guard";
import { AdminScopes } from "../../common/guards/admin-scope.decorator";
import { RateLimit } from "../../common/rate-limit/rate-limit.decorator";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ListModerationQueueDto } from "./dto/list-moderation-queue.dto";
import { ListSchoolReviewsDto } from "./dto/list-school-reviews.dto";
import { ModerateReviewDto } from "./dto/moderate-review.dto";
import { UpdateSchoolReviewResponseDto } from "./dto/update-school-review-response.dto";
import { ReviewsService } from "./reviews.service";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @RateLimit({ limit: 25, windowMs: 60_000 })
  async create(@Body() payload: CreateReviewDto) {
    return this.reviewsService.createReview(payload);
  }

  @Get("school/:schoolId")
  async listSchoolReviews(@Param("schoolId") schoolId: string, @Query() query: ListSchoolReviewsDto) {
    return this.reviewsService.listSchoolReviews(schoolId, query);
  }

  @Get("moderation/queue")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("read")
  async moderationQueue(@Query() query: ListModerationQueueDto) {
    return this.reviewsService.listModerationQueue(query);
  }

  @Patch(":reviewId/moderate")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async moderate(@Param("reviewId") reviewId: string, @Body() payload: ModerateReviewDto) {
    return this.reviewsService.moderateReview(reviewId, payload);
  }

  @Patch(":reviewId/response")
  @UseGuards(AdminApiKeyGuard)
  @AdminScopes("write")
  async updateSchoolResponse(
    @Param("reviewId") reviewId: string,
    @Body() payload: UpdateSchoolReviewResponseDto
  ) {
    return this.reviewsService.updateSchoolResponse(reviewId, payload);
  }
}
