import { Injectable } from "@nestjs/common";
import { Prisma, SchoolProfileStatus } from "@prisma/client";
import { CacheService } from "../../common/cache/cache.service";
import { PrismaService } from "../../prisma/prisma.service";
import { ListRankingsDto } from "./dto/list-rankings.dto";

export interface RankingSchool {
  id: string;
  name: string;
  slug: string;
  score: number | null;
  approvedReviewCount: number;
  responseCoverageRate: number;
  responseWithinSlaRate: number;
}

interface ReviewResponseSignal {
  approvedCount: number;
  respondedCount: number;
  withinSlaCount: number;
}

@Injectable()
export class RankingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService
  ) {}

  async list(query: ListRankingsDto) {
    return this.cache.getOrSetJson("rankings", query, 300, () => this.listUncached(query));
  }

  private async listUncached(query: ListRankingsDto) {
    const limit = query.limit ?? 12;
    const schools = await this.prisma.school.findMany({
      where: this.buildWhere(query),
      select: {
        id: true,
        name: true,
        slug: true,
        profileStatus: true,
        cityId: true,
        city: {
          select: {
            name: true,
            slug: true
          }
        },
        province: {
          select: {
            name: true,
            slug: true
          }
        },
        country: {
          select: {
            name: true,
            isoCode: true
          }
        },
        scores: {
          select: {
            score: true
          },
          orderBy: {
            calculatedAt: "desc"
          },
          take: 1
        }
      }
    });

    const responseSignals = await this.getReviewResponseSignals(schools.map((school) => school.id));

    if (schools.length === 0) {
      return {
        generatedAt: new Date().toISOString(),
        scope: {
          country: query.country ?? null,
          province: query.province ?? null,
          city: query.city ?? null
        },
        items: []
      };
    }

    const groups = new Map<
      string,
      {
        city: {
          name: string;
          slug: string;
          province: string;
          provinceSlug: string;
          country: string;
          countryCode: string;
        };
        schools: RankingSchool[];
      }
    >();

    for (const school of schools) {
      const entry = groups.get(school.cityId) ?? {
        city: {
          name: school.city.name,
          slug: school.city.slug,
          province: school.province.name,
          provinceSlug: school.province.slug,
          country: school.country.name,
          countryCode: school.country.isoCode
        },
        schools: []
      };

      const signal = responseSignals.get(school.id) ?? {
        approvedCount: 0,
        respondedCount: 0,
        withinSlaCount: 0
      };
      const responseCoverageRate =
        signal.approvedCount === 0
          ? 0
          : Number(((signal.respondedCount / signal.approvedCount) * 100).toFixed(1));
      const responseWithinSlaRate =
        signal.respondedCount === 0
          ? 0
          : Number(((signal.withinSlaCount / signal.respondedCount) * 100).toFixed(1));

      entry.schools.push({
        id: school.id,
        name: school.name,
        slug: school.slug,
        score: this.withProfileAndResponseBoost(school.scores[0]?.score ?? null, school.profileStatus, signal),
        approvedReviewCount: signal.approvedCount,
        responseCoverageRate,
        responseWithinSlaRate
      });

      groups.set(school.cityId, entry);
    }

    const items = Array.from(groups.values())
      .map((entry) => {
        const sortedSchools = [...entry.schools].sort((a, b) => {
          const scoreA = a.score ?? -1;
          const scoreB = b.score ?? -1;

          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }

          return a.name.localeCompare(b.name, "es");
        });
        const validScores = sortedSchools.map((school) => school.score).filter((value): value is number => value !== null);
        const topScore = validScores.length > 0 ? Number(Math.max(...validScores).toFixed(1)) : null;
        const averageScore =
          validScores.length > 0
            ? Number((validScores.reduce((acc, value) => acc + value, 0) / validScores.length).toFixed(1))
            : null;

        return {
          city: entry.city,
          schools: entry.schools.length,
          topScore,
          averageScore,
          topSchools: sortedSchools.slice(0, 3)
        };
      })
      .sort((a, b) => {
        const topA = a.topScore ?? -1;
        const topB = b.topScore ?? -1;

        if (topB !== topA) {
          return topB - topA;
        }

        const avgA = a.averageScore ?? -1;
        const avgB = b.averageScore ?? -1;
        if (avgB !== avgA) {
          return avgB - avgA;
        }

        if (b.schools !== a.schools) {
          return b.schools - a.schools;
        }

        return a.city.name.localeCompare(b.city.name, "es");
      })
      .slice(0, limit)
      .map((item, index) => ({
        rank: index + 1,
        ...item
      }));

    return {
      generatedAt: new Date().toISOString(),
      scope: {
        country: query.country ?? null,
        province: query.province ?? null,
        city: query.city ?? null
      },
      items
    };
  }

  private buildWhere(query: ListRankingsDto): Prisma.SchoolWhereInput {
    const andFilters: Prisma.SchoolWhereInput[] = [{ active: true }];

    if (query.country) {
      const country = query.country.trim();
      andFilters.push({
        country: {
          OR: [
            { name: { contains: country, mode: "insensitive" } },
            { isoCode: { equals: country.toUpperCase() } }
          ]
        }
      });
    }

    if (query.province) {
      const province = query.province.trim();
      andFilters.push({
        province: {
          OR: [
            { name: { contains: province, mode: "insensitive" } },
            { slug: { contains: province.toLowerCase() } }
          ]
        }
      });
    }

    if (query.city) {
      const city = query.city.trim();
      andFilters.push({
        city: {
          OR: [{ name: { contains: city, mode: "insensitive" } }, { slug: { contains: city.toLowerCase() } }]
        }
      });
    }

    return andFilters.length === 1 ? andFilters[0] : { AND: andFilters };
  }

  private withProfileAndResponseBoost(
    score: number | null,
    profileStatus: SchoolProfileStatus,
    signal: ReviewResponseSignal
  ) {
    const base = score ?? 0;
    const responseBoost = this.computeReviewResponseBoost(signal);

    if (profileStatus === SchoolProfileStatus.PREMIUM) {
      return Number((base + 3.5 + responseBoost).toFixed(2));
    }

    if (profileStatus === SchoolProfileStatus.VERIFIED) {
      return Number((base + 2.2 + responseBoost).toFixed(2));
    }

    if (profileStatus === SchoolProfileStatus.CURATED) {
      return Number((base + 1.1 + responseBoost).toFixed(2));
    }

    return Number((base + responseBoost).toFixed(2));
  }

  private computeReviewResponseBoost(signal: ReviewResponseSignal) {
    if (signal.approvedCount === 0) {
      return 0;
    }

    if (signal.approvedCount < 3) {
      return signal.respondedCount > 0 ? 0.25 : 0;
    }

    const coverage = signal.respondedCount / signal.approvedCount;
    const withinSlaRate = signal.respondedCount === 0 ? 0 : signal.withinSlaCount / signal.respondedCount;

    let boost = coverage * 1.2 + withinSlaRate * 0.8;

    if (coverage === 0) {
      boost -= 1.2;
    } else if (signal.approvedCount >= 5 && coverage < 0.25) {
      boost -= 0.6;
    }

    return Number(boost.toFixed(2));
  }

  private async getReviewResponseSignals(schoolIds: string[]) {
    const signals = new Map<string, ReviewResponseSignal>();

    if (schoolIds.length === 0) {
      return signals;
    }

    const [approvedGroups, respondedGroups, withinSlaRows] = await Promise.all([
      this.prisma.review.groupBy({
        by: ["schoolId"],
        where: {
          status: "APPROVED",
          schoolId: {
            in: schoolIds
          }
        },
        _count: {
          _all: true
        }
      }),
      this.prisma.review.groupBy({
        by: ["schoolId"],
        where: {
          status: "APPROVED",
          schoolId: {
            in: schoolIds
          },
          schoolResponseAt: {
            not: null
          }
        },
        _count: {
          _all: true
        }
      }),
      this.prisma.$queryRaw<Array<{ schoolId: string; withinSla: number }>>(
        Prisma.sql`
          SELECT "schoolId", COUNT(*)::int AS "withinSla"
          FROM "Review"
          WHERE status = 'APPROVED'
            AND "schoolResponseAt" IS NOT NULL
            AND "schoolResponseAt" <= "createdAt" + interval '72 hours'
            AND "schoolId" IN (${Prisma.join(schoolIds)})
          GROUP BY "schoolId"
        `
      )
    ]);

    for (const schoolId of schoolIds) {
      signals.set(schoolId, {
        approvedCount: 0,
        respondedCount: 0,
        withinSlaCount: 0
      });
    }

    for (const item of approvedGroups) {
      const current = signals.get(item.schoolId);
      if (!current) {
        continue;
      }
      current.approvedCount = item._count._all;
    }

    for (const item of respondedGroups) {
      const current = signals.get(item.schoolId);
      if (!current) {
        continue;
      }
      current.respondedCount = item._count._all;
    }

    for (const row of withinSlaRows) {
      const current = signals.get(row.schoolId);
      if (!current) {
        continue;
      }
      current.withinSlaCount = Number(row.withinSla ?? 0);
    }

    return signals;
  }
}
