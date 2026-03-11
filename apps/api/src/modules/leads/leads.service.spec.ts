import { ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { LeadStatus, SchoolLevel, SchoolProfileStatus } from "@prisma/client";
import { CacheService } from "../../common/cache/cache.service";
import { PrismaService } from "../../prisma/prisma.service";
import { LeadsService } from "./leads.service";

describe("LeadsService", () => {
  const prismaMock = {
    school: {
      findUnique: jest.fn()
    },
    lead: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    }
  } as unknown as PrismaService;

  const cacheMock = {
    invalidateNamespace: jest.fn()
  } as unknown as CacheService;

  let service: LeadsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LeadsService(prismaMock, cacheMock);
  });

  it("creates a lead with normalized fields and invalidates insights cache", async () => {
    (prismaMock.school.findUnique as jest.Mock).mockResolvedValue({
      id: "school-1",
      active: true,
      profileStatus: SchoolProfileStatus.PREMIUM,
      name: "Colegio Uno",
      slug: "colegio-uno",
      email: "info@colegio-uno.com",
      phone: "+541112345678"
    });
    (prismaMock.lead.findFirst as jest.Mock).mockResolvedValue(null);
    (prismaMock.lead.create as jest.Mock).mockResolvedValue({
      id: "lead-1",
      schoolId: "school-1",
      parentName: "Ana Perez",
      childAge: 8,
      educationLevel: SchoolLevel.PRIMARIA,
      phone: "+541199999999",
      email: "ana@example.com",
      status: LeadStatus.NEW,
      createdAt: new Date("2026-03-05T00:00:00.000Z")
    });

    const result = await service.createLead({
      schoolId: "school-1",
      parentName: "  Ana Perez  ",
      childAge: 8,
      educationLevel: SchoolLevel.PRIMARIA,
      phone: "  +541199999999  ",
      email: " ANA@EXAMPLE.COM "
    });

    expect(prismaMock.lead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          parentName: "Ana Perez",
          phone: "+541199999999",
          email: "ana@example.com"
        })
      })
    );
    expect(cacheMock.invalidateNamespace).toHaveBeenCalledWith("insights");
    expect(result.status).toBe(LeadStatus.NEW);
  });

  it("throws conflict when duplicate lead exists", async () => {
    (prismaMock.school.findUnique as jest.Mock).mockResolvedValue({
      id: "school-1",
      active: true,
      profileStatus: SchoolProfileStatus.PREMIUM
    });
    (prismaMock.lead.findFirst as jest.Mock).mockResolvedValue({
      id: "existing-lead"
    });

    await expect(
      service.createLead({
        schoolId: "school-1",
        parentName: "Ana",
        childAge: 7,
        educationLevel: SchoolLevel.PRIMARIA,
        phone: "+5411",
        email: "ana@example.com"
      })
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("throws forbidden when school is not premium", async () => {
    (prismaMock.school.findUnique as jest.Mock).mockResolvedValue({
      id: "school-1",
      active: true,
      profileStatus: SchoolProfileStatus.BASIC
    });

    await expect(
      service.createLead({
        schoolId: "school-1",
        parentName: "Ana",
        childAge: 7,
        educationLevel: SchoolLevel.PRIMARIA,
        phone: "+54115554444",
        email: "ana@example.com"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("throws not found when updating missing lead", async () => {
    (prismaMock.lead.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      service.updateLeadStatus("missing-lead", {
        status: LeadStatus.CONTACTED
      })
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
