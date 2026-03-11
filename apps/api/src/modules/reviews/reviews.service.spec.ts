import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { ReviewStatus, SchoolProfileStatus } from "@prisma/client";
import { CacheService } from "../../common/cache/cache.service";
import { ProductEventsService } from "../product-events/product-events.service";
import { PrismaService } from "../../prisma/prisma.service";
import { ReviewsService } from "./reviews.service";

describe("ReviewsService", () => {
  const prismaMock = {
    school: {
      findUnique: jest.fn()
    },
    review: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    }
  } as unknown as PrismaService;

  const cacheMock = {
    invalidateMany: jest.fn()
  } as unknown as CacheService;
  const productEventsMock = {
    emitReviewApproved: jest.fn()
  } as unknown as ProductEventsService;

  let service: ReviewsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReviewsService(prismaMock, cacheMock, productEventsMock);
  });

  it("creates pending review and trims comment", async () => {
    (prismaMock.school.findUnique as jest.Mock).mockResolvedValue({
      id: "school-1",
      active: true
    });
    (prismaMock.review.create as jest.Mock).mockResolvedValue({
      id: "review-1",
      schoolId: "school-1",
      userId: null,
      rating: 4,
      comment: "Muy buen colegio",
      status: ReviewStatus.PENDING,
      createdAt: new Date("2026-03-05T00:00:00.000Z")
    });

    const created = await service.createReview({
      schoolId: "school-1",
      rating: 4,
      comment: "  Muy buen colegio  "
    });

    expect(prismaMock.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          comment: "Muy buen colegio",
          status: ReviewStatus.PENDING
        })
      })
    );
    expect(created.status).toBe(ReviewStatus.PENDING);
  });

  it("rejects moderation with pending status", async () => {
    await expect(
      service.moderateReview("review-1", {
        status: ReviewStatus.PENDING
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("invalidates read caches after moderation", async () => {
    (prismaMock.review.findUnique as jest.Mock).mockResolvedValue({
      id: "review-1",
      schoolId: "school-1",
      status: ReviewStatus.PENDING,
      rating: 5,
      school: {
        name: "Colegio Uno",
        slug: "colegio-uno"
      }
    });
    (prismaMock.review.update as jest.Mock).mockResolvedValue({
      id: "review-1",
      schoolId: "school-1",
      rating: 5,
      comment: "Excelente",
      status: ReviewStatus.APPROVED,
      createdAt: new Date("2026-03-05T00:00:00.000Z"),
      updatedAt: new Date("2026-03-05T00:10:00.000Z")
    });

    await service.moderateReview("review-1", {
      status: ReviewStatus.APPROVED
    });

    expect(cacheMock.invalidateMany).toHaveBeenCalledWith([
      "schools:list",
      "schools:search",
      "schools:detail",
      "schools:seo:cities",
      "schools:seo:city-detail",
      "rankings",
      "insights",
      "search"
    ]);
    expect(productEventsMock.emitReviewApproved).toHaveBeenCalledWith(
      expect.objectContaining({
        reviewId: "review-1",
        schoolId: "school-1"
      })
    );
  });

  it("throws not found when school does not exist", async () => {
    (prismaMock.school.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      service.createReview({
        schoolId: "missing-school",
        rating: 5,
        comment: "Excelente"
      })
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("updates school response for approved review", async () => {
    (prismaMock.review.findUnique as jest.Mock).mockResolvedValue({
      id: "review-1",
      schoolId: "school-1",
      status: ReviewStatus.APPROVED,
      school: {
        profileStatus: SchoolProfileStatus.VERIFIED
      }
    });
    (prismaMock.review.update as jest.Mock).mockResolvedValue({
      id: "review-1",
      schoolId: "school-1",
      rating: 5,
      comment: "Excelente",
      schoolResponse: "Gracias por tu comentario.",
      schoolResponseAt: new Date("2026-03-06T00:00:00.000Z"),
      status: ReviewStatus.APPROVED,
      createdAt: new Date("2026-03-05T00:00:00.000Z"),
      updatedAt: new Date("2026-03-06T00:00:00.000Z")
    });

    const result = await service.updateSchoolResponse("review-1", {
      schoolId: "school-1",
      response: "  Gracias por tu comentario.  "
    });

    expect(prismaMock.review.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "review-1" },
        data: expect.objectContaining({
          schoolResponse: "Gracias por tu comentario."
        })
      })
    );
    expect(result.schoolResponse).toBe("Gracias por tu comentario.");
    expect(cacheMock.invalidateMany).toHaveBeenCalled();
  });

  it("blocks school response for non-verified school profile", async () => {
    (prismaMock.review.findUnique as jest.Mock).mockResolvedValue({
      id: "review-1",
      schoolId: "school-1",
      status: ReviewStatus.APPROVED,
      school: {
        profileStatus: SchoolProfileStatus.BASIC
      }
    });

    await expect(
      service.updateSchoolResponse("review-1", {
        schoolId: "school-1",
        response: "Respuesta institucional válida."
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects short school response text", async () => {
    await expect(
      service.updateSchoolResponse("review-1", {
        schoolId: "school-1",
        response: "corto"
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
