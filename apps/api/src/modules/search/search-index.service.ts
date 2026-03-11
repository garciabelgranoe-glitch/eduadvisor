import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ReviewStatus, SchoolLevel, SchoolProfileStatus } from "@prisma/client";
import { MeiliSearch } from "meilisearch";
import { PrismaService } from "../../prisma/prisma.service";
import { SearchDto } from "./dto/search.dto";

interface SearchSchoolDocument {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  countryName: string;
  countryCode: string;
  countryKey: string;
  provinceName: string;
  provinceSlug: string;
  provinceKey: string;
  cityName: string;
  citySlug: string;
  cityKey: string;
  levels: SchoolLevel[];
  profileStatus: SchoolProfileStatus;
  monthlyFeeEstimate: number | null;
  studentsCount: number | null;
  ratingAverage: number;
  ratingCount: number;
  googleRating: number | null;
  googleReviewCount: number | null;
  eduAdvisorScore: number;
  leadIntentScore: number;
  rankingBoost: number;
  latitude: number;
  longitude: number;
  _geo: {
    lat: number;
    lng: number;
  };
  website: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  createdAtTs: number;
}

export interface SearchMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface SearchResult {
  items: Array<{
    id: string;
    name: string;
    slug: string;
    levels: SchoolLevel[];
    monthlyFeeEstimate: number | null;
    studentsCount: number | null;
    location: {
      city: string;
      province: string;
      country: string;
      countryCode: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
    profile: {
      status: SchoolProfileStatus;
      label: string;
      badge: string;
      tone: "neutral" | "info" | "success" | "warning";
      verifiedAt: null;
      curatedAt: null;
      premiumSince: null;
      premiumUntil: null;
    };
    rating: {
      average: number;
      count: number;
    };
    quality: {
      google: {
        rating: number | null;
        reviewCount: number | null;
      };
    };
    eduAdvisorScore: number;
    leadIntentScore: number;
    contacts: {
      website: string | null;
      phone: string | null;
      email: string | null;
    };
  }>;
  meta: SearchMeta;
}

@Injectable()
export class SearchIndexService {
  private readonly logger = new Logger(SearchIndexService.name);
  private readonly indexUid = process.env.MEILISEARCH_SCHOOLS_INDEX ?? "schools";
  private readonly meiliHost = process.env.MEILISEARCH_HOST;
  private readonly client: MeiliSearch | null;
  private settingsConfigured = false;
  private bootstrapChecked = false;

  constructor(private readonly prisma: PrismaService) {
    this.client = this.meiliHost
      ? new MeiliSearch({
          host: this.meiliHost,
          apiKey: process.env.MEILISEARCH_API_KEY
        })
      : null;
  }

  async getHealth() {
    if (!this.client) {
      return {
        available: false,
        reason: "MEILISEARCH_HOST is not configured",
        indexUid: this.indexUid
      };
    }

    try {
      const health = await this.client.health();
      const index = this.client.index(this.indexUid);
      const stats = await index.getStats().catch(() => null);

      return {
        available: health.status === "available",
        status: health.status,
        indexUid: this.indexUid,
        documents: stats?.numberOfDocuments ?? 0
      };
    } catch (error) {
      this.logger.warn(`Meilisearch health check failed: ${this.getErrorMessage(error)}`);

      return {
        available: false,
        reason: "Search engine connection failed",
        indexUid: this.indexUid
      };
    }
  }

  async reindexSchools() {
    const index = this.getIndexOrThrow();
    await this.configureIndex(index);

    const documents = await this.buildDocuments();

    const clearTask = await index.deleteAllDocuments();
    await this.client!.waitForTask(clearTask.taskUid);

    if (documents.length > 0) {
      const addTask = await index.addDocuments(documents, { primaryKey: "id" });
      await this.client!.waitForTask(addTask.taskUid);
    }

    const stats = await index.getStats();

    return {
      indexUid: this.indexUid,
      indexedSchools: documents.length,
      documentsInIndex: stats.numberOfDocuments
    };
  }

  async search(query: SearchDto): Promise<SearchResult> {
    if (query.feeMin !== undefined && query.feeMax !== undefined && query.feeMin > query.feeMax) {
      throw new BadRequestException("feeMin cannot be greater than feeMax");
    }

    const index = this.getIndexOrThrow();
    await this.configureIndex(index);
    await this.bootstrapIndexIfEmpty(index);

    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const offset = (page - 1) * limit;

    const result = await index.search<SearchSchoolDocument>(query.q?.trim() ?? "", {
      filter: this.buildFilters(query),
      sort: this.buildSort(query),
      limit,
      offset,
      showRankingScore: true
    });

    const total = result.estimatedTotalHits ?? result.hits.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      items: result.hits.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        levels: item.levels,
        profile: this.toProfileBadge(item.profileStatus),
        monthlyFeeEstimate: item.monthlyFeeEstimate,
        studentsCount: item.studentsCount,
        location: {
          city: item.cityName,
          province: item.provinceName,
          country: item.countryName,
          countryCode: item.countryCode,
          coordinates: {
            latitude: item.latitude,
            longitude: item.longitude
          }
        },
        rating: {
          average: Number(item.ratingAverage.toFixed(2)),
          count: item.ratingCount
        },
        quality: {
          google: {
            rating: item.googleRating,
            reviewCount: item.googleReviewCount
          }
        },
        eduAdvisorScore: item.eduAdvisorScore,
        leadIntentScore: Number(item.leadIntentScore.toFixed(2)),
        contacts: {
          website: item.website,
          phone: item.phone,
          email: item.email
        }
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page * limit < total
      }
    };
  }

  private getIndexOrThrow() {
    if (!this.client) {
      throw new ServiceUnavailableException("Search engine is not configured");
    }

    return this.client.index<SearchSchoolDocument>(this.indexUid);
  }

  private async configureIndex(index: ReturnType<MeiliSearch["index"]>) {
    if (this.settingsConfigured) {
      return;
    }

    const task = await index.updateSettings({
      searchableAttributes: ["name", "description", "cityName", "provinceName", "countryName", "levels"],
      filterableAttributes: [
        "countryKey",
        "countryCode",
        "provinceKey",
        "provinceSlug",
        "cityKey",
        "citySlug",
        "levels",
        "profileStatus",
        "monthlyFeeEstimate",
        "ratingAverage",
        "eduAdvisorScore"
      ],
      sortableAttributes: [
        "name",
        "monthlyFeeEstimate",
        "ratingAverage",
        "eduAdvisorScore",
        "leadIntentScore",
        "rankingBoost",
        "createdAtTs"
      ]
    });

    await this.client!.waitForTask(task.taskUid);
    this.settingsConfigured = true;
  }

  private async bootstrapIndexIfEmpty(index: ReturnType<MeiliSearch["index"]>) {
    if (this.bootstrapChecked) {
      return;
    }

    const stats = await index.getStats().catch(() => ({ numberOfDocuments: 0 }));

    if (stats.numberOfDocuments === 0) {
      await this.reindexSchools();
    }

    this.bootstrapChecked = true;
  }

  private buildFilters(query: SearchDto): string[] | undefined {
    const filters: string[] = [];

    if (query.country) {
      const countryKey = this.normalizeKey(query.country);
      const countryCode = query.country.trim().toUpperCase();
      filters.push(`(countryKey = "${countryKey}" OR countryCode = "${countryCode}")`);
    }

    if (query.province) {
      const provinceKey = this.normalizeKey(query.province);
      filters.push(`(provinceKey = "${provinceKey}" OR provinceSlug = "${provinceKey}")`);
    }

    if (query.city) {
      const cityKey = this.normalizeKey(query.city);
      filters.push(`(cityKey = "${cityKey}" OR citySlug = "${cityKey}")`);
    }

    const levels = this.parseLevelsFilter(query.level);
    if (levels.length > 0) {
      filters.push(`(${levels.map((level) => `levels = "${level}"`).join(" OR ")})`);
    }

    if (query.profileStatus) {
      filters.push(`profileStatus = "${query.profileStatus}"`);
    }

    if (query.feeMin !== undefined) {
      filters.push(`monthlyFeeEstimate >= ${query.feeMin}`);
    }

    if (query.feeMax !== undefined) {
      filters.push(`monthlyFeeEstimate <= ${query.feeMax}`);
    }

    if (query.ratingMin !== undefined) {
      filters.push(`ratingAverage >= ${query.ratingMin}`);
    }

    return filters.length > 0 ? filters : undefined;
  }

  private buildSort(query: SearchDto): string[] | undefined {
    const sortOrder = query.sortOrder ?? "asc";
    const normalizedQuery = query.q?.trim() ?? "";

    if (query.sortBy === "relevance") {
      if (!normalizedQuery) {
        return ["leadIntentScore:desc", "rankingBoost:desc", "eduAdvisorScore:desc", "ratingAverage:desc"];
      }

      return undefined;
    }

    if (query.sortBy === "leadIntentScore") {
      return [`leadIntentScore:${sortOrder}`, "rankingBoost:desc", "ratingAverage:desc"];
    }

    if (query.sortBy === "createdAt") {
      return [`createdAtTs:${sortOrder}`];
    }

    if (!query.sortBy) {
      return undefined;
    }

    return [`${query.sortBy}:${sortOrder}`];
  }

  private async buildDocuments(): Promise<SearchSchoolDocument[]> {
    const schools = await this.prisma.school.findMany({
      where: { active: true },
      include: {
        city: { select: { name: true, slug: true } },
        province: { select: { name: true, slug: true } },
        country: { select: { name: true, isoCode: true } },
        levels: { select: { level: true } },
        scores: {
          select: { score: true, calculatedAt: true },
          orderBy: { calculatedAt: "desc" },
          take: 1
        }
      }
    });

    if (schools.length === 0) {
      return [];
    }

    const schoolIds = schools.map((item) => item.id);
    const ratings = await this.prisma.review.groupBy({
      by: ["schoolId"],
      where: {
        schoolId: { in: schoolIds },
        status: ReviewStatus.APPROVED
      },
      _avg: {
        rating: true
      },
      _count: {
        _all: true
      }
    });

    const ratingMap = new Map(
      ratings.map((item) => [
        item.schoolId,
        {
          average: Number((item._avg.rating ?? 0).toFixed(2)),
          count: item._count._all
        }
      ])
    );

    return schools.map((school) => ({
      id: school.id,
      slug: school.slug,
      name: school.name,
      description: school.description,
      countryName: school.country.name,
      countryCode: school.country.isoCode,
      countryKey: this.normalizeKey(school.country.name),
      provinceName: school.province.name,
      provinceSlug: school.province.slug,
      provinceKey: this.normalizeKey(school.province.name),
      cityName: school.city.name,
      citySlug: school.city.slug,
      cityKey: this.normalizeKey(school.city.name),
      levels: school.levels.map((entry) => entry.level),
      profileStatus: school.profileStatus,
      monthlyFeeEstimate: school.monthlyFeeEstimate,
      studentsCount: school.studentsCount,
      ratingAverage: ratingMap.get(school.id)?.average ?? 0,
      ratingCount: ratingMap.get(school.id)?.count ?? 0,
      googleRating: school.googleRating,
      googleReviewCount: school.googleReviewCount,
      eduAdvisorScore: school.scores[0]?.score ?? 0,
      leadIntentScore: this.calculateLeadIntentScore({
        profileStatus: school.profileStatus,
        phone: school.phone,
        website: school.website,
        email: school.email,
        description: school.description,
        monthlyFeeEstimate: school.monthlyFeeEstimate,
        levelsCount: school.levels.length,
        googleRating: school.googleRating,
        googleReviewCount: school.googleReviewCount,
        eduAdvisorScore: school.scores[0]?.score ?? 0
      }),
      rankingBoost: this.profileRankingBoost(school.profileStatus),
      latitude: school.latitude,
      longitude: school.longitude,
      _geo: {
        lat: school.latitude,
        lng: school.longitude
      },
      website: school.website,
      phone: school.phone,
      email: school.email,
      createdAt: school.createdAt.toISOString(),
      createdAtTs: school.createdAt.getTime()
    }));
  }

  private profileRankingBoost(status: SchoolProfileStatus) {
    if (status === SchoolProfileStatus.PREMIUM) {
      return 12;
    }

    if (status === SchoolProfileStatus.VERIFIED) {
      return 7;
    }

    if (status === SchoolProfileStatus.CURATED) {
      return 3;
    }

    return 0;
  }

  private calculateLeadIntentScore(input: {
    profileStatus: SchoolProfileStatus;
    phone: string | null;
    website: string | null;
    email: string | null;
    description: string | null;
    monthlyFeeEstimate: number | null;
    levelsCount: number;
    googleRating: number | null;
    googleReviewCount: number | null;
    eduAdvisorScore: number;
  }) {
    const profileBase: Record<SchoolProfileStatus, number> = {
      BASIC: 20,
      CURATED: 34,
      VERIFIED: 48,
      PREMIUM: 62
    };

    let score = profileBase[input.profileStatus];

    if (this.hasContent(input.phone)) {
      score += 12;
    }

    if (this.hasContent(input.website)) {
      score += 8;
    }

    if (this.hasContent(input.email)) {
      score += 6;
    }

    if (this.hasContent(input.description)) {
      score += 6;
    }

    if (input.monthlyFeeEstimate !== null) {
      score += 4;
    }

    if (input.levelsCount >= 2) {
      score += 4;
    }

    if (input.googleRating !== null) {
      score += Math.min(12, input.googleRating * 2.4);
    }

    if (input.googleReviewCount !== null) {
      score += Math.min(8, Math.log10(input.googleReviewCount + 1) * 4);
    }

    if (input.eduAdvisorScore > 0) {
      score += Math.min(6, input.eduAdvisorScore / 16);
    }

    return Number(Math.min(100, score).toFixed(2));
  }

  private hasContent(value: string | null) {
    return Boolean(value && value.trim().length > 0);
  }

  private toProfileBadge(status: SchoolProfileStatus) {
    if (status === SchoolProfileStatus.CURATED) {
      return {
        status,
        label: "Updated by EduAdvisor",
        badge: "curated",
        tone: "info" as const,
        verifiedAt: null,
        curatedAt: null,
        premiumSince: null,
        premiumUntil: null
      };
    }

    if (status === SchoolProfileStatus.VERIFIED) {
      return {
        status,
        label: "Verified school",
        badge: "verified",
        tone: "success" as const,
        verifiedAt: null,
        curatedAt: null,
        premiumSince: null,
        premiumUntil: null
      };
    }

    if (status === SchoolProfileStatus.PREMIUM) {
      return {
        status,
        label: "Featured school",
        badge: "premium",
        tone: "warning" as const,
        verifiedAt: null,
        curatedAt: null,
        premiumSince: null,
        premiumUntil: null
      };
    }

    return {
      status,
      label: "Profile not verified",
      badge: "basic",
      tone: "neutral" as const,
      verifiedAt: null,
      curatedAt: null,
      premiumSince: null,
      premiumUntil: null
    };
  }

  private parseLevelsFilter(level?: string): SchoolLevel[] {
    if (!level) {
      return [];
    }

    const parsed = level
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);

    const validValues = new Set(Object.values(SchoolLevel));
    const invalidValues = parsed.filter((item) => !validValues.has(item as SchoolLevel));

    if (invalidValues.length > 0) {
      throw new BadRequestException(`Invalid level values: ${invalidValues.join(", ")}`);
    }

    return parsed as SchoolLevel[];
  }

  private normalizeKey(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
