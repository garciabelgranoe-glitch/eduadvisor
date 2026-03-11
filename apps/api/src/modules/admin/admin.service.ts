import { Injectable, NotFoundException } from "@nestjs/common";
import { LeadStatus, SchoolProfileStatus, SubscriptionStatus, UserRole } from "@prisma/client";
import { CacheService } from "../../common/cache/cache.service";
import { PrismaService } from "../../prisma/prisma.service";
import { GetGrowthFunnelDto } from "./dto/get-growth-funnel.dto";
import { ListAdminSchoolsDto } from "./dto/list-admin-schools.dto";
import { ListProductEventsDto } from "./dto/list-product-events.dto";
import { UpdateSchoolStatusDto } from "./dto/update-school-status.dto";
import { UpdateSchoolSubscriptionDto } from "./dto/update-school-subscription.dto";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService
  ) {}

  async getOverview() {
    const responseSlaThresholdDate = new Date(Date.now() - 72 * 60 * 60 * 1000);

    const [
      schoolsTotal,
      schoolsActive,
      schoolsInactive,
      reviewsPending,
      reviewsApproved,
      reviewsRejected,
      reviewsResponded,
      pendingReviewResponseSlaBreaches,
      reviewResponseAvgRaw,
      reviewResponseWithinSlaRaw,
      respondingSchools,
      schoolsWithApprovedReviews,
      claimGroups,
      leadGroups,
      recentLeads,
      schoolsPerCity
    ] =
      await Promise.all([
        this.prisma.school.count(),
        this.prisma.school.count({ where: { active: true } }),
        this.prisma.school.count({ where: { active: false } }),
        this.prisma.review.count({ where: { status: "PENDING" } }),
        this.prisma.review.count({ where: { status: "APPROVED" } }),
        this.prisma.review.count({ where: { status: "REJECTED" } }),
        this.prisma.review.count({
          where: {
            status: "APPROVED",
            schoolResponseAt: {
              not: null
            }
          }
        }),
        this.prisma.review.count({
          where: {
            status: "APPROVED",
            schoolResponseAt: null,
            createdAt: {
              lte: responseSlaThresholdDate
            }
          }
        }),
        this.prisma.$queryRaw<Array<{ averageHours: number | null }>>`
          SELECT AVG(EXTRACT(EPOCH FROM ("schoolResponseAt" - "createdAt")) / 3600.0) AS "averageHours"
          FROM "Review"
          WHERE status = 'APPROVED'
            AND "schoolResponseAt" IS NOT NULL
        `,
        this.prisma.$queryRaw<Array<{ withinSla: number | null }>>`
          SELECT COUNT(*)::int AS "withinSla"
          FROM "Review"
          WHERE status = 'APPROVED'
            AND "schoolResponseAt" IS NOT NULL
            AND "schoolResponseAt" <= "createdAt" + interval '72 hours'
        `,
        this.prisma.school.count({
          where: {
            reviews: {
              some: {
                status: "APPROVED",
                schoolResponseAt: {
                  not: null
                }
              }
            }
          }
        }),
        this.prisma.school.count({
          where: {
            reviews: {
              some: {
                status: "APPROVED"
              }
            }
          }
        }),
        this.prisma.schoolClaimRequest.groupBy({ by: ["status"], _count: { _all: true } }),
        this.prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
        this.prisma.lead.findMany({
          orderBy: { createdAt: "desc" },
          take: 200,
          select: { createdAt: true }
        }),
        this.prisma.city.findMany({
          select: {
            name: true,
            _count: {
              select: {
                schools: true
              }
            }
          },
          orderBy: {
            schools: {
              _count: "desc"
            }
          },
          take: 5
        })
      ]);

    const leadsByStatus = {
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      CLOSED: 0
    };
    const claimsByStatus = {
      PENDING: 0,
      UNDER_REVIEW: 0,
      APPROVED: 0,
      REJECTED: 0
    };

    for (const item of claimGroups) {
      claimsByStatus[item.status] = item._count._all;
    }

    for (const item of leadGroups) {
      leadsByStatus[item.status] = item._count._all;
    }

    const leadsTotal = Object.values(leadsByStatus).reduce((sum, value) => sum + value, 0);
    const leadTrend = this.buildMonthlyLeadTrend(recentLeads.map((item) => item.createdAt));
    const reviewsAwaitingResponse = Math.max(reviewsApproved - reviewsResponded, 0);
    const responseCoverageRate =
      reviewsApproved === 0 ? 0 : Number(((reviewsResponded / reviewsApproved) * 100).toFixed(1));
    const averageResponseHours = Number(reviewResponseAvgRaw[0]?.averageHours ?? 0);
    const normalizedAverageResponseHours = Number.isFinite(averageResponseHours)
      ? Number(averageResponseHours.toFixed(1))
      : null;
    const responsesWithinSla = Number(reviewResponseWithinSlaRaw[0]?.withinSla ?? 0);
    const withinSlaRate =
      reviewsResponded === 0 ? 0 : Number(((responsesWithinSla / reviewsResponded) * 100).toFixed(1));
    const schoolAdoptionRate =
      schoolsWithApprovedReviews === 0
        ? 0
        : Number(((respondingSchools / schoolsWithApprovedReviews) * 100).toFixed(1));

    return {
      schools: {
        total: schoolsTotal,
        active: schoolsActive,
        inactive: schoolsInactive
      },
      reviews: {
        pending: reviewsPending,
        approved: reviewsApproved,
        rejected: reviewsRejected,
        total: reviewsPending + reviewsApproved + reviewsRejected,
        response: {
          responded: reviewsResponded,
          awaitingResponse: reviewsAwaitingResponse,
          responseCoverageRate,
          averageResponseHours: normalizedAverageResponseHours,
          responsesWithinSla,
          withinSlaRate,
          pendingSlaBreaches: pendingReviewResponseSlaBreaches,
          respondingSchools,
          schoolsWithApprovedReviews,
          schoolAdoptionRate
        }
      },
      claims: {
        total: claimsByStatus.PENDING + claimsByStatus.UNDER_REVIEW + claimsByStatus.APPROVED + claimsByStatus.REJECTED,
        byStatus: claimsByStatus
      },
      leads: {
        total: leadsTotal,
        byStatus: leadsByStatus,
        conversionRate: leadsTotal === 0 ? 0 : Number(((leadsByStatus.CLOSED / leadsTotal) * 100).toFixed(1))
      },
      leadTrend,
      topCities: schoolsPerCity.map((item) => ({
        city: item.name,
        schools: item._count.schools
      }))
    };
  }

  async listSchools(query: ListAdminSchoolsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;

    const where = {
      active:
        query.status === "active" ? true : query.status === "inactive" ? false : undefined,
      OR: query.q
        ? [
            { name: { contains: query.q, mode: "insensitive" as const } },
            { slug: { contains: query.q, mode: "insensitive" as const } },
            { city: { name: { contains: query.q, mode: "insensitive" as const } } },
            { province: { name: { contains: query.q, mode: "insensitive" as const } } }
          ]
        : undefined
    };

    const [items, total] = await Promise.all([
      this.prisma.school.findMany({
        where,
        include: {
          city: { select: { name: true } },
          province: { select: { name: true } },
          country: { select: { name: true, isoCode: true } },
          levels: { select: { level: true } },
          subscriptions: {
            orderBy: {
              startsAt: "desc"
            },
            take: 1,
            select: {
              id: true,
              status: true,
              planCode: true,
              priceMonthly: true,
              startsAt: true,
              endsAt: true
            }
          },
          _count: {
            select: {
              leads: true,
              reviews: true
            }
          }
        },
        orderBy:
          query.sortBy === "createdAt"
            ? { createdAt: query.sortOrder ?? "desc" }
            : { name: query.sortOrder ?? "asc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.school.count({ where })
    ]);

    return {
      items: items.map((school) => ({
        id: school.id,
        name: school.name,
        slug: school.slug,
        active: school.active,
        profileStatus: school.profileStatus,
        levels: school.levels.map((level) => level.level),
        city: school.city.name,
        province: school.province.name,
        country: school.country.name,
        countryCode: school.country.isoCode,
        subscription: school.subscriptions[0]
          ? {
              id: school.subscriptions[0].id,
              status: school.subscriptions[0].status,
              planCode: school.subscriptions[0].planCode,
              priceMonthly: school.subscriptions[0].priceMonthly,
              startsAt: school.subscriptions[0].startsAt,
              endsAt: school.subscriptions[0].endsAt
            }
          : null,
        leadsCount: school._count.leads,
        reviewsCount: school._count.reviews,
        createdAt: school.createdAt,
        updatedAt: school.updatedAt
      })),
      meta: this.buildMeta(total, page, limit)
    };
  }

  async listProductEvents(query: ListProductEventsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 30;
    const where = {
      type: query.type,
      schoolId: query.schoolId
    };

    const [items, total] = await Promise.all([
      this.prisma.productEvent.findMany({
        where,
        orderBy: {
          createdAt: "desc"
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          type: true,
          dedupeKey: true,
          title: true,
          message: true,
          alertsCreated: true,
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
      this.prisma.productEvent.count({ where })
    ]);

    return {
      items,
      meta: this.buildMeta(total, page, limit)
    };
  }

  async getGrowthFunnel(query: GetGrowthFunnelDto) {
    const windowDays = query.windowDays ?? 30;
    const trendDays = query.trendDays ?? 14;
    const now = new Date();
    const today = this.toUtcDayStart(now);

    const [current, trendRows] = await Promise.all([
      this.computeGrowthFunnel(windowDays, now),
      this.prisma.growthFunnelSnapshot.findMany({
        where: {
          windowDays,
          date: {
            gte: new Date(today.getTime() - (trendDays - 1) * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          date: "asc"
        }
      })
    ]);

    return {
      generatedAt: now.toISOString(),
      windowDays,
      trendDays,
      stages: current.stages,
      conversion: current.conversion,
      dropOff: current.dropOff,
      recommendations: this.buildGrowthRecommendations(current.stages, current.conversion),
      trend: trendRows.map((row) => ({
        date: row.date.toISOString().slice(0, 10),
        stages: {
          parentsTotal: row.parentsTotal,
          parentsWithSavedSchools: row.parentsWithSavedSchools,
          parentsWithComparisons: row.parentsWithComparisons,
          parentsWithLeads: row.parentsWithLeads,
          parentsWithClosedLeads: row.parentsWithClosedLeads
        },
        conversion: {
          toSaved: row.conversionToSaved,
          toCompared: row.conversionToCompared,
          toLead: row.conversionToLead,
          toClosedLead: row.conversionToClosedLead
        }
      }))
    };
  }

  async recomputeGrowthFunnel(query: GetGrowthFunnelDto) {
    const windowDays = query.windowDays ?? 30;
    const now = new Date();
    const dayStart = this.toUtcDayStart(now);
    const metrics = await this.computeGrowthFunnel(windowDays, now);

    const snapshot = await this.prisma.growthFunnelSnapshot.upsert({
      where: {
        date_windowDays: {
          date: dayStart,
          windowDays
        }
      },
      create: {
        date: dayStart,
        windowDays,
        parentsTotal: metrics.stages.parentsTotal,
        parentsWithSavedSchools: metrics.stages.parentsWithSavedSchools,
        parentsWithComparisons: metrics.stages.parentsWithComparisons,
        parentsWithLeads: metrics.stages.parentsWithLeads,
        parentsWithClosedLeads: metrics.stages.parentsWithClosedLeads,
        conversionToSaved: metrics.conversion.toSaved,
        conversionToCompared: metrics.conversion.toCompared,
        conversionToLead: metrics.conversion.toLead,
        conversionToClosedLead: metrics.conversion.toClosedLead
      },
      update: {
        parentsTotal: metrics.stages.parentsTotal,
        parentsWithSavedSchools: metrics.stages.parentsWithSavedSchools,
        parentsWithComparisons: metrics.stages.parentsWithComparisons,
        parentsWithLeads: metrics.stages.parentsWithLeads,
        parentsWithClosedLeads: metrics.stages.parentsWithClosedLeads,
        conversionToSaved: metrics.conversion.toSaved,
        conversionToCompared: metrics.conversion.toCompared,
        conversionToLead: metrics.conversion.toLead,
        conversionToClosedLead: metrics.conversion.toClosedLead
      }
    });

    return {
      date: snapshot.date.toISOString(),
      windowDays: snapshot.windowDays,
      stages: metrics.stages,
      conversion: metrics.conversion,
      dropOff: metrics.dropOff,
      recommendations: this.buildGrowthRecommendations(metrics.stages, metrics.conversion)
    };
  }

  async updateSchoolStatus(schoolId: string, payload: UpdateSchoolStatusDto) {
    const existing = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true }
    });

    if (!existing) {
      throw new NotFoundException("School not found");
    }

    const school = await this.prisma.school.update({
      where: { id: schoolId },
      data: { active: payload.active },
      select: {
        id: true,
        name: true,
        slug: true,
        active: true,
        updatedAt: true
      }
    });

    await this.cache.invalidateMany(["schools:list", "schools:search", "schools:detail", "search", "rankings"]);

    return school;
  }

  async updateSchoolSubscription(schoolId: string, payload: UpdateSchoolSubscriptionDto) {
    const existing = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        profileStatus: true
      }
    });

    if (!existing) {
      throw new NotFoundException("School not found");
    }

    const now = new Date();
    const durationMonths = payload.durationMonths ?? 12;
    const startsAt = now;
    const endsAt = new Date(now);
    endsAt.setMonth(endsAt.getMonth() + durationMonths);

    const subscription = await this.prisma.schoolSubscription.create({
      data: {
        schoolId,
        status: payload.status,
        planCode: payload.planCode?.trim() || "premium",
        priceMonthly: payload.priceMonthly ?? null,
        startsAt,
        endsAt
      },
      select: {
        id: true,
        schoolId: true,
        status: true,
        planCode: true,
        priceMonthly: true,
        startsAt: true,
        endsAt: true,
        createdAt: true
      }
    });

    const premiumActiveStatuses = new Set<SubscriptionStatus>([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL]);
    const shouldBePremium = premiumActiveStatuses.has(payload.status);

    await this.prisma.school.update({
      where: {
        id: schoolId
      },
      data: shouldBePremium
        ? {
            profileStatus: SchoolProfileStatus.PREMIUM,
            premiumSince: now,
            premiumUntil: endsAt
          }
        : {
            profileStatus:
              existing.profileStatus === SchoolProfileStatus.PREMIUM
                ? SchoolProfileStatus.VERIFIED
                : existing.profileStatus,
            premiumSince: null,
            premiumUntil: null
          }
    });

    await this.cache.invalidateMany(["schools:list", "schools:search", "schools:detail", "search", "rankings"]);

    return subscription;
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

  private async computeGrowthFunnel(windowDays: number, now: Date) {
    const since = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

    const [parentsTotal, savedRows, comparisonRows, leadRows, closedLeadRows] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: UserRole.PARENT
        }
      }),
      this.prisma.savedSchool.findMany({
        where: {
          createdAt: {
            gte: since
          }
        },
        distinct: ["userId"],
        select: {
          userId: true
        }
      }),
      this.prisma.savedComparison.findMany({
        where: {
          createdAt: {
            gte: since
          }
        },
        distinct: ["userId"],
        select: {
          userId: true
        }
      }),
      this.prisma.lead.findMany({
        where: {
          userId: {
            not: null
          },
          createdAt: {
            gte: since
          }
        },
        distinct: ["userId"],
        select: {
          userId: true
        }
      }),
      this.prisma.lead.findMany({
        where: {
          userId: {
            not: null
          },
          status: LeadStatus.CLOSED,
          createdAt: {
            gte: since
          }
        },
        distinct: ["userId"],
        select: {
          userId: true
        }
      })
    ]);

    const stages = {
      parentsTotal,
      parentsWithSavedSchools: savedRows.length,
      parentsWithComparisons: comparisonRows.length,
      parentsWithLeads: leadRows.length,
      parentsWithClosedLeads: closedLeadRows.length
    };

    const conversion = {
      toSaved: this.toPercent(stages.parentsWithSavedSchools, stages.parentsTotal),
      toCompared: this.toPercent(stages.parentsWithComparisons, stages.parentsWithSavedSchools),
      toLead: this.toPercent(stages.parentsWithLeads, stages.parentsWithComparisons),
      toClosedLead: this.toPercent(stages.parentsWithClosedLeads, stages.parentsWithLeads),
      overallToClosedLead: this.toPercent(stages.parentsWithClosedLeads, stages.parentsTotal)
    };

    const dropOff = {
      beforeSaved: Math.max(stages.parentsTotal - stages.parentsWithSavedSchools, 0),
      beforeCompared: Math.max(stages.parentsWithSavedSchools - stages.parentsWithComparisons, 0),
      beforeLead: Math.max(stages.parentsWithComparisons - stages.parentsWithLeads, 0),
      beforeClosedLead: Math.max(stages.parentsWithLeads - stages.parentsWithClosedLeads, 0)
    };

    return {
      stages,
      conversion,
      dropOff
    };
  }

  private buildGrowthRecommendations(
    stages: {
      parentsTotal: number;
      parentsWithSavedSchools: number;
      parentsWithComparisons: number;
      parentsWithLeads: number;
      parentsWithClosedLeads: number;
    },
    conversion: {
      toSaved: number;
      toCompared: number;
      toLead: number;
      toClosedLead: number;
      overallToClosedLead: number;
    }
  ) {
    const recommendations: string[] = [];
    if (stages.parentsTotal === 0) {
      return ["No hay padres registrados aún para calcular embudo."];
    }

    if (conversion.toSaved < 40) {
      recommendations.push("Optimizar CTAs de guardado en resultados y perfil para aumentar shortlist.");
    }

    if (conversion.toCompared < 45) {
      recommendations.push("Promover comparador desde favoritos con sugerencias de pares y one-click compare.");
    }

    if (conversion.toLead < 35) {
      recommendations.push("Reducir fricción del formulario de lead y reforzar confianza antes de enviar consulta.");
    }

    if (conversion.toClosedLead < 25) {
      recommendations.push("Mejorar seguimiento post-lead con SLA de respuesta y nudges de continuidad.");
    }

    if (recommendations.length === 0) {
      recommendations.push("Embudo saludable. Próximo foco: elevar conversión total a lead cerrado.");
    }

    return recommendations;
  }

  private toPercent(numerator: number, denominator: number) {
    if (denominator <= 0) {
      return 0;
    }

    return Number(((numerator / denominator) * 100).toFixed(2));
  }

  private toUtcDayStart(value: Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  private buildMonthlyLeadTrend(dates: Date[]) {
    const trendMap = new Map<string, number>();

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      trendMap.set(key, 0);
    }

    for (const date of dates) {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (trendMap.has(key)) {
        trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
      }
    }

    return Array.from(trendMap.entries()).map(([month, leads]) => ({ month, leads }));
  }
}
