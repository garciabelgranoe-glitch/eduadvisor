import { Injectable } from "@nestjs/common";
import { Prisma, ReviewStatus, SchoolLevel } from "@prisma/client";
import { CacheService } from "../../common/cache/cache.service";
import { ProductEventsService } from "../product-events/product-events.service";
import { PrismaService } from "../../prisma/prisma.service";
import { ListMarketInsightsDto } from "./dto/list-market-insights.dto";

type GroupEntity = {
  id: string;
  schoolIds: string[];
  countryId: string;
  provinceId?: string | null;
  cityId?: string | null;
};

@Injectable()
export class IntelligenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly productEvents: ProductEventsService
  ) {}

  async list(query: ListMarketInsightsDto) {
    return this.cache.getOrSetJson("insights", query, 300, () => this.listUncached(query));
  }

  private async listUncached(query: ListMarketInsightsDto) {
    const where = this.buildSchoolWhere(query);
    const windowDays = query.windowDays ?? 30;
    const topLimit = query.topLimit ?? 5;
    const sinceDate = this.getDaysAgoDate(windowDays);

    const schools = await this.prisma.school.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        monthlyFeeEstimate: true,
        cityId: true,
        provinceId: true,
        countryId: true,
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
        }
      }
    });

    if (schools.length === 0) {
      return {
        generatedAt: new Date().toISOString(),
        scope: {
          country: query.country ?? null,
          province: query.province ?? null,
          city: query.city ?? null
        },
        metrics: {
          avgMonthlyFee: null,
          monthlyFeeRange: { min: null, max: null },
          demandByLevel: { INICIAL: 0, PRIMARIA: 0, SECUNDARIA: 0 },
          satisfactionAverage: null,
          totalSchools: 0,
          totalLeadsWindow: 0
        },
        topCities: [],
        mostSearchedSchools: [],
        leadTrend: []
      };
    }

    const schoolIds = schools.map((school) => school.id);
    const [leadRows, reviewRows, leadTrendRows] = await Promise.all([
      this.prisma.lead.findMany({
        where: {
          schoolId: {
            in: schoolIds
          },
          createdAt: {
            gte: sinceDate
          }
        },
        select: {
          schoolId: true,
          educationLevel: true,
          createdAt: true
        }
      }),
      this.prisma.review.findMany({
        where: {
          schoolId: {
            in: schoolIds
          },
          status: ReviewStatus.APPROVED
        },
        select: {
          schoolId: true,
          rating: true
        }
      }),
      this.prisma.lead.findMany({
        where: {
          schoolId: {
            in: schoolIds
          },
          createdAt: {
            gte: this.getMonthsAgoDate(5)
          }
        },
        select: {
          createdAt: true
        }
      })
    ]);

    const feeValues = schools
      .map((school) => school.monthlyFeeEstimate)
      .filter((fee): fee is number => fee !== null && fee !== undefined);
    const avgMonthlyFee =
      feeValues.length > 0 ? Number((feeValues.reduce((acc, fee) => acc + fee, 0) / feeValues.length).toFixed(0)) : null;
    const monthlyFeeRange = {
      min: feeValues.length > 0 ? Math.min(...feeValues) : null,
      max: feeValues.length > 0 ? Math.max(...feeValues) : null
    };

    const demandByLevel = {
      INICIAL: 0,
      PRIMARIA: 0,
      SECUNDARIA: 0
    };
    for (const lead of leadRows) {
      demandByLevel[lead.educationLevel] += 1;
    }

    const satisfactionAverage =
      reviewRows.length > 0
        ? Number((reviewRows.reduce((acc, review) => acc + review.rating, 0) / reviewRows.length).toFixed(2))
        : null;

    const leadsBySchool = this.countByKey(leadRows.map((lead) => lead.schoolId));
    const reviewsBySchool = this.countByKey(reviewRows.map((review) => review.schoolId));
    const schoolById = new Map(schools.map((school) => [school.id, school]));

    const mostSearchedSchools = Array.from(leadsBySchool.entries())
      .map(([schoolId, leads]) => {
        const school = schoolById.get(schoolId);
        if (!school) {
          return null;
        }

        const reviewCount = reviewsBySchool.get(schoolId) ?? 0;
        return {
          schoolId,
          schoolName: school.name,
          schoolSlug: school.slug,
          city: school.city.name,
          leads,
          reviewCount,
          interestScore: leads * 2 + reviewCount
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.interestScore - a.interestScore)
      .slice(0, topLimit);

    const topCities = this.groupSchoolsByCity(schools)
      .map((group) => {
        const cityFeeValues = group.schools
          .map((school) => school.monthlyFeeEstimate)
          .filter((fee): fee is number => fee !== null && fee !== undefined);
        const avgFee =
          cityFeeValues.length > 0
            ? Number((cityFeeValues.reduce((acc, fee) => acc + fee, 0) / cityFeeValues.length).toFixed(0))
            : null;
        const cityLeadCount = group.schools.reduce((acc, school) => acc + (leadsBySchool.get(school.id) ?? 0), 0);

        return {
          city: group.city.name,
          citySlug: group.city.slug,
          province: group.province.name,
          country: group.country.name,
          schools: group.schools.length,
          avgMonthlyFee: avgFee,
          leadsWindow: cityLeadCount
        };
      })
      .sort((a, b) => b.schools - a.schools)
      .slice(0, topLimit);

    return {
      generatedAt: new Date().toISOString(),
      scope: {
        country: query.country ?? null,
        province: query.province ?? null,
        city: query.city ?? null
      },
      metrics: {
        avgMonthlyFee,
        monthlyFeeRange,
        demandByLevel,
        satisfactionAverage,
        totalSchools: schools.length,
        totalLeadsWindow: leadRows.length
      },
      topCities,
      mostSearchedSchools,
      leadTrend: this.buildMonthlyLeadTrend(leadTrendRows.map((item) => item.createdAt))
    };
  }

  async recomputeDailySnapshots() {
    const snapshotDate = this.getTodayStartUtc();
    const schools = await this.prisma.school.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        countryId: true,
        provinceId: true,
        cityId: true,
        description: true,
        website: true,
        phone: true,
        email: true,
        monthlyFeeEstimate: true,
        studentsCount: true
      }
    });

    const schoolIds = schools.map((school) => school.id);
    const [latestScoreTimestamps, reviews, leads90, leadsToday, leads30] = await Promise.all([
      this.prisma.eduAdvisorScore.groupBy({
        by: ["schoolId"],
        where: {
          schoolId: {
            in: schoolIds
          }
        },
        _max: {
          calculatedAt: true
        }
      }),
      this.prisma.review.findMany({
        where: {
          schoolId: {
            in: schoolIds
          },
          status: ReviewStatus.APPROVED
        },
        select: {
          schoolId: true,
          rating: true
        }
      }),
      this.prisma.lead.findMany({
        where: {
          schoolId: {
            in: schoolIds
          },
          createdAt: {
            gte: this.getDaysAgoDate(90)
          }
        },
        select: {
          schoolId: true
        }
      }),
      this.prisma.lead.findMany({
        where: {
          schoolId: {
            in: schoolIds
          },
          createdAt: {
            gte: snapshotDate
          }
        },
        select: {
          schoolId: true
        }
      }),
      this.prisma.lead.findMany({
        where: {
          schoolId: {
            in: schoolIds
          },
          createdAt: {
            gte: this.getDaysAgoDate(30)
          }
        },
        select: {
          schoolId: true,
          educationLevel: true
        }
      })
    ]);

    const latestScorePairs = latestScoreTimestamps
      .filter((row): row is { schoolId: string; _max: { calculatedAt: Date } } => row._max.calculatedAt !== null)
      .map((row) => ({
        schoolId: row.schoolId,
        calculatedAt: row._max.calculatedAt
      }));

    const previousScores =
      latestScorePairs.length === 0
        ? []
        : await this.prisma.eduAdvisorScore.findMany({
            where: {
              OR: latestScorePairs.map((row) => ({
                schoolId: row.schoolId,
                calculatedAt: row.calculatedAt
              }))
            },
            select: {
              schoolId: true,
              score: true
            }
          });
    const previousScoreBySchool = new Map(previousScores.map((row) => [row.schoolId, row.score]));

    const reviewsBySchool = this.groupNumbersBySchool(reviews.map((review) => ({ schoolId: review.schoolId, value: review.rating })));
    const leads90BySchool = this.countByKey(leads90.map((lead) => lead.schoolId));
    const leadsTodayBySchool = this.countByKey(leadsToday.map((lead) => lead.schoolId));

    const scoreRows: Prisma.EduAdvisorScoreCreateManyInput[] = [];
    const metricsRows: Array<{
      schoolId: string;
      profileViews: number;
      searchesAppearances: number;
      leadsReceived: number;
      avgRating: number | null;
      satisfactionIndex: number | null;
    }> = [];

    for (const school of schools) {
      const ratings = reviewsBySchool.get(school.id) ?? [];
      const avgRating = ratings.length > 0 ? ratings.reduce((acc, value) => acc + value, 0) / ratings.length : null;
      const reviewCount = ratings.length;
      const leadsLast90Days = leads90BySchool.get(school.id) ?? 0;
      const leadsReceived = leadsTodayBySchool.get(school.id) ?? 0;
      const profileCompleteness = this.calculateProfileCompleteness(school);

      const reviewsComponent = ((avgRating ?? 3) / 5) * 0.8 + Math.min(reviewCount / 30, 1) * 0.2;
      const engagementComponent = Math.min(leadsLast90Days / 40, 1) * 0.7 + Math.min(reviewCount / 40, 1) * 0.3;
      const consistencyComponent = this.calculateConsistency(ratings);
      const dataQualityComponent = profileCompleteness;
      const score =
        (reviewsComponent * 0.35 + engagementComponent * 0.25 + consistencyComponent * 0.2 + dataQualityComponent * 0.2) *
        100;

      scoreRows.push({
        schoolId: school.id,
        score: Number(score.toFixed(2)),
        reviewsComponent: Number(reviewsComponent.toFixed(3)),
        engagementComponent: Number(engagementComponent.toFixed(3)),
        consistencyComponent: Number(consistencyComponent.toFixed(3)),
        dataQualityComponent: Number(dataQualityComponent.toFixed(3))
      });

      metricsRows.push({
        schoolId: school.id,
        profileViews: 0,
        searchesAppearances: 0,
        leadsReceived,
        avgRating: avgRating !== null ? Number(avgRating.toFixed(2)) : null,
        satisfactionIndex: avgRating !== null ? Number((avgRating * 20).toFixed(2)) : null
      });
    }

    const marketRows = this.buildMarketRows({
      schools,
      leads30,
      reviewsBySchool,
      snapshotDate
    });

    await this.prisma.$transaction(async (tx) => {
      if (scoreRows.length > 0) {
        await tx.eduAdvisorScore.createMany({
          data: scoreRows
        });
      }

      for (const row of metricsRows) {
        await tx.schoolMetricsDaily.upsert({
          where: {
            schoolId_date: {
              schoolId: row.schoolId,
              date: snapshotDate
            }
          },
          create: {
            schoolId: row.schoolId,
            date: snapshotDate,
            profileViews: row.profileViews,
            searchesAppearances: row.searchesAppearances,
            leadsReceived: row.leadsReceived,
            avgRating: row.avgRating,
            satisfactionIndex: row.satisfactionIndex
          },
          update: {
            leadsReceived: row.leadsReceived,
            avgRating: row.avgRating,
            satisfactionIndex: row.satisfactionIndex
          }
        });
      }

      await tx.marketMetricDaily.deleteMany({
        where: {
          date: snapshotDate
        }
      });

      if (marketRows.length > 0) {
        await tx.marketMetricDaily.createMany({
          data: marketRows
        });
      }
    });

    const response = {
      generatedAt: new Date().toISOString(),
      snapshotDate: snapshotDate.toISOString(),
      schoolsProcessed: schools.length,
      scoreRows: scoreRows.length,
      schoolMetricsRows: metricsRows.length,
      marketMetricsRows: marketRows.length
    };

    await this.cache.invalidateMany([
      "insights",
      "rankings",
      "schools:list",
      "schools:search",
      "schools:detail",
      "search"
    ]);

    const schoolById = new Map(schools.map((school) => [school.id, school]));
    for (const row of scoreRows) {
      const previousScore = previousScoreBySchool.get(row.schoolId);
      if (previousScore === undefined) {
        continue;
      }

      const school = schoolById.get(row.schoolId);
      if (!school) {
        continue;
      }

      try {
        await this.productEvents.emitEduAdvisorScoreChanged({
          schoolId: school.id,
          schoolName: school.name,
          schoolSlug: school.slug,
          previousScore,
          score: row.score,
          snapshotDate
        });
      } catch (error) {
        // Snapshot recompute should not fail if event dispatch fails for one school.
        // eslint-disable-next-line no-console
        console.warn("eduadvisor-score-event-failed", {
          schoolId: school.id,
          error
        });
      }
    }

    return response;
  }

  private buildMarketRows(input: {
    schools: Array<{
      id: string;
      name: string;
      slug: string;
      countryId: string;
      provinceId: string;
      cityId: string;
      monthlyFeeEstimate: number | null;
    }>;
    leads30: Array<{ schoolId: string; educationLevel: SchoolLevel }>;
    reviewsBySchool: Map<string, number[]>;
    snapshotDate: Date;
  }): Prisma.MarketMetricDailyCreateManyInput[] {
    const schoolById = new Map(input.schools.map((school) => [school.id, school]));
    const leadsBySchool = this.countByKey(input.leads30.map((lead) => lead.schoolId));
    const leadsBySchoolLevel = new Map<string, { INICIAL: number; PRIMARIA: number; SECUNDARIA: number }>();
    for (const lead of input.leads30) {
      const row = leadsBySchoolLevel.get(lead.schoolId) ?? { INICIAL: 0, PRIMARIA: 0, SECUNDARIA: 0 };
      row[lead.educationLevel] += 1;
      leadsBySchoolLevel.set(lead.schoolId, row);
    }

    const groupRows: Prisma.MarketMetricDailyCreateManyInput[] = [];
    const countryGroups = this.groupByEntity(input.schools, "countryId");
    const provinceGroups = this.groupByEntity(input.schools, "provinceId");
    const cityGroups = this.groupByEntity(input.schools, "cityId");

    const buildRow = (group: GroupEntity) => {
      const scopedSchools = group.schoolIds.map((id) => schoolById.get(id)).filter((item): item is NonNullable<typeof item> => item !== undefined);
      const feeValues = scopedSchools
        .map((school) => school.monthlyFeeEstimate)
        .filter((value): value is number => value !== null && value !== undefined);
      const avgMonthlyFee =
        feeValues.length > 0 ? Number((feeValues.reduce((acc, value) => acc + value, 0) / feeValues.length).toFixed(2)) : null;

      let demandInicial = 0;
      let demandPrimaria = 0;
      let demandSecundaria = 0;
      const ratingValues: number[] = [];

      for (const schoolId of group.schoolIds) {
        const levelDemand = leadsBySchoolLevel.get(schoolId) ?? { INICIAL: 0, PRIMARIA: 0, SECUNDARIA: 0 };
        demandInicial += levelDemand.INICIAL;
        demandPrimaria += levelDemand.PRIMARIA;
        demandSecundaria += levelDemand.SECUNDARIA;
        ratingValues.push(...(input.reviewsBySchool.get(schoolId) ?? []));
      }

      const avgSatisfaction =
        ratingValues.length > 0
          ? Number((ratingValues.reduce((acc, value) => acc + value, 0) / ratingValues.length).toFixed(2))
          : null;

      const mostSearchedSchools = group.schoolIds
        .map((schoolId) => {
          const school = schoolById.get(schoolId);
          if (!school) {
            return null;
          }

          return {
            schoolId,
            schoolName: school.name,
            schoolSlug: school.slug,
            leads: leadsBySchool.get(schoolId) ?? 0
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 5);

      groupRows.push({
        countryId: group.countryId,
        provinceId: group.provinceId ?? null,
        cityId: group.cityId ?? null,
        date: input.snapshotDate,
        avgMonthlyFee,
        demandInicial,
        demandPrimaria,
        demandSecundaria,
        avgSatisfaction,
        mostSearchedSchools: mostSearchedSchools as unknown as Prisma.InputJsonValue
      });
    };

    for (const group of countryGroups.values()) {
      buildRow(group);
    }

    for (const group of provinceGroups.values()) {
      buildRow(group);
    }

    for (const group of cityGroups.values()) {
      buildRow(group);
    }

    return groupRows;
  }

  private groupByEntity(
    schools: Array<{ id: string; countryId: string; provinceId: string; cityId: string }>,
    key: "countryId" | "provinceId" | "cityId"
  ) {
    const groups = new Map<string, GroupEntity>();

    for (const school of schools) {
      const entityId = school[key];
      const existing = groups.get(entityId) ?? {
        id: entityId,
        schoolIds: [],
        countryId: school.countryId,
        provinceId: key === "countryId" ? null : school.provinceId,
        cityId: key === "cityId" ? school.cityId : null
      };

      existing.schoolIds.push(school.id);
      groups.set(entityId, existing);
    }

    return groups;
  }

  private groupNumbersBySchool(rows: Array<{ schoolId: string; value: number }>) {
    const map = new Map<string, number[]>();

    for (const row of rows) {
      const existing = map.get(row.schoolId) ?? [];
      existing.push(row.value);
      map.set(row.schoolId, existing);
    }

    return map;
  }

  private groupSchoolsByCity(
    schools: Array<{
      id: string;
      monthlyFeeEstimate: number | null;
      city: { name: string; slug: string };
      province: { name: string; slug: string };
      country: { name: string; isoCode: string };
    }>
  ) {
    const groups = new Map<
      string,
      {
        city: { name: string; slug: string };
        province: { name: string; slug: string };
        country: { name: string; isoCode: string };
        schools: Array<{ id: string; monthlyFeeEstimate: number | null }>;
      }
    >();

    for (const school of schools) {
      const key = school.city.slug;
      const existing = groups.get(key) ?? {
        city: school.city,
        province: school.province,
        country: school.country,
        schools: []
      };

      existing.schools.push({
        id: school.id,
        monthlyFeeEstimate: school.monthlyFeeEstimate
      });
      groups.set(key, existing);
    }

    return Array.from(groups.values());
  }

  private calculateProfileCompleteness(school: {
    description: string | null;
    website: string | null;
    phone: string | null;
    email: string | null;
    monthlyFeeEstimate: number | null;
    studentsCount: number | null;
  }) {
    const fields = [
      school.description,
      school.website,
      school.phone,
      school.email,
      school.monthlyFeeEstimate,
      school.studentsCount
    ];
    const completed = fields.filter((field) => field !== null && field !== undefined && field !== "").length;
    return completed / fields.length;
  }

  private calculateConsistency(ratings: number[]) {
    if (ratings.length < 2) {
      return 0.65;
    }

    const avg = ratings.reduce((acc, value) => acc + value, 0) / ratings.length;
    const variance = ratings.reduce((acc, value) => acc + (value - avg) ** 2, 0) / ratings.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0.35, 1 - stdDev / 2);
  }

  private countByKey(keys: string[]) {
    const map = new Map<string, number>();
    for (const key of keys) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }

  private buildSchoolWhere(query: ListMarketInsightsDto): Prisma.SchoolWhereInput {
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

  private getTodayStartUtc() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  private getDaysAgoDate(daysAgo: number) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  }

  private getMonthsAgoDate(monthsAgo: number) {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    return date;
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
