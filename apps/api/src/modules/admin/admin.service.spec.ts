import { LeadStatus, UserRole } from "@prisma/client";
import { CacheService } from "../../common/cache/cache.service";
import { PrismaService } from "../../prisma/prisma.service";
import { AdminService } from "./admin.service";

describe("AdminService growth funnel", () => {
  const prismaMock = {
    school: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    schoolSubscription: {
      create: jest.fn()
    },
    user: {
      count: jest.fn()
    },
    savedSchool: {
      findMany: jest.fn()
    },
    savedComparison: {
      findMany: jest.fn()
    },
    lead: {
      findMany: jest.fn()
    },
    growthFunnelSnapshot: {
      findMany: jest.fn(),
      upsert: jest.fn()
    }
  } as unknown as PrismaService;
  const cacheMock = {
    invalidateMany: jest.fn()
  } as unknown as CacheService;

  let service: AdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminService(prismaMock, cacheMock);
  });

  it("computes funnel stages and recommendations", async () => {
    (prismaMock.user.count as jest.Mock).mockResolvedValue(10);
    (prismaMock.savedSchool.findMany as jest.Mock).mockResolvedValue([{ userId: "p1" }, { userId: "p2" }]);
    (prismaMock.savedComparison.findMany as jest.Mock).mockResolvedValue([{ userId: "p1" }]);
    (prismaMock.lead.findMany as jest.Mock)
      .mockResolvedValueOnce([{ userId: "p1" }])
      .mockResolvedValueOnce([]);
    (prismaMock.growthFunnelSnapshot.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.getGrowthFunnel({
      windowDays: 30,
      trendDays: 14
    });

    expect(prismaMock.user.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          role: UserRole.PARENT
        }
      })
    );
    expect(prismaMock.lead.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          status: LeadStatus.CLOSED
        })
      })
    );
    expect(result.stages.parentsWithSavedSchools).toBe(2);
    expect(result.stages.parentsWithComparisons).toBe(1);
    expect(result.stages.parentsWithLeads).toBe(1);
    expect(result.stages.parentsWithClosedLeads).toBe(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("persists recomputed snapshot", async () => {
    (prismaMock.user.count as jest.Mock).mockResolvedValue(4);
    (prismaMock.savedSchool.findMany as jest.Mock).mockResolvedValue([{ userId: "p1" }, { userId: "p2" }]);
    (prismaMock.savedComparison.findMany as jest.Mock).mockResolvedValue([{ userId: "p1" }]);
    (prismaMock.lead.findMany as jest.Mock)
      .mockResolvedValueOnce([{ userId: "p1" }])
      .mockResolvedValueOnce([{ userId: "p1" }]);
    (prismaMock.growthFunnelSnapshot.upsert as jest.Mock).mockResolvedValue({
      date: new Date("2026-03-06T00:00:00.000Z"),
      windowDays: 30
    });

    const result = await service.recomputeGrowthFunnel({
      windowDays: 30
    });

    expect(prismaMock.growthFunnelSnapshot.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          parentsTotal: 4,
          parentsWithSavedSchools: 2,
          parentsWithComparisons: 1,
          parentsWithLeads: 1,
          parentsWithClosedLeads: 1
        })
      })
    );
    expect(result.windowDays).toBe(30);
    expect(result.conversion.toClosedLead).toBeGreaterThan(0);
  });

  it("updates school subscription and invalidates catalog caches", async () => {
    (prismaMock.school.findUnique as jest.Mock).mockResolvedValue({
      id: "school-1",
      profileStatus: "VERIFIED"
    });
    (prismaMock.schoolSubscription.create as jest.Mock).mockResolvedValue({
      id: "sub-1",
      schoolId: "school-1",
      status: "ACTIVE",
      planCode: "premium",
      priceMonthly: 99000,
      startsAt: new Date("2026-03-06T00:00:00.000Z"),
      endsAt: new Date("2027-03-06T00:00:00.000Z"),
      createdAt: new Date("2026-03-06T00:00:00.000Z")
    });
    (prismaMock.school.update as jest.Mock).mockResolvedValue({ id: "school-1" });

    const result = await service.updateSchoolSubscription("school-1", {
      status: "ACTIVE",
      planCode: "premium",
      priceMonthly: 99000,
      durationMonths: 12
    });

    expect(prismaMock.school.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "school-1" },
        data: expect.objectContaining({
          profileStatus: "PREMIUM"
        })
      })
    );
    expect(cacheMock.invalidateMany).toHaveBeenCalled();
    expect(result.status).toBe("ACTIVE");
  });
});
