import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { LeadStatus, ParentAlertType, Prisma, ReviewStatus, UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSavedComparisonDto } from "./dto/create-saved-comparison.dto";
import { CreateSavedSchoolDto } from "./dto/create-saved-school.dto";

const SCHOOL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

@Injectable()
export class ParentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const parent = await this.ensureParentUser(userId);
    const [saved, comparisons, alerts] = await Promise.all([
      this.listSavedSchoolsInternal(userId, 12),
      this.listComparisonsInternal(userId, 8),
      this.listAlertsInternal(userId, 8)
    ]);
    const [leadCount, closedLeadCount] = await Promise.all([
      this.prisma.lead.count({
        where: {
          userId
        }
      }),
      this.prisma.lead.count({
        where: {
          userId,
          status: LeadStatus.CLOSED
        }
      })
    ]);
    const nextAction = this.buildGrowthNextAction({
      savedSchools: saved.items.length,
      comparisons: comparisons.items.length,
      leads: leadCount,
      closedLeads: closedLeadCount
    });

    return {
      parent: {
        id: parent.id,
        email: parent.email
      },
      metrics: {
        savedSchools: saved.items.length,
        activeComparisons: comparisons.items.length,
        unreadAlerts: alerts.meta.unread,
        nextOpenHouse: null
      },
      savedSchools: saved.items,
      comparisons: comparisons.items,
      alerts: alerts.items,
      nextAction
    };
  }

  async listSavedSchools(userId: string) {
    await this.ensureParentUser(userId);
    return this.listSavedSchoolsInternal(userId, 50);
  }

  async saveSchool(userId: string, payload: CreateSavedSchoolDto) {
    await this.ensureParentUser(userId);
    const school = await this.prisma.school.findFirst({
      where: {
        id: payload.schoolId,
        active: true
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    if (!school) {
      throw new NotFoundException("School not found");
    }

    const existing = await this.prisma.savedSchool.findUnique({
      where: {
        userId_schoolId: {
          userId,
          schoolId: payload.schoolId
        }
      },
      select: {
        id: true,
        userId: true,
        schoolId: true,
        createdAt: true
      }
    });

    if (existing) {
      return existing;
    }

    const saved = await this.prisma.savedSchool.create({
      data: {
        userId,
        schoolId: payload.schoolId
      }
    });

    await this.createParentAlert({
      userId,
      schoolId: school.id,
      type: ParentAlertType.SAVED_SCHOOL_ADDED,
      title: "Colegio guardado",
      message: `Guardaste ${school.name} en tu shortlist.`,
      linkPath: `/school/${school.slug}`
    });

    return {
      id: saved.id,
      userId: saved.userId,
      schoolId: saved.schoolId,
      createdAt: saved.createdAt
    };
  }

  async removeSavedSchool(userId: string, schoolId: string) {
    await this.ensureParentUser(userId);
    await this.prisma.savedSchool.deleteMany({
      where: {
        userId,
        schoolId
      }
    });

    return {
      removed: true,
      schoolId
    };
  }

  async listComparisons(userId: string) {
    await this.ensureParentUser(userId);
    return this.listComparisonsInternal(userId, 30);
  }

  async listAlerts(userId: string) {
    await this.ensureParentUser(userId);
    return this.listAlertsInternal(userId, 30);
  }

  async markAlertAsRead(userId: string, alertId: string) {
    await this.ensureParentUser(userId);
    const result = await this.prisma.parentAlert.updateMany({
      where: {
        id: alertId,
        userId
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return {
      updated: result.count > 0,
      alertId
    };
  }

  async saveComparison(userId: string, payload: CreateSavedComparisonDto) {
    await this.ensureParentUser(userId);
    const schoolSlugs = this.sanitizeComparisonSlugs(payload.schoolSlugs);

    if (schoolSlugs.length < 2) {
      throw new BadRequestException("At least two unique schools are required");
    }

    const schools = await this.prisma.school.findMany({
      where: {
        slug: {
          in: schoolSlugs
        },
        active: true
      },
      select: {
        slug: true
      }
    });

    if (schools.length !== schoolSlugs.length) {
      throw new NotFoundException("One or more schools were not found");
    }

    const existing = await this.prisma.savedComparison.findFirst({
      where: {
        userId,
        schoolSlugs: {
          equals: schoolSlugs
        }
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (existing) {
      return {
        id: existing.id,
        schoolSlugs,
        comparePath: `/compare/${schoolSlugs.join(",")}`,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt
      };
    }

    const saved = await this.prisma.savedComparison.create({
      data: {
        userId,
        schoolSlugs
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const firstSlug = schoolSlugs[0];
    const firstSchool = await this.prisma.school.findUnique({
      where: { slug: firstSlug },
      select: {
        id: true,
        name: true
      }
    });

    await this.createParentAlert({
      userId,
      schoolId: firstSchool?.id ?? null,
      type: ParentAlertType.COMPARISON_SAVED,
      title: "Comparación guardada",
      message: firstSchool
        ? `Tu comparación con ${firstSchool.name} ya está guardada.`
        : "Guardaste una comparación para revisitarla luego.",
      linkPath: `/compare/${schoolSlugs.join(",")}`,
      payload: {
        schoolSlugs
      }
    });

    return {
      id: saved.id,
      schoolSlugs,
      comparePath: `/compare/${schoolSlugs.join(",")}`,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt
    };
  }

  async removeComparison(userId: string, comparisonId: string) {
    await this.ensureParentUser(userId);
    await this.prisma.savedComparison.deleteMany({
      where: {
        id: comparisonId,
        userId
      }
    });

    return {
      removed: true,
      comparisonId
    };
  }

  private async ensureParentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      throw new NotFoundException("Parent user not found");
    }

    if (user.role !== UserRole.PARENT) {
      throw new ForbiddenException("Only parent users can access parent resources");
    }

    return user;
  }

  private async createParentAlert(input: {
    userId: string;
    schoolId?: string | null;
    type: ParentAlertType;
    title: string;
    message: string;
    linkPath?: string | null;
    payload?: Record<string, unknown>;
  }) {
    await this.prisma.parentAlert.create({
      data: {
        userId: input.userId,
        schoolId: input.schoolId ?? null,
        type: input.type,
        title: input.title,
        message: input.message,
        linkPath: input.linkPath ?? null,
        payload: input.payload ? (input.payload as Prisma.InputJsonValue) : undefined
      }
    });
  }

  private async listSavedSchoolsInternal(userId: string, limit: number) {
    const rows = await this.prisma.savedSchool.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc"
      },
      take: limit,
      include: {
        school: {
          select: {
            id: true,
            name: true,
            slug: true,
            profileStatus: true,
            monthlyFeeEstimate: true,
            city: {
              select: {
                name: true
              }
            },
            province: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    const schoolIds = rows.map((row) => row.schoolId);
    const reviewGroups =
      schoolIds.length === 0
        ? []
        : await this.prisma.review.groupBy({
            by: ["schoolId"],
            where: {
              schoolId: { in: schoolIds },
              status: ReviewStatus.APPROVED
            },
            _count: { schoolId: true },
            _avg: { rating: true }
          });

    const reviewBySchoolId = new Map(
      reviewGroups.map((item) => [
        item.schoolId,
        {
          count: item._count.schoolId,
          average: item._avg.rating
        }
      ])
    );

    return {
      items: rows.map((row) => {
        const review = reviewBySchoolId.get(row.schoolId);
        return {
          id: row.id,
          createdAt: row.createdAt,
          school: {
            id: row.school.id,
            name: row.school.name,
            slug: row.school.slug,
            profileStatus: row.school.profileStatus,
            city: row.school.city.name,
            province: row.school.province.name,
            monthlyFeeEstimate: row.school.monthlyFeeEstimate,
            rating: {
              average: review?.average ?? null,
              count: review?.count ?? 0
            }
          }
        };
      }),
      meta: {
        total: rows.length,
        limit
      }
    };
  }

  private sanitizeComparisonSlugs(input: string[]) {
    const normalized = input.map((entry) => entry.trim().toLowerCase());
    const unique = Array.from(new Set(normalized));
    const valid = unique.filter((entry) => SCHOOL_SLUG_PATTERN.test(entry));

    return valid.slice(0, 3);
  }

  private async listComparisonsInternal(userId: string, limit: number) {
    const rows = await this.prisma.savedComparison.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: limit
    });

    const allSlugs = Array.from(new Set(rows.flatMap((row) => row.schoolSlugs)));
    const schools =
      allSlugs.length === 0
        ? []
        : await this.prisma.school.findMany({
            where: {
              slug: { in: allSlugs },
              active: true
            },
            select: {
              id: true,
              name: true,
              slug: true,
              profileStatus: true,
              monthlyFeeEstimate: true,
              city: {
                select: {
                  name: true
                }
              },
              province: {
                select: {
                  name: true
                }
              }
            }
          });

    const schoolIds = schools.map((school) => school.id);
    const reviewGroups =
      schoolIds.length === 0
        ? []
        : await this.prisma.review.groupBy({
            by: ["schoolId"],
            where: {
              schoolId: { in: schoolIds },
              status: ReviewStatus.APPROVED
            },
            _count: { schoolId: true },
            _avg: { rating: true }
          });

    const reviewBySchoolId = new Map(
      reviewGroups.map((item) => [
        item.schoolId,
        {
          count: item._count.schoolId,
          average: item._avg.rating
        }
      ])
    );

    const schoolBySlug = new Map(schools.map((school) => [school.slug, school]));

    return {
      items: rows.map((row) => ({
        id: row.id,
        schoolSlugs: row.schoolSlugs,
        comparePath: `/compare/${row.schoolSlugs.join(",")}`,
        schools: row.schoolSlugs
          .map((slug) => schoolBySlug.get(slug))
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
          .map((school) => {
            const review = reviewBySchoolId.get(school.id);
            return {
              id: school.id,
              name: school.name,
              slug: school.slug,
              profileStatus: school.profileStatus,
              city: school.city.name,
              province: school.province.name,
              monthlyFeeEstimate: school.monthlyFeeEstimate,
              rating: {
                average: review?.average ?? null,
                count: review?.count ?? 0
              }
            };
          }),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      })),
      meta: {
        total: rows.length,
        limit
      }
    };
  }

  private async listAlertsInternal(userId: string, limit: number) {
    const [rows, unreadCount] = await Promise.all([
      this.prisma.parentAlert.findMany({
        where: { userId },
        orderBy: {
          createdAt: "desc"
        },
        take: limit,
        include: {
          school: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      this.prisma.parentAlert.count({
        where: {
          userId,
          isRead: false
        }
      })
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        message: row.message,
        linkPath: row.linkPath,
        isRead: row.isRead,
        createdAt: row.createdAt,
        readAt: row.readAt,
        school: row.school
      })),
      meta: {
        total: rows.length,
        unread: unreadCount,
        limit
      }
    };
  }

  private buildGrowthNextAction(input: {
    savedSchools: number;
    comparisons: number;
    leads: number;
    closedLeads: number;
  }) {
    if (input.savedSchools === 0) {
      return {
        stage: "DISCOVERY",
        title: "Armá tu shortlist inicial",
        detail: "Guardá al menos 3 colegios para empezar a comparar opciones reales.",
        ctaLabel: "Explorar colegios",
        ctaPath: "/search"
      };
    }

    if (input.comparisons === 0) {
      return {
        stage: "SHORTLIST",
        title: "Hacé tu primera comparación",
        detail: "Compará 2 o 3 colegios guardados para definir prioridades de decisión.",
        ctaLabel: "Ir al comparador",
        ctaPath: "/compare"
      };
    }

    if (input.leads === 0) {
      return {
        stage: "EVALUATION",
        title: "Contactá a tu primer colegio",
        detail: "Enviá una consulta para validar disponibilidad, propuesta y cuota actual.",
        ctaLabel: "Abrir colegios guardados",
        ctaPath: "/parent-dashboard"
      };
    }

    if (input.closedLeads === 0) {
      return {
        stage: "CONTACT",
        title: "Seguimiento de consultas",
        detail: "Hacé seguimiento de tus leads para acelerar respuestas y visitas.",
        ctaLabel: "Revisar alertas",
        ctaPath: "/parent-dashboard"
      };
    }

    return {
      stage: "DECISION",
      title: "Embudo completado",
      detail: "Ya completaste un ciclo de decisión. Podés iniciar un nuevo proceso o refinar tu shortlist.",
      ctaLabel: "Buscar más colegios",
      ctaPath: "/search"
    };
  }
}
