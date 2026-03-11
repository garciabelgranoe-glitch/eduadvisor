import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { LeadStatus, SchoolProfileStatus } from "@prisma/client";
import { CacheService } from "../../common/cache/cache.service";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { ListSchoolLeadsDto } from "./dto/list-school-leads.dto";
import { UpdateLeadStatusDto } from "./dto/update-lead-status.dto";

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService
  ) {}

  async createLead(payload: CreateLeadDto) {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedPhone = payload.phone.trim();
    const normalizedParentName = payload.parentName.trim();

    const school = await this.prisma.school.findUnique({
      where: { id: payload.schoolId },
      select: {
        id: true,
        active: true,
        profileStatus: true,
        name: true,
        slug: true,
        email: true,
        phone: true
      }
    });

    if (!school || !school.active) {
      throw new NotFoundException("School not found");
    }

    if (school.profileStatus !== SchoolProfileStatus.PREMIUM) {
      throw new ForbiddenException("Leads are only enabled for premium schools");
    }

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const duplicate = await this.prisma.lead.findFirst({
      where: {
        schoolId: payload.schoolId,
        email: normalizedEmail,
        childAge: payload.childAge,
        educationLevel: payload.educationLevel,
        createdAt: {
          gte: lastWeek
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (duplicate) {
      throw new ConflictException("A similar lead was already submitted recently");
    }

    const lead = await this.prisma.lead.create({
      data: {
        schoolId: payload.schoolId,
        parentName: normalizedParentName,
        childAge: payload.childAge,
        educationLevel: payload.educationLevel,
        phone: normalizedPhone,
        email: normalizedEmail,
        status: LeadStatus.NEW
      }
    });

    await this.cache.invalidateNamespace("insights");

    return {
      id: lead.id,
      schoolId: lead.schoolId,
      parentName: lead.parentName,
      childAge: lead.childAge,
      educationLevel: lead.educationLevel,
      phone: lead.phone,
      email: lead.email,
      status: lead.status,
      createdAt: lead.createdAt,
      targetSchool: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        email: school.email,
        phone: school.phone
      }
    };
  }

  async listSchoolLeads(schoolId: string, query: ListSchoolLeadsDto) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        slug: true,
        active: true
      }
    });

    if (!school || !school.active) {
      throw new NotFoundException("School not found");
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      schoolId,
      status: query.status,
      OR: query.query
        ? [
            { parentName: { contains: query.query, mode: "insensitive" as const } },
            { email: { contains: query.query, mode: "insensitive" as const } },
            { phone: { contains: query.query } }
          ]
        : undefined
    };

    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        orderBy:
          query.sortBy === "childAge"
            ? { childAge: query.sortOrder ?? "desc" }
            : { createdAt: query.sortOrder ?? "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          parentName: true,
          childAge: true,
          educationLevel: true,
          phone: true,
          email: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      this.prisma.lead.count({ where })
    ]);

    return {
      school,
      items,
      meta: this.buildMeta(total, page, limit)
    };
  }

  async getSchoolLeadSummary(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        slug: true,
        active: true
      }
    });

    if (!school || !school.active) {
      throw new NotFoundException("School not found");
    }

    const leads = await this.prisma.lead.groupBy({
      by: ["status"],
      where: { schoolId },
      _count: { _all: true }
    });

    const totalsByStatus: Record<LeadStatus, number> = {
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      CLOSED: 0
    };

    for (const item of leads) {
      totalsByStatus[item.status] = item._count._all;
    }

    const total = Object.values(totalsByStatus).reduce((acc, value) => acc + value, 0);

    return {
      school,
      total,
      byStatus: totalsByStatus
    };
  }

  async getLeadById(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        schoolId: true,
        parentName: true,
        childAge: true,
        educationLevel: true,
        phone: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        school: {
          select: {
            id: true,
            name: true,
            slug: true,
            profileStatus: true
          }
        }
      }
    });

    if (!lead) {
      throw new NotFoundException("Lead not found");
    }

    return lead;
  }

  async updateLeadStatus(leadId: string, payload: UpdateLeadStatusDto) {
    const existing = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        status: true
      }
    });

    if (!existing) {
      throw new NotFoundException("Lead not found");
    }

    const lead = await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        status: payload.status
      },
      select: {
        id: true,
        schoolId: true,
        parentName: true,
        childAge: true,
        educationLevel: true,
        phone: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await this.cache.invalidateNamespace("insights");

    return lead;
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
