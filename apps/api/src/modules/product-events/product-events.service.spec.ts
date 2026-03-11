import { ProductEventType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { ProductEventsService } from "./product-events.service";

describe("ProductEventsService", () => {
  const prismaMock = {
    productEvent: {
      create: jest.fn(),
      update: jest.fn()
    },
    savedSchool: {
      findMany: jest.fn()
    },
    parentAlert: {
      createMany: jest.fn()
    }
  } as unknown as PrismaService;

  let service: ProductEventsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductEventsService(prismaMock);
  });

  it("creates product event and dispatches alerts to saved-school watchers", async () => {
    (prismaMock.productEvent.create as jest.Mock).mockResolvedValue({ id: "evt-1" });
    (prismaMock.savedSchool.findMany as jest.Mock).mockResolvedValue([{ userId: "parent-1" }, { userId: "parent-2" }]);
    (prismaMock.parentAlert.createMany as jest.Mock).mockResolvedValue({ count: 2 });
    (prismaMock.productEvent.update as jest.Mock).mockResolvedValue({ id: "evt-1", alertsCreated: 2 });

    const result = await service.emitReviewApproved({
      reviewId: "review-1",
      schoolId: "school-1",
      schoolName: "Colegio Uno",
      schoolSlug: "colegio-uno",
      rating: 5
    });

    expect(prismaMock.productEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: ProductEventType.REVIEW_APPROVED,
          dedupeKey: "review-approved:review-1"
        })
      })
    );
    expect(prismaMock.parentAlert.createMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([expect.objectContaining({ userId: "parent-1" })])
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        duplicate: false,
        skipped: false,
        alertsCreated: 2
      })
    );
  });

  it("skips duplicate events by dedupe key", async () => {
    (prismaMock.productEvent.create as jest.Mock).mockRejectedValue({ code: "P2002" });

    const result = await service.emitReviewApproved({
      reviewId: "review-1",
      schoolId: "school-1",
      schoolName: "Colegio Uno",
      schoolSlug: "colegio-uno",
      rating: 4
    });

    expect(prismaMock.savedSchool.findMany).not.toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        duplicate: true,
        skipped: true,
        reason: "DUPLICATE_DEDUPE_KEY"
      })
    );
  });

  it("skips score change events below threshold", async () => {
    const result = await service.emitEduAdvisorScoreChanged({
      schoolId: "school-1",
      schoolName: "Colegio Uno",
      schoolSlug: "colegio-uno",
      previousScore: 82.1,
      score: 84.8,
      snapshotDate: new Date("2026-03-06T00:00:00.000Z")
    });

    expect(prismaMock.productEvent.create).not.toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        skipped: true,
        reason: "SCORE_DELTA_BELOW_THRESHOLD",
        alertsCreated: 0
      })
    );
  });
});
