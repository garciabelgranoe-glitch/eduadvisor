import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ReviewStatus, SchoolProfileStatus } from "@prisma/client";
import { CacheService } from "../../common/cache/cache.service";
import { ProductEventsService } from "../product-events/product-events.service";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ListModerationQueueDto } from "./dto/list-moderation-queue.dto";
import { ListSchoolReviewsDto } from "./dto/list-school-reviews.dto";
import { ModerateReviewDto } from "./dto/moderate-review.dto";
import { UpdateSchoolReviewResponseDto } from "./dto/update-school-review-response.dto";

@Injectable()
export class ReviewsService {
  private static readonly managementEnabledStatuses = new Set<SchoolProfileStatus>([
    SchoolProfileStatus.VERIFIED,
    SchoolProfileStatus.PREMIUM
  ]);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly productEvents: ProductEventsService
  ) {}

  async createReview(payload: CreateReviewDto) {
    const school = await this.prisma.school.findUnique({
      where: { id: payload.schoolId },
      select: { id: true, active: true }
    });

    if (!school || !school.active) {
      throw new NotFoundException("School not found");
    }

    const review = await this.prisma.review.create({
      data: {
        schoolId: payload.schoolId,
        userId: payload.userId,
        rating: payload.rating,
        comment: payload.comment.trim(),
        status: ReviewStatus.PENDING
      }
    });

    return {
      id: review.id,
      schoolId: review.schoolId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      createdAt: review.createdAt
    };
  }

  async listSchoolReviews(schoolId: string, query: ListSchoolReviewsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, active: true }
    });

    if (!school || !school.active) {
      throw new NotFoundException("School not found");
    }

    const where = {
      schoolId,
      status: ReviewStatus.APPROVED
    };

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          rating: true,
          comment: true,
          schoolResponse: true,
          schoolResponseAt: true,
          status: true,
          createdAt: true
        }
      }),
      this.prisma.review.count({ where })
    ]);

    return {
      items,
      meta: this.buildMeta(total, page, limit)
    };
  }

  async listModerationQueue(query: ListModerationQueueDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      status: query.status ?? ReviewStatus.PENDING,
      schoolId: query.schoolId
    };

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          rating: true,
          comment: true,
          status: true,
          createdAt: true,
          school: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      this.prisma.review.count({ where })
    ]);

    return {
      items,
      meta: this.buildMeta(total, page, limit)
    };
  }

  async moderateReview(reviewId: string, payload: ModerateReviewDto) {
    if (payload.status === ReviewStatus.PENDING) {
      throw new BadRequestException("Moderation status must be APPROVED or REJECTED");
    }

    const existing = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        schoolId: true,
        status: true,
        rating: true,
        school: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    if (!existing) {
      throw new NotFoundException("Review not found");
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        status: payload.status
      },
        select: {
          id: true,
          schoolId: true,
          rating: true,
          comment: true,
          schoolResponse: true,
          schoolResponseAt: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
    });

    await this.cache.invalidateMany([
      "schools:list",
      "schools:search",
      "schools:detail",
      "schools:seo:cities",
      "schools:seo:city-detail",
      "rankings",
      "insights",
      "search"
    ]);

    if (existing.status !== ReviewStatus.APPROVED && updated.status === ReviewStatus.APPROVED) {
      try {
        await this.productEvents.emitReviewApproved({
          reviewId: updated.id,
          schoolId: updated.schoolId,
          schoolName: existing.school.name,
          schoolSlug: existing.school.slug,
          rating: updated.rating
        });
      } catch (error) {
        // Alerts must not block moderation flow.
        // eslint-disable-next-line no-console
        console.warn("review-approved-event-failed", {
          reviewId: updated.id,
          schoolId: updated.schoolId,
          error
        });
      }
    }

    return updated;
  }

  async updateSchoolResponse(reviewId: string, payload: UpdateSchoolReviewResponseDto) {
    const normalizedSchoolId = payload.schoolId.trim();
    const normalizedResponse = payload.response.trim();

    if (normalizedSchoolId.length === 0) {
      throw new BadRequestException("schoolId is required");
    }

    if (normalizedResponse.length > 0 && normalizedResponse.length < 10) {
      throw new BadRequestException("School response must be at least 10 characters");
    }

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        schoolId: true,
        status: true,
        school: {
          select: {
            profileStatus: true
          }
        }
      }
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.schoolId !== normalizedSchoolId) {
      throw new ForbiddenException("Review does not belong to requested school");
    }

    if (review.status !== ReviewStatus.APPROVED) {
      throw new BadRequestException("Only approved reviews can receive school responses");
    }

    if (!ReviewsService.managementEnabledStatuses.has(review.school.profileStatus)) {
      throw new ForbiddenException("School profile must be VERIFIED or PREMIUM to respond reviews");
    }

    const responseAt = normalizedResponse.length > 0 ? new Date() : null;
    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        schoolResponse: normalizedResponse.length > 0 ? normalizedResponse : null,
        schoolResponseAt: responseAt
      },
      select: {
        id: true,
        schoolId: true,
        rating: true,
        comment: true,
        schoolResponse: true,
        schoolResponseAt: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await this.cache.invalidateMany([
      "schools:list",
      "schools:search",
      "schools:detail",
      "schools:seo:cities",
      "schools:seo:city-detail",
      "rankings",
      "insights",
      "search"
    ]);

    return updated;
  }

  private buildMeta(total: number, page: number, limit: number) {
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page * limit < total
    };
  }
}
