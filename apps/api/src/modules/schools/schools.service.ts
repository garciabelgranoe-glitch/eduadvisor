import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import {
  ChangeActorType,
  ClaimRequestType,
  ClaimStatus,
  ImportRunStatus,
  ImportSource,
  Prisma,
  ReviewStatus,
  SchoolLevel,
  SchoolProfileStatus,
  SubscriptionStatus,
  VerificationMethod
} from "@prisma/client";
import { CacheService } from "../../common/cache/cache.service";
import { PrismaService } from "../../prisma/prisma.service";
import { ProductEventsService } from "../product-events/product-events.service";
import { CreateClaimRequestDto } from "./dto/create-claim-request.dto";
import { ListClaimRequestsDto } from "./dto/list-claim-requests.dto";
import { ListImportRunsDto } from "./dto/list-import-runs.dto";
import { ListSeoCitiesDto } from "./dto/list-seo-cities.dto";
import { ListSeoSitemapDto } from "./dto/list-seo-sitemap.dto";
import { ListSchoolsDto } from "./dto/list-schools.dto";
import { RunImportDto } from "./dto/run-import.dto";
import { UpdateClaimRequestStatusDto } from "./dto/update-claim-request-status.dto";
import { UpdateSchoolProfileDto } from "./dto/update-school-profile.dto";

export type CatalogSort = "name" | "monthlyFeeEstimate" | "createdAt" | "relevance" | "leadIntentScore";

export interface SchoolSearchQuery extends Omit<ListSchoolsDto, "sortBy"> {
  q?: string;
  sortBy?: CatalogSort;
}

type SeoScopeQuery = Pick<ListSeoCitiesDto, "country" | "province">;

const schoolListInclude = Prisma.validator<Prisma.SchoolInclude>()({
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
  levels: {
    select: {
      level: true
    }
  },
  scores: {
    select: {
      score: true,
      calculatedAt: true
    },
    orderBy: {
      calculatedAt: "desc"
    },
    take: 1
  },
  photos: {
    select: {
      url: true,
      isPrimary: true,
      sortOrder: true
    },
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }]
  }
});

const schoolDetailInclude = Prisma.validator<Prisma.SchoolInclude>()({
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
  levels: {
    select: {
      level: true
    }
  },
  scores: {
    select: {
      score: true,
      calculatedAt: true
    },
    orderBy: {
      calculatedAt: "desc"
    },
    take: 1
  },
  reviews: {
    where: {
      status: ReviewStatus.APPROVED
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 20,
    select: {
      id: true,
      rating: true,
      comment: true,
      schoolResponse: true,
      schoolResponseAt: true,
      createdAt: true
    }
  },
  photos: {
    select: {
      url: true,
      isPrimary: true,
      sortOrder: true
    },
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }]
  }
});

type SchoolListModel = Prisma.SchoolGetPayload<{ include: typeof schoolListInclude }>;

interface ImportFixtureRow {
  externalId: string;
  name: string;
  city: string;
  province: string;
  address: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  photoUrls: string[];
  description: string | null;
}

interface GoogleSearchTextResponse {
  places?: Array<{
    id?: string;
    name?: string;
    displayName?: {
      text?: string;
    };
    formattedAddress?: string;
    location?: {
      latitude?: number;
      longitude?: number;
    };
    rating?: number;
    userRatingCount?: number;
    nationalPhoneNumber?: string;
    internationalPhoneNumber?: string;
    websiteUri?: string;
    editorialSummary?: {
      text?: string;
    };
  }>;
  nextPageToken?: string;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

interface GooglePlaceDetailsResponse {
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  editorialSummary?: {
    text?: string;
  };
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

@Injectable()
export class SchoolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly productEvents: ProductEventsService
  ) {}

  async listSchools(query: ListSchoolsDto) {
    return this.cache.getOrSetJson("schools:list", query, 180, () => this.findSchools(query));
  }

  async searchSchools(query: SchoolSearchQuery) {
    return this.cache.getOrSetJson("schools:search", query, 90, () => this.findSchools(query));
  }

  async listSeoCities(query: ListSeoCitiesDto) {
    return this.cache.getOrSetJson("schools:seo:cities", query, 600, async () => {
      const where = this.buildSeoScopeWhere(query);
      const limit = query.limit ?? 200;

      const grouped = await this.prisma.school.groupBy({
        by: ["cityId"],
        where,
        _count: {
          _all: true
        },
        _avg: {
          monthlyFeeEstimate: true
        }
      });

      if (grouped.length === 0) {
        return {
          items: [],
          meta: {
            total: 0,
            limit
          }
        };
      }

      const cityIds = grouped.map((item) => item.cityId);
      const cities = await this.prisma.city.findMany({
        where: {
          id: {
            in: cityIds
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          latitude: true,
          longitude: true,
          province: {
            select: {
              name: true,
              slug: true,
              country: {
                select: {
                  name: true,
                  isoCode: true
                }
              }
            }
          }
        }
      });

      const cityById = new Map(cities.map((city) => [city.id, city]));

      const items = grouped
        .map((group) => {
          const city = cityById.get(group.cityId);
          if (!city) {
            return null;
          }

          return {
            city: city.name,
            slug: city.slug,
            province: city.province.name,
            provinceSlug: city.province.slug,
            country: city.province.country.name,
            countryCode: city.province.country.isoCode,
            coordinates: {
              latitude: city.latitude,
              longitude: city.longitude
            },
            schoolCount: group._count._all,
            averageMonthlyFee:
              group._avg.monthlyFeeEstimate !== null ? Number(group._avg.monthlyFeeEstimate.toFixed(0)) : null
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => {
          if (b.schoolCount !== a.schoolCount) {
            return b.schoolCount - a.schoolCount;
          }
          return a.city.localeCompare(b.city, "es");
        });

      return {
        items: items.slice(0, limit),
        meta: {
          total: items.length,
          limit
        }
      };
    });
  }

  async getSeoCityBySlug(citySlug: string) {
    const normalizedSlug = citySlug.trim().toLowerCase();
    return this.cache.getOrSetJson("schools:seo:city-detail", { citySlug: normalizedSlug }, 600, async () => {
      const city = await this.prisma.city.findFirst({
        where: {
          slug: normalizedSlug,
          schools: {
            some: {
              active: true
            }
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          latitude: true,
          longitude: true,
          province: {
            select: {
              name: true,
              slug: true,
              country: {
                select: {
                  name: true,
                  isoCode: true
                }
              }
            }
          }
        }
      });

      if (!city) {
        throw new NotFoundException("City landing not found");
      }

      const [schoolCount, feeAggregate, levelAggregate, latestSchool] = await Promise.all([
        this.prisma.school.count({
          where: {
            cityId: city.id,
            active: true
          }
        }),
        this.prisma.school.aggregate({
          where: {
            cityId: city.id,
            active: true
          },
          _avg: {
            monthlyFeeEstimate: true
          },
          _min: {
            monthlyFeeEstimate: true
          },
          _max: {
            monthlyFeeEstimate: true
          }
        }),
        this.prisma.schoolToLevel.groupBy({
          by: ["level"],
          where: {
            school: {
              cityId: city.id,
              active: true
            }
          },
          _count: {
            _all: true
          }
        }),
        this.prisma.school.findFirst({
          where: {
            cityId: city.id,
            active: true
          },
          orderBy: {
            updatedAt: "desc"
          },
          select: {
            updatedAt: true
          }
        })
      ]);

      const levelDistribution = {
        INICIAL: 0,
        PRIMARIA: 0,
        SECUNDARIA: 0
      };

      for (const aggregate of levelAggregate) {
        levelDistribution[aggregate.level] = aggregate._count._all;
      }

      return {
        city: {
          name: city.name,
          slug: city.slug,
          province: city.province.name,
          provinceSlug: city.province.slug,
          country: city.province.country.name,
          countryCode: city.province.country.isoCode,
          coordinates: {
            latitude: city.latitude,
            longitude: city.longitude
          }
        },
        stats: {
          schoolCount,
          averageMonthlyFee:
            feeAggregate._avg.monthlyFeeEstimate !== null
              ? Number(feeAggregate._avg.monthlyFeeEstimate.toFixed(0))
              : null,
          monthlyFeeRange: {
            min: feeAggregate._min.monthlyFeeEstimate,
            max: feeAggregate._max.monthlyFeeEstimate
          },
          levelDistribution,
          lastSchoolUpdateAt: latestSchool?.updatedAt ?? null
        }
      };
    });
  }

  async getSeoSitemap(query: ListSeoSitemapDto) {
    return this.cache.getOrSetJson("schools:seo:sitemap", query, 600, async () => {
      const limit = query.limit ?? 5000;
      const where: Prisma.SchoolWhereInput = {
        active: true
      };

      const [schools, cityGroups] = await Promise.all([
        this.prisma.school.findMany({
          where,
          select: {
            slug: true,
            updatedAt: true
          },
          orderBy: {
            updatedAt: "desc"
          },
          take: limit
        }),
        this.prisma.school.groupBy({
          by: ["cityId"],
          where,
          _count: {
            _all: true
          },
          _max: {
            updatedAt: true
          }
        })
      ]);

      const cityGroupsLimited = cityGroups
        .sort((a, b) => {
          if (b._count._all !== a._count._all) {
            return b._count._all - a._count._all;
          }
          return a.cityId.localeCompare(b.cityId);
        })
        .slice(0, limit);

      const cityIds = cityGroupsLimited.map((group) => group.cityId);
      const cities = await this.prisma.city.findMany({
        where: {
          id: {
            in: cityIds
          }
        },
        select: {
          id: true,
          slug: true
        }
      });

      const citySlugById = new Map(cities.map((city) => [city.id, city.slug]));

      return {
        generatedAt: new Date().toISOString(),
        schools: schools.map((school) => ({
          slug: school.slug,
          lastModified: school.updatedAt.toISOString()
        })),
        cities: cityGroupsLimited
          .map((group) => {
            const slug = citySlugById.get(group.cityId);
            if (!slug) {
              return null;
            }

            return {
              slug,
              schoolCount: group._count._all,
              lastModified: group._max.updatedAt?.toISOString() ?? null
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
      };
    });
  }

  async getSchoolBySlug(slug: string) {
    const normalizedSlug = slug.trim().toLowerCase();
    return this.cache.getOrSetJson("schools:detail", { slug: normalizedSlug }, 300, async () => {
      const school = await this.prisma.school.findUnique({
        where: { slug: normalizedSlug },
        include: schoolDetailInclude
      });

      if (!school || !school.active) {
        throw new NotFoundException("School not found");
      }

      const aggregate = await this.prisma.review.aggregate({
        where: {
          schoolId: school.id,
          status: ReviewStatus.APPROVED
        },
        _avg: { rating: true },
        _count: { _all: true }
      });

      return {
        id: school.id,
        name: school.name,
        slug: school.slug,
        description: school.description,
        profile: this.mapProfileState(school.profileStatus, {
          verifiedAt: school.verifiedAt,
          curatedAt: school.curatedAt,
          premiumSince: school.premiumSince,
          premiumUntil: school.premiumUntil
        }),
        levels: school.levels.map((item) => item.level),
        monthlyFeeEstimate: school.monthlyFeeEstimate,
        enrollmentFee: school.enrollmentFee,
        scholarshipsAvailable: school.scholarshipsAvailable,
        studentsCount: school.studentsCount,
        location: {
          city: school.city.name,
          province: school.province.name,
          country: school.country.name,
          addressLine: school.addressLine,
          postalCode: school.postalCode,
          coordinates: {
            latitude: school.latitude,
            longitude: school.longitude
          }
        },
        quality: {
          profileCompleteness: school.profileCompleteness,
          dataFreshnessAt: school.dataFreshnessAt,
          google: {
            placeId: school.googlePlaceId,
            rating: school.googleRating,
            reviewCount: school.googleReviewCount
          }
        },
        contacts: {
          website: school.website,
          phone: school.phone,
          email: school.email
        },
        media: this.mapSchoolMedia(school.photos),
        eduAdvisorScore: school.scores[0]?.score ?? null,
        rating: {
          average: aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(2)) : null,
          count: aggregate._count._all
        },
        reviews: school.reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          schoolResponse: review.schoolResponse,
          schoolResponseAt: review.schoolResponseAt,
          createdAt: review.createdAt
        }))
      };
    });
  }

  async getSchoolDashboard(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        city: {
          select: { name: true, slug: true }
        },
        province: {
          select: { name: true, slug: true }
        },
        country: {
          select: { name: true, isoCode: true }
        },
        levels: {
          select: { level: true }
        },
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
            currency: true,
            startsAt: true,
            endsAt: true,
            trialEndsAt: true
          }
        },
        photos: {
          select: {
            url: true,
            isPrimary: true,
            sortOrder: true
          },
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }]
        }
      }
    });

    if (!school || !school.active) {
      throw new NotFoundException("School not found");
    }

    const [
      leadGroups,
      reviewsApproved,
      reviewsPending,
      reviewsResponded,
      ratingAggregate,
      recentLeads,
      recentReviews,
      reviewResponseTimes,
      pendingReviewResponseSlaBreaches,
      leadTrendRaw
    ] =
      await Promise.all([
        this.prisma.lead.groupBy({
          by: ["status"],
          where: { schoolId },
          _count: { _all: true }
        }),
        this.prisma.review.count({
          where: {
            schoolId,
            status: ReviewStatus.APPROVED
          }
        }),
        this.prisma.review.count({
          where: {
            schoolId,
            status: ReviewStatus.PENDING
          }
        }),
        this.prisma.review.count({
          where: {
            schoolId,
            status: ReviewStatus.APPROVED,
            schoolResponseAt: {
              not: null
            }
          }
        }),
        this.prisma.review.aggregate({
          where: {
            schoolId,
            status: ReviewStatus.APPROVED
          },
          _avg: {
            rating: true
          }
        }),
        this.prisma.lead.findMany({
          where: { schoolId },
          orderBy: { createdAt: "desc" },
          take: 20,
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
        this.prisma.review.findMany({
          where: {
            schoolId,
            status: ReviewStatus.APPROVED
          },
          orderBy: {
            createdAt: "desc"
          },
          take: 12,
          select: {
            id: true,
            rating: true,
            comment: true,
            schoolResponse: true,
            schoolResponseAt: true,
            createdAt: true
          }
        }),
        this.prisma.review.findMany({
          where: {
            schoolId,
            status: ReviewStatus.APPROVED,
            schoolResponseAt: {
              not: null
            }
          },
          select: {
            createdAt: true,
            schoolResponseAt: true
          }
        }),
        this.prisma.review.count({
          where: {
            schoolId,
            status: ReviewStatus.APPROVED,
            schoolResponseAt: null,
            createdAt: {
              lte: this.getHoursAgoDate(72)
            }
          }
        }),
        this.prisma.lead.findMany({
          where: {
            schoolId,
            createdAt: {
              gte: this.getMonthsAgoDate(5)
            }
          },
          select: {
            createdAt: true
          }
        })
      ]);

    const leadByStatus = {
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      CLOSED: 0
    };

    for (const item of leadGroups) {
      leadByStatus[item.status] = item._count._all;
    }

    const leadsTotal = Object.values(leadByStatus).reduce((acc, value) => acc + value, 0);
    const conversionRate = leadsTotal === 0 ? 0 : Number(((leadByStatus.CLOSED / leadsTotal) * 100).toFixed(1));
    const reviewResponseRate =
      reviewsApproved === 0 ? 0 : Number(((reviewsResponded / reviewsApproved) * 100).toFixed(1));
    const averageReviewResponseHours = this.computeAverageReviewResponseHours(reviewResponseTimes);

    const profileFields = [
      school.description,
      school.website,
      school.phone,
      school.email,
      school.monthlyFeeEstimate,
      school.studentsCount,
      school.levels.length > 0 ? school.levels.length : null
    ];
    const profileCompleteness = Number(
      ((profileFields.filter((field) => field !== null && field !== undefined && field !== "").length /
        profileFields.length) *
        100).toFixed(0)
    );
    const currentSubscription = school.subscriptions[0] ?? null;
    const entitlements = this.resolveSchoolEntitlements(school.profileStatus, currentSubscription);

    return {
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        profile: this.mapProfileState(school.profileStatus, {
          verifiedAt: school.verifiedAt,
          curatedAt: school.curatedAt,
          premiumSince: school.premiumSince,
          premiumUntil: school.premiumUntil
        }),
        description: school.description,
        monthlyFeeEstimate: school.monthlyFeeEstimate,
        enrollmentFee: school.enrollmentFee,
        scholarshipsAvailable: school.scholarshipsAvailable,
        studentsCount: school.studentsCount,
        levels: school.levels.map((item) => item.level),
        location: {
          city: school.city.name,
          province: school.province.name,
          country: school.country.name,
          countryCode: school.country.isoCode,
          addressLine: school.addressLine,
          postalCode: school.postalCode,
          coordinates: {
            latitude: school.latitude,
            longitude: school.longitude
          }
        },
        contacts: {
          website: school.website,
          phone: school.phone,
          email: school.email
        },
        media: this.mapSchoolMedia(school.photos),
        billing: {
          currentPlan: this.mapSubscriptionSummary(currentSubscription),
          entitlements
        }
      },
      stats: {
        leadsTotal,
        leadsByStatus: leadByStatus,
        conversionRate,
        reviewsApproved,
        reviewsPending,
        reviewsResponded,
        reviewResponseRate,
        averageReviewResponseHours,
        pendingReviewResponseSlaBreaches,
        ratingAverage: ratingAggregate._avg.rating ? Number(ratingAggregate._avg.rating.toFixed(2)) : null,
        profileCompleteness: school.profileCompleteness > 0 ? school.profileCompleteness : profileCompleteness
      },
      recentLeads,
      recentReviews,
      leadTrend: this.buildMonthlyLeadTrend(leadTrendRaw.map((lead) => lead.createdAt))
    };
  }

  async getSchoolBilling(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        slug: true,
        profileStatus: true,
        premiumSince: true,
        premiumUntil: true,
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
            currency: true,
            startsAt: true,
            endsAt: true,
            trialEndsAt: true
          }
        }
      }
    });

    if (!school) {
      throw new NotFoundException("School not found");
    }

    const currentSubscription = school.subscriptions[0] ?? null;
    const entitlements = this.resolveSchoolEntitlements(school.profileStatus, currentSubscription);

    return {
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        profile: this.mapProfileState(school.profileStatus, {
          premiumSince: school.premiumSince,
          premiumUntil: school.premiumUntil
        })
      },
      billing: {
        currentPlan: this.mapSubscriptionSummary(currentSubscription),
        entitlements,
        upsell: entitlements.canUsePremiumLeadExport
          ? null
          : {
              message: "Activa plan Premium para exportar leads y acceder a herramientas comerciales avanzadas.",
              ctaLabel: "Solicitar upgrade",
              ctaPath: "/para-colegios"
            }
      }
    };
  }

  async exportSchoolLeadsCsv(schoolId: string) {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        slug: true,
        profileStatus: true,
        subscriptions: {
          orderBy: {
            startsAt: "desc"
          },
          take: 1,
          select: {
            status: true,
            endsAt: true
          }
        }
      }
    });

    if (!school) {
      throw new NotFoundException("School not found");
    }

    const entitlements = this.resolveSchoolEntitlements(school.profileStatus, school.subscriptions[0] ?? null);
    if (!entitlements.canUsePremiumLeadExport) {
      throw new ForbiddenException("Premium subscription required to export leads");
    }

    const leads = await this.prisma.lead.findMany({
      where: {
        schoolId
      },
      orderBy: {
        createdAt: "desc"
      },
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
    });

    const headers = [
      "lead_id",
      "parent_name",
      "child_age",
      "education_level",
      "phone",
      "email",
      "status",
      "created_at",
      "updated_at"
    ];
    const rows = leads.map((lead) => [
      lead.id,
      lead.parentName,
      String(lead.childAge),
      lead.educationLevel,
      lead.phone,
      lead.email,
      lead.status,
      lead.createdAt.toISOString(),
      lead.updatedAt.toISOString()
    ]);
    const csvLines = [headers, ...rows].map((row) => row.map((value) => this.escapeCsvCell(value)).join(","));

    return {
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug
      },
      exportedAt: new Date().toISOString(),
      fileName: `leads-${school.slug}-${new Date().toISOString().slice(0, 10)}.csv`,
      contentType: "text/csv; charset=utf-8",
      csv: csvLines.join("\n")
    };
  }

  async updateSchoolProfile(schoolId: string, payload: UpdateSchoolProfileDto) {
    const existing = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        active: true,
        profileStatus: true,
        name: true,
        slug: true,
        description: true,
        website: true,
        phone: true,
        email: true,
        monthlyFeeEstimate: true,
        studentsCount: true,
        subscriptions: {
          orderBy: {
            startsAt: "desc"
          },
          take: 1,
          select: {
            status: true,
            endsAt: true
          }
        },
        photos: {
          where: {
            source: ImportSource.MANUAL
          },
          select: {
            url: true,
            isPrimary: true,
            sortOrder: true
          },
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }]
        }
      }
    });

    if (!existing || !existing.active) {
      throw new NotFoundException("School not found");
    }

    const normalizedWebsite = this.normalizeNullableString(payload.website);
    const normalizedPhone = this.normalizeNullableString(payload.phone);
    const normalizedEmail = this.normalizeNullableString(payload.email)?.toLowerCase() ?? null;
    const normalizedDescription = this.normalizeNullableString(payload.description);
    const normalizedName = payload.name?.trim();
    const normalizedMonthlyFeeEstimate = payload.monthlyFeeEstimate;
    const normalizedStudentsCount = payload.studentsCount;
    const normalizedLogoUrl =
      payload.logoUrl === undefined ? undefined : this.normalizeNullableString(payload.logoUrl);
    const normalizedGalleryUrls =
      payload.galleryUrls === undefined
        ? undefined
        : Array.from(
            new Set(
              payload.galleryUrls
                .map((value) => value.trim())
                .filter((value) => value.length > 0)
            )
          ).slice(0, 12);
    const currentSubscription = existing.subscriptions[0] ?? null;
    const entitlements = this.resolveSchoolEntitlements(existing.profileStatus, currentSubscription);
    const existingMedia = this.mapSchoolMedia(existing.photos);
    const mediaUpdateRequested = normalizedLogoUrl !== undefined || normalizedGalleryUrls !== undefined;

    if (mediaUpdateRequested && !entitlements.canAccessPriorityPlacement) {
      throw new ForbiddenException("La edición de logo e imágenes requiere un plan Premium activo.");
    }

    const changedFields = this.computeProfileChangedFields({
      existing: {
        ...existing,
        logoUrl: existingMedia.logoUrl,
        galleryUrls: existingMedia.galleryUrls
      },
      next: {
        name: normalizedName,
        description: normalizedDescription,
        website: normalizedWebsite,
        phone: normalizedPhone,
        email: normalizedEmail,
        monthlyFeeEstimate: normalizedMonthlyFeeEstimate,
        studentsCount: normalizedStudentsCount,
        levels: payload.levels,
        logoUrl: normalizedLogoUrl,
        galleryUrls: normalizedGalleryUrls
      }
    });
    let updatedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.school.update({
        where: { id: schoolId },
        data: {
          name: normalizedName,
          description: normalizedDescription,
          website: normalizedWebsite,
          phone: normalizedPhone,
          email: normalizedEmail,
          monthlyFeeEstimate: payload.monthlyFeeEstimate,
          studentsCount: payload.studentsCount,
          latitude: payload.latitude,
          longitude: payload.longitude,
          profileStatus: {
            set:
              existing.profileStatus === SchoolProfileStatus.VERIFIED || existing.profileStatus === SchoolProfileStatus.PREMIUM
                ? existing.profileStatus
                : SchoolProfileStatus.CURATED
          },
          curatedAt: new Date(),
          profileCompleteness: this.estimateProfileCompleteness({
            name: payload.name,
            description: normalizedDescription,
            website: normalizedWebsite,
            phone: normalizedPhone,
            email: normalizedEmail,
            monthlyFeeEstimate: payload.monthlyFeeEstimate,
            studentsCount: payload.studentsCount
          })
        },
        select: {
          updatedAt: true
        }
      });
      updatedAt = updated.updatedAt;

      if (payload.levels) {
        const uniqueLevels = Array.from(new Set(payload.levels));
        await tx.schoolToLevel.deleteMany({
          where: { schoolId }
        });

        if (uniqueLevels.length > 0) {
          await tx.schoolToLevel.createMany({
            data: uniqueLevels.map((level) => ({
              schoolId,
              level
            }))
          });
        }
      }

      if (mediaUpdateRequested) {
        const logoToPersist = normalizedLogoUrl !== undefined ? normalizedLogoUrl : existingMedia.logoUrl;
        const galleryCandidate = normalizedGalleryUrls !== undefined ? normalizedGalleryUrls : existingMedia.galleryUrls;
        const galleryToPersist = galleryCandidate.filter((url) => url !== logoToPersist);

        await tx.schoolPhoto.deleteMany({
          where: {
            schoolId,
            source: ImportSource.MANUAL
          }
        });

        const photosToCreate = [
          ...(logoToPersist
            ? [
                {
                  schoolId,
                  source: ImportSource.MANUAL,
                  url: logoToPersist,
                  isPrimary: true,
                  sortOrder: 0
                }
              ]
            : []),
          ...galleryToPersist.map((url, index) => ({
            schoolId,
            source: ImportSource.MANUAL,
            url,
            isPrimary: false,
            sortOrder: index + 1
          }))
        ];

        if (photosToCreate.length > 0) {
          await tx.schoolPhoto.createMany({
            data: photosToCreate
          });
        }
      }
    });

    await this.cache.invalidateMany([
      "schools:list",
      "schools:search",
      "schools:detail",
      "schools:seo:cities",
      "schools:seo:city-detail",
      "schools:seo:sitemap",
      "search",
      "rankings",
      "insights"
    ]);

    if (changedFields.length > 0) {
      try {
        await this.productEvents.emitSchoolProfileUpdated({
          schoolId: existing.id,
          schoolName: normalizedName ?? existing.name,
          schoolSlug: existing.slug,
          updatedAt,
          changedFields,
          previousMonthlyFeeEstimate: existing.monthlyFeeEstimate,
          monthlyFeeEstimate: normalizedMonthlyFeeEstimate ?? existing.monthlyFeeEstimate
        });
      } catch (error) {
        // School profile updates should not fail if alert dispatch has a transient issue.
        // eslint-disable-next-line no-console
        console.warn("school-profile-update-event-failed", {
          schoolId: existing.id,
          error
        });
      }
    }

    return this.getSchoolDashboard(schoolId);
  }

  async createClaimRequest(payload: CreateClaimRequestDto) {
    const normalizedName = payload.schoolName.trim();
    const normalizedCity = payload.city.trim();
    const normalizedProvince = payload.province.trim();
    const normalizedEmail = payload.email.trim().toLowerCase();
    const normalizedPhone = payload.phone.trim();
    const normalizedRole = payload.contactRole.trim();
    const normalizedContactName = payload.contactName.trim();
    const normalizedWebsite = this.normalizeNullableString(payload.website);
    const normalizedMessage = this.normalizeNullableString(payload.message);

    const school = payload.schoolSlug
      ? await this.prisma.school.findUnique({
          where: { slug: payload.schoolSlug.trim().toLowerCase() },
          select: { id: true, profileStatus: true, name: true, city: { select: { name: true } } }
        })
      : null;

    if (payload.requestType === ClaimRequestType.CLAIM && payload.schoolSlug && !school) {
      throw new NotFoundException("School not found for claim request");
    }

    const requestedType = payload.requestType ?? ClaimRequestType.CLAIM;
    const pendingDuplicate = await this.prisma.schoolClaimRequest.findFirst({
      where: {
        requestType: requestedType,
        status: {
          in: [ClaimStatus.PENDING, ClaimStatus.UNDER_REVIEW]
        },
        representative: {
          is: {
            email: normalizedEmail
          }
        },
        schoolId: school?.id,
        requestedSchoolName: {
          equals: normalizedName,
          mode: "insensitive"
        },
        requestedCity: {
          equals: normalizedCity,
          mode: "insensitive"
        },
        requestedProvince: {
          equals: normalizedProvince,
          mode: "insensitive"
        }
      },
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    });

    if (pendingDuplicate) {
      throw new ConflictException(
        "Ya existe una solicitud activa para este colegio y este contacto. Te escribiremos al correo registrado."
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const representative = await tx.schoolRepresentative.create({
        data: {
          schoolId: school?.id,
          fullName: normalizedContactName,
          role: normalizedRole,
          email: normalizedEmail,
          phone: normalizedPhone
        }
      });

      const request = await tx.schoolClaimRequest.create({
        data: {
          schoolId: school?.id,
          representativeId: representative.id,
          requestType: requestedType,
          requestedSchoolName: normalizedName,
          requestedCity: normalizedCity,
          requestedProvince: normalizedProvince,
          requestedWebsite: normalizedWebsite,
          notes: normalizedMessage
        }
      });

      return {
        request,
        representative
      };
    });

    return {
      requestId: result.request.id,
      status: result.request.status,
      requestType: result.request.requestType,
      schoolId: result.request.schoolId,
      createdAt: result.request.createdAt
    };
  }

  async listClaimRequests(query: ListClaimRequestsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const text = query.q?.trim();

    const where: Prisma.SchoolClaimRequestWhereInput = {
      status: query.status,
      requestType: query.requestType,
      OR: text
        ? [
            { requestedSchoolName: { contains: text, mode: "insensitive" } },
            { requestedCity: { contains: text, mode: "insensitive" } },
            { requestedProvince: { contains: text, mode: "insensitive" } },
            { representative: { email: { contains: text, mode: "insensitive" } } },
            { representative: { fullName: { contains: text, mode: "insensitive" } } },
            { school: { slug: { contains: text, mode: "insensitive" } } }
          ]
        : undefined
    };

    const [items, total] = await Promise.all([
      this.prisma.schoolClaimRequest.findMany({
        where,
        include: {
          school: {
            select: {
              id: true,
              name: true,
              slug: true,
              profileStatus: true
            }
          },
          representative: {
            select: {
              id: true,
              fullName: true,
              role: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          [query.sortBy ?? "createdAt"]: query.sortOrder ?? "desc"
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.schoolClaimRequest.count({ where })
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        requestType: item.requestType,
        status: item.status,
        verificationMethod: item.verificationMethod,
        requestedSchool: {
          name: item.requestedSchoolName,
          city: item.requestedCity,
          province: item.requestedProvince,
          country: item.requestedCountry,
          website: item.requestedWebsite
        },
        representative: item.representative,
        school: item.school
          ? {
              ...item.school,
              profile: this.mapProfileState(item.school.profileStatus)
            }
          : null,
        notes: item.notes,
        reviewedAt: item.reviewedAt,
        reviewedBy: item.reviewedBy,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })),
      meta: this.buildMeta(total, page, limit)
    };
  }

  async updateClaimRequestStatus(claimRequestId: string, payload: UpdateClaimRequestStatusDto) {
    const existing = await this.prisma.schoolClaimRequest.findUnique({
      where: { id: claimRequestId },
      include: {
        school: {
          select: {
            id: true,
            profileStatus: true
          }
        }
      }
    });

    if (!existing) {
      throw new NotFoundException("Claim request not found");
    }

    if (
      (existing.status === ClaimStatus.APPROVED || existing.status === ClaimStatus.REJECTED) &&
      existing.status !== payload.status
    ) {
      throw new BadRequestException("Terminal claim requests cannot change status");
    }

    if (payload.status === ClaimStatus.APPROVED && !payload.verificationMethod) {
      throw new BadRequestException("verificationMethod is required when approving a claim request");
    }

    const now = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const claim = await tx.schoolClaimRequest.update({
        where: { id: claimRequestId },
        data: {
          status: payload.status,
          verificationMethod: payload.status === ClaimStatus.APPROVED ? payload.verificationMethod : null,
          verifiedAt: payload.status === ClaimStatus.APPROVED ? now : null,
          reviewedAt: now,
          reviewedBy: "admin",
          notes: this.normalizeNullableString(payload.notes)
        }
      });

      if (claim.schoolId && payload.status === ClaimStatus.APPROVED) {
        await tx.school.update({
          where: { id: claim.schoolId },
          data: {
            profileStatus: SchoolProfileStatus.VERIFIED,
            verifiedAt: now
          }
        });

        if (claim.representativeId) {
          await tx.schoolRepresentative.update({
            where: { id: claim.representativeId },
            data: {
              verifiedAt: now
            }
          });
        }

        if (existing.school?.profileStatus !== SchoolProfileStatus.VERIFIED) {
          await tx.schoolProfileChangeLog.create({
            data: {
              schoolId: claim.schoolId,
              actorType: ChangeActorType.ADMIN,
              actorId: "admin",
              fieldName: "profileStatus",
              fromValue: existing.school?.profileStatus ? this.asJsonInput(existing.school.profileStatus) : undefined,
              toValue: this.asJsonInput(SchoolProfileStatus.VERIFIED),
              source: ImportSource.MANUAL,
              note: "Profile verified from claim request approval"
            }
          });
        }
      }

      return claim;
    });

    await this.cache.invalidateMany(["schools:list", "schools:search", "schools:detail", "search", "rankings"]);

    return updated;
  }

  async runImport(payload: RunImportDto) {
    const source = payload.source ?? ImportSource.GOOGLE_PLACES;
    const countryCode = (payload.countryCode ?? "AR").toUpperCase();

    const run = await this.prisma.schoolImportRun.create({
      data: {
        source,
        status: ImportRunStatus.RUNNING,
        countryCode,
        province: this.normalizeNullableString(payload.province) ?? undefined,
        city: this.normalizeNullableString(payload.city) ?? undefined,
        query: this.normalizeNullableString(payload.query) ?? undefined,
        startedAt: new Date()
      }
    });

    let rows: ImportFixtureRow[] = [];
    let importNote: string;

    try {
      if (source === ImportSource.GOOGLE_PLACES) {
        rows = await this.buildGoogleImportRows(payload, countryCode);
        importNote = "Google Places real import";
      } else {
        rows = this.buildImportFixtureRows(payload);
        importNote = "Manual import fixture";
      }
    } catch (error) {
      if (payload.useFixtureFallback) {
        rows = this.buildImportFixtureRows(payload);
        importNote = `Fixture fallback import (${this.getErrorMessage(error)})`;
      } else {
        const failedRun = await this.prisma.schoolImportRun.update({
          where: { id: run.id },
          data: {
            status: ImportRunStatus.FAILED,
            finishedAt: new Date(),
            totalFetched: 0,
            errorCount: 1,
            notes: `Import failed before processing rows: ${this.getErrorMessage(error)}`
          }
        });

        return failedRun;
      }
    }

    let createdCount = 0;
    let updatedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    for (const row of rows) {
      const payloadHash = this.hashPayload(row);

      try {
        const { countryId, provinceId, cityId } = await this.ensureGeoContext({
          countryCode,
          provinceName: row.province,
          cityName: row.city
        });
        const schoolResult = await this.upsertImportedSchool({
          runId: run.id,
          source,
          payload: row,
          payloadHash,
          countryId,
          provinceId,
          cityId
        });

        if (schoolResult.operation === "CREATED") {
          createdCount += 1;
        } else if (schoolResult.operation === "UPDATED") {
          updatedCount += 1;
        } else {
          duplicateCount += 1;
        }
      } catch (error) {
        errorCount += 1;
        await this.prisma.schoolImportItem.create({
          data: {
            runId: run.id,
            source,
            externalId: row.externalId,
            operation: "ERROR",
            payloadHash,
            errorMessage: this.getErrorMessage(error),
            rawPayload: this.asJsonInput(row)
          }
        });
      }
    }

    const status =
      errorCount === 0 ? ImportRunStatus.COMPLETED : errorCount < rows.length ? ImportRunStatus.PARTIAL_FAILED : ImportRunStatus.FAILED;

    const finishedRun = await this.prisma.schoolImportRun.update({
      where: { id: run.id },
      data: {
        status,
        finishedAt: new Date(),
        totalFetched: rows.length,
        createdCount,
        updatedCount,
        duplicateCount,
        errorCount,
        notes: importNote
      }
    });

    await this.cache.invalidateMany([
      "schools:list",
      "schools:search",
      "schools:detail",
      "schools:seo:cities",
      "schools:seo:city-detail",
      "schools:seo:sitemap",
      "search",
      "rankings"
    ]);

    return finishedRun;
  }

  async listImportRuns(query: ListImportRunsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.SchoolImportRunWhereInput = {
      source: query.source,
      status: query.status
    };

    const [items, total] = await Promise.all([
      this.prisma.schoolImportRun.findMany({
        where,
        orderBy: {
          [query.sortBy ?? "createdAt"]: query.sortOrder ?? "desc"
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.schoolImportRun.count({ where })
    ]);

    return {
      items,
      meta: this.buildMeta(total, page, limit)
    };
  }

  async getImportRunById(runId: string) {
    const run = await this.prisma.schoolImportRun.findUnique({
      where: { id: runId },
      include: {
        items: {
          orderBy: {
            createdAt: "desc"
          },
          take: 200
        }
      }
    });

    if (!run) {
      throw new NotFoundException("Import run not found");
    }

    return run;
  }

  private async findSchools(query: SchoolSearchQuery) {
    this.validateFeeRange(query.feeMin, query.feeMax);

    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const whereWithoutRating = this.buildWhereClause(query);
    const where = await this.applyRatingFilter(whereWithoutRating, query.ratingMin);

    if (!where) {
      return {
        items: [],
        meta: this.buildMeta(0, page, limit)
      };
    }

    const total = await this.prisma.school.count({ where });

    const schools = await this.prisma.school.findMany({
      where,
      include: schoolListInclude,
      orderBy: this.resolveOrderBy(query.sortBy, query.sortOrder),
      skip: (page - 1) * limit,
      take: limit
    });

    const items = await this.mapSchoolListItems(schools);

    return {
      items,
      meta: this.buildMeta(total, page, limit)
    };
  }

  private validateFeeRange(feeMin?: number, feeMax?: number) {
    if (feeMin !== undefined && feeMax !== undefined && feeMin > feeMax) {
      throw new BadRequestException("feeMin cannot be greater than feeMax");
    }
  }

  private buildWhereClause(query: SchoolSearchQuery): Prisma.SchoolWhereInput {
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

    const levels = this.parseLevelsFilter(query.level);
    if (levels.length > 0) {
      andFilters.push({
        levels: {
          some: {
            level: {
              in: levels
            }
          }
        }
      });
    }

    if (query.feeMin !== undefined || query.feeMax !== undefined) {
      andFilters.push({
        monthlyFeeEstimate: {
          gte: query.feeMin,
          lte: query.feeMax
        }
      });
    }

    if (query.profileStatus) {
      andFilters.push({
        profileStatus: query.profileStatus
      });
    }

    if (query.q && query.q.trim().length > 0) {
      const text = query.q.trim();
      andFilters.push({
        OR: [
          { name: { contains: text, mode: "insensitive" } },
          { description: { contains: text, mode: "insensitive" } },
          { city: { name: { contains: text, mode: "insensitive" } } },
          { province: { name: { contains: text, mode: "insensitive" } } }
        ]
      });
    }

    return andFilters.length === 1 ? andFilters[0] : { AND: andFilters };
  }

  private parseLevelsFilter(level?: string): SchoolLevel[] {
    if (!level) {
      return [];
    }

    const parsed = level
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);

    if (parsed.length === 0) {
      return [];
    }

    const validLevels = new Set<string>(Object.values(SchoolLevel));
    const invalid = parsed.filter((item) => !validLevels.has(item));

    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid level values: ${invalid.join(", ")}`);
    }

    return parsed as SchoolLevel[];
  }

  private async applyRatingFilter(
    where: Prisma.SchoolWhereInput,
    ratingMin?: number
  ): Promise<Prisma.SchoolWhereInput | null> {
    if (ratingMin === undefined) {
      return where;
    }

    const candidateSchools = await this.prisma.school.findMany({
      where,
      select: { id: true }
    });

    if (candidateSchools.length === 0) {
      return null;
    }

    const candidateIds = candidateSchools.map((item) => item.id);
    // We aggregate on approved reviews only to keep ranking/filters consistent with public trust signals.
    const aggregates = await this.prisma.review.groupBy({
      by: ["schoolId"],
      where: {
        status: ReviewStatus.APPROVED,
        schoolId: { in: candidateIds }
      },
      _avg: {
        rating: true
      }
    });

    const schoolIds = aggregates
      .filter((aggregate) => (aggregate._avg.rating ?? 0) >= ratingMin)
      .map((aggregate) => aggregate.schoolId);

    if (schoolIds.length === 0) {
      return null;
    }

    // Push rating-derived ids back into school query to keep pagination/count coherent.
    return {
      AND: [where, { id: { in: schoolIds } }]
    };
  }

  private resolveOrderBy(
    sortBy: CatalogSort = "name",
    sortOrder: "asc" | "desc" = "asc"
  ): Prisma.SchoolOrderByWithRelationInput[] {
    if (sortBy === "monthlyFeeEstimate") {
      return [{ monthlyFeeEstimate: sortOrder }, { name: "asc" }];
    }

    if (sortBy === "createdAt") {
      return [{ createdAt: sortOrder }, { name: "asc" }];
    }

    if (sortBy === "leadIntentScore" || sortBy === "relevance") {
      // Fallback ordering proxy for conversion intent when search index is unavailable.
      return [{ profileStatus: "desc" }, { googleReviewCount: "desc" }, { updatedAt: "desc" }, { name: "asc" }];
    }

    return [{ name: sortOrder }];
  }

  private async mapSchoolListItems(schools: SchoolListModel[]) {
    if (schools.length === 0) {
      return [];
    }

    const schoolIds = schools.map((school) => school.id);
    const aggregates = await this.prisma.review.groupBy({
      by: ["schoolId"],
      where: {
        schoolId: { in: schoolIds },
        status: ReviewStatus.APPROVED
      },
      _avg: { rating: true },
      _count: { _all: true }
    });

    const ratings = new Map(
      aggregates.map((aggregate) => [
        aggregate.schoolId,
        {
          average: aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(2)) : null,
          count: aggregate._count._all
        }
      ])
    );

    return schools.map((school) => ({
      id: school.id,
      name: school.name,
      slug: school.slug,
      profile: this.mapProfileState(school.profileStatus, {
        verifiedAt: school.verifiedAt,
        curatedAt: school.curatedAt,
        premiumSince: school.premiumSince,
        premiumUntil: school.premiumUntil
      }),
      levels: school.levels.map((item) => item.level),
      monthlyFeeEstimate: school.monthlyFeeEstimate,
      studentsCount: school.studentsCount,
      location: {
        city: school.city.name,
        province: school.province.name,
        country: school.country.name,
        countryCode: school.country.isoCode,
        coordinates: {
          latitude: school.latitude,
          longitude: school.longitude
        }
      },
      rating: ratings.get(school.id) ?? { average: null, count: 0 },
      quality: {
        google: {
          rating: school.googleRating,
          reviewCount: school.googleReviewCount
        }
      },
      eduAdvisorScore: school.scores[0]?.score ?? null,
      media: this.mapSchoolMedia(school.photos),
      contacts: {
        website: school.website,
        phone: school.phone,
        email: school.email
      }
    }));
  }

  private mapProfileState(
    status: SchoolProfileStatus,
    dates?: {
      verifiedAt?: Date | null;
      curatedAt?: Date | null;
      premiumSince?: Date | null;
      premiumUntil?: Date | null;
    }
  ) {
    const map: Record<SchoolProfileStatus, { label: string; badge: string; tone: "neutral" | "info" | "success" | "warning" }> =
      {
        BASIC: {
          label: "Profile not verified",
          badge: "basic",
          tone: "neutral"
        },
        CURATED: {
          label: "Updated by EduAdvisor",
          badge: "curated",
          tone: "info"
        },
        VERIFIED: {
          label: "Verified school",
          badge: "verified",
          tone: "success"
        },
        PREMIUM: {
          label: "Featured school",
          badge: "premium",
          tone: "warning"
        }
      };

    return {
      status,
      ...map[status],
      verifiedAt: dates?.verifiedAt ?? null,
      curatedAt: dates?.curatedAt ?? null,
      premiumSince: dates?.premiumSince ?? null,
      premiumUntil: dates?.premiumUntil ?? null
    };
  }

  private mapSchoolMedia(
    photos: Array<{
      url: string;
      isPrimary: boolean;
      sortOrder: number;
    }>
  ) {
    const sorted = [...photos].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) {
        return a.isPrimary ? -1 : 1;
      }

      return a.sortOrder - b.sortOrder;
    });

    const logoUrl = sorted.find((photo) => photo.isPrimary)?.url ?? null;
    const galleryUrls = sorted.filter((photo) => !photo.isPrimary).map((photo) => photo.url);

    return {
      logoUrl,
      galleryUrls
    };
  }

  private mapSubscriptionSummary(subscription: {
    id: string;
    status: SubscriptionStatus;
    planCode: string;
    priceMonthly: number | null;
    currency: string;
    startsAt: Date;
    endsAt: Date | null;
    trialEndsAt: Date | null;
  } | null) {
    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      status: subscription.status,
      planCode: subscription.planCode,
      priceMonthly: subscription.priceMonthly,
      currency: subscription.currency,
      startsAt: subscription.startsAt,
      endsAt: subscription.endsAt,
      trialEndsAt: subscription.trialEndsAt
    };
  }

  private resolveSchoolEntitlements(
    profileStatus: SchoolProfileStatus,
    subscription: {
      status: SubscriptionStatus;
      endsAt: Date | null;
    } | null
  ) {
    const canManage = profileStatus === SchoolProfileStatus.VERIFIED || profileStatus === SchoolProfileStatus.PREMIUM;
    const premiumActive = this.isPremiumSubscriptionActive(profileStatus, subscription);

    return {
      canManageLeads: canManage,
      canRespondReviews: canManage,
      canUsePremiumLeadExport: premiumActive,
      canAccessPriorityPlacement: premiumActive
    };
  }

  private isPremiumSubscriptionActive(
    profileStatus: SchoolProfileStatus,
    subscription: {
      status: SubscriptionStatus;
      endsAt: Date | null;
    } | null
  ) {
    if (profileStatus !== SchoolProfileStatus.PREMIUM || !subscription) {
      return false;
    }

    if (!(subscription.status === SubscriptionStatus.ACTIVE || subscription.status === SubscriptionStatus.TRIAL)) {
      return false;
    }

    if (!subscription.endsAt) {
      return true;
    }

    return subscription.endsAt.getTime() >= Date.now();
  }

  private estimateProfileCompleteness(input: {
    name?: string | null;
    description?: string | null;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    monthlyFeeEstimate?: number | null;
    studentsCount?: number | null;
  }) {
    const fields = [
      input.name,
      input.description,
      input.website,
      input.phone,
      input.email,
      input.monthlyFeeEstimate,
      input.studentsCount
    ];

    const completed = fields.filter((value) => value !== null && value !== undefined && value !== "").length;
    return Number(((completed / fields.length) * 100).toFixed(0));
  }

  private async ensureGeoContext(input: { countryCode: string; provinceName: string; cityName: string }) {
    const countryCode = input.countryCode.toUpperCase();
    const normalizedProvinceSlug = this.slugify(input.provinceName);
    const normalizedCitySlug = this.slugify(input.cityName);

    const country = await this.prisma.country.upsert({
      where: { isoCode: countryCode },
      update: {
        name: countryCode === "AR" ? "Argentina" : countryCode
      },
      create: {
        name: countryCode === "AR" ? "Argentina" : countryCode,
        isoCode: countryCode
      }
    });

    const province = await this.prisma.province.upsert({
      where: {
        countryId_slug: {
          countryId: country.id,
          slug: normalizedProvinceSlug
        }
      },
      update: {
        name: input.provinceName.trim()
      },
      create: {
        countryId: country.id,
        name: input.provinceName.trim(),
        slug: normalizedProvinceSlug
      }
    });

    const city = await this.prisma.city.upsert({
      where: {
        provinceId_slug: {
          provinceId: province.id,
          slug: normalizedCitySlug
        }
      },
      update: {
        name: input.cityName.trim()
      },
      create: {
        provinceId: province.id,
        name: input.cityName.trim(),
        slug: normalizedCitySlug
      }
    });

    return {
      countryId: country.id,
      provinceId: province.id,
      cityId: city.id
    };
  }

  private async upsertImportedSchool(input: {
    runId: string;
    source: ImportSource;
    payload: ImportFixtureRow;
    payloadHash: string;
    countryId: string;
    provinceId: string;
    cityId: string;
  }): Promise<{ operation: "CREATED" | "UPDATED" | "DUPLICATE"; schoolId: string }> {
    const byPlaceId = await this.prisma.school.findUnique({
      where: {
        googlePlaceId: input.payload.externalId
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true
      }
    });

    const normalizedName = input.payload.name.trim();
    const normalizedSlugBase = this.slugify(`${normalizedName}-${input.payload.city}`);
    const existingByFuzzy =
      byPlaceId ??
      (await this.findFuzzyDuplicate({
        cityId: input.cityId,
        name: normalizedName,
        latitude: input.payload.latitude,
        longitude: input.payload.longitude
      }));

    if (!existingByFuzzy) {
      const slug = await this.resolveUniqueSchoolSlug(normalizedSlugBase);
      const created = await this.prisma.school.create({
        data: {
          cityId: input.cityId,
          provinceId: input.provinceId,
          countryId: input.countryId,
          name: normalizedName,
          slug,
          profileStatus: SchoolProfileStatus.BASIC,
          latitude: input.payload.latitude,
          longitude: input.payload.longitude,
          addressLine: input.payload.address,
          phone: this.normalizeNullableString(input.payload.phone) ?? null,
          website: this.normalizeNullableString(input.payload.website) ?? null,
          googlePlaceId: input.payload.externalId,
          googleRating: input.payload.googleRating,
          googleReviewCount: input.payload.googleReviewCount,
          googlePhotos: input.payload.photoUrls,
          description: this.normalizeNullableString(input.payload.description) ?? null,
          profileCompleteness: this.estimateProfileCompleteness({
            name: normalizedName,
            description: input.payload.description,
            website: input.payload.website,
            phone: input.payload.phone
          }),
          dataFreshnessAt: new Date()
        }
      });

      await this.prisma.schoolImportItem.create({
        data: {
          runId: input.runId,
          source: input.source,
          externalId: input.payload.externalId,
          schoolId: created.id,
          operation: "CREATED",
          payloadHash: input.payloadHash,
          rawPayload: this.asJsonInput(input.payload)
        }
      });

      await this.prisma.schoolSourceRecord.upsert({
        where: {
          source_externalId: {
            source: input.source,
            externalId: input.payload.externalId
          }
        },
        update: {
          schoolId: created.id,
          payload: this.asJsonInput(input.payload),
          payloadHash: input.payloadHash,
          fetchedAt: new Date()
        },
        create: {
          schoolId: created.id,
          source: input.source,
          externalId: input.payload.externalId,
          payload: this.asJsonInput(input.payload),
          payloadHash: input.payloadHash
        }
      });

      return {
        operation: "CREATED",
        schoolId: created.id
      };
    }

    const sourceRecord = await this.prisma.schoolSourceRecord.findUnique({
      where: {
        source_externalId: {
          source: input.source,
          externalId: input.payload.externalId
        }
      },
      select: {
        payloadHash: true
      }
    });

    if (sourceRecord?.payloadHash === input.payloadHash) {
      await this.prisma.schoolImportItem.create({
        data: {
          runId: input.runId,
          source: input.source,
          externalId: input.payload.externalId,
          schoolId: existingByFuzzy.id,
          operation: "DUPLICATE",
          payloadHash: input.payloadHash,
          rawPayload: this.asJsonInput(input.payload)
        }
      });

      await this.prisma.schoolSourceRecord.update({
        where: {
          source_externalId: {
            source: input.source,
            externalId: input.payload.externalId
          }
        },
        data: {
          fetchedAt: new Date()
        }
      });

      return {
        operation: "DUPLICATE",
        schoolId: existingByFuzzy.id
      };
    }

    const updated = await this.prisma.school.update({
      where: { id: existingByFuzzy.id },
      data: {
        cityId: input.cityId,
        provinceId: input.provinceId,
        countryId: input.countryId,
        name: normalizedName,
        latitude: input.payload.latitude,
        longitude: input.payload.longitude,
        addressLine: input.payload.address,
        phone: this.normalizeNullableString(input.payload.phone) ?? null,
        website: this.normalizeNullableString(input.payload.website) ?? null,
        googlePlaceId: input.payload.externalId,
        googleRating: input.payload.googleRating,
        googleReviewCount: input.payload.googleReviewCount,
        googlePhotos: input.payload.photoUrls,
        description: this.normalizeNullableString(input.payload.description) ?? null,
        dataFreshnessAt: new Date()
      }
    });

    await this.prisma.schoolImportItem.create({
      data: {
        runId: input.runId,
        source: input.source,
        externalId: input.payload.externalId,
        schoolId: updated.id,
        operation: "UPDATED",
        payloadHash: input.payloadHash,
        rawPayload: this.asJsonInput(input.payload)
      }
    });

    await this.prisma.schoolSourceRecord.upsert({
      where: {
        source_externalId: {
          source: input.source,
          externalId: input.payload.externalId
        }
      },
        update: {
          schoolId: updated.id,
          payload: this.asJsonInput(input.payload),
          payloadHash: input.payloadHash,
          fetchedAt: new Date()
        },
        create: {
          schoolId: updated.id,
          source: input.source,
          externalId: input.payload.externalId,
          payload: this.asJsonInput(input.payload),
          payloadHash: input.payloadHash
        }
      });

    return {
      operation: "UPDATED",
      schoolId: updated.id
    };
  }

  private async findFuzzyDuplicate(input: {
    cityId: string;
    name: string;
    latitude: number;
    longitude: number;
  }) {
    const candidates = await this.prisma.school.findMany({
      where: {
        cityId: input.cityId,
        active: true
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true
      },
      take: 200
    });

    const normalizedTarget = this.slugify(input.name);
    for (const candidate of candidates) {
      const normalizedCandidate = this.slugify(candidate.name);
      const similarity =
        normalizedCandidate === normalizedTarget ||
        normalizedCandidate.includes(normalizedTarget) ||
        normalizedTarget.includes(normalizedCandidate);
      const distanceKm = this.distanceInKm(
        input.latitude,
        input.longitude,
        candidate.latitude,
        candidate.longitude
      );

      if (similarity && distanceKm <= 1.2) {
        return candidate;
      }
    }

    return null;
  }

  private distanceInKm(latA: number, lngA: number, latB: number, lngB: number) {
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const dLat = toRadians(latB - latA);
    const dLng = toRadians(lngB - lngA);
    const rLatA = toRadians(latA);
    const rLatB = toRadians(latB);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rLatA) * Math.cos(rLatB) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c;
  }

  private async resolveUniqueSchoolSlug(baseSlug: string) {
    const slugBase = baseSlug || "school";
    const existing = await this.prisma.school.findMany({
      where: {
        slug: {
          startsWith: slugBase
        }
      },
      select: { slug: true }
    });
    const slugs = new Set(existing.map((item) => item.slug));

    if (!slugs.has(slugBase)) {
      return slugBase;
    }

    let counter = 2;
    while (slugs.has(`${slugBase}-${counter}`)) {
      counter += 1;
    }

    return `${slugBase}-${counter}`;
  }

  private hashPayload(input: unknown) {
    const raw = JSON.stringify(input);
    let hash = 5381;
    for (let index = 0; index < raw.length; index += 1) {
      hash = (hash * 33) ^ raw.charCodeAt(index);
    }
    return `h${(hash >>> 0).toString(16)}`;
  }

  private async buildGoogleImportRows(payload: RunImportDto, countryCode: string): Promise<ImportFixtureRow[]> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
    if (!apiKey) {
      throw new BadRequestException("GOOGLE_PLACES_API_KEY is not configured");
    }

    const city = payload.city?.trim();
    const province = payload.province?.trim();

    if (!city || !province) {
      throw new BadRequestException("city and province are required for Google Places import");
    }

    const query = payload.query?.trim() || `colegios privados en ${city}, ${province}, Argentina`;
    const maxPages = payload.maxPages ?? 3;
    const region = countryCode.toLowerCase();

    const rows: ImportFixtureRow[] = [];
    const seenPlaceIds = new Set<string>();

    let nextPageToken: string | undefined;
    for (let page = 0; page < maxPages; page += 1) {
      const result = await this.fetchGoogleTextSearch({
        apiKey,
        query,
        region,
        pageToken: nextPageToken
      });

      if (result.error?.status || result.error?.message) {
        throw new BadRequestException(
          `Google Places search failed: ${result.error.status ?? "ERROR"} (${result.error.message ?? "unknown"})`
        );
      }

      for (const item of result.places ?? []) {
        const placeId = this.extractPlaceId(item.id, item.name);
        const placeName = item.displayName?.text?.trim();
        const latitude = item.location?.latitude;
        const longitude = item.location?.longitude;

        if (!placeId || !placeName || latitude === undefined || longitude === undefined) {
          continue;
        }

        if (seenPlaceIds.has(placeId)) {
          continue;
        }
        seenPlaceIds.add(placeId);

        rows.push({
          externalId: placeId,
          name: placeName,
          city,
          province,
          address: this.normalizeNullableString(item.formattedAddress) ?? null,
          latitude,
          longitude,
          phone:
            this.normalizeNullableString(item.internationalPhoneNumber) ??
            this.normalizeNullableString(item.nationalPhoneNumber) ??
            null,
          website: this.normalizeNullableString(item.websiteUri) ?? null,
          googleRating: item.rating ?? null,
          googleReviewCount: item.userRatingCount ?? null,
          photoUrls: [],
          description: this.normalizeNullableString(item.editorialSummary?.text) ?? null
        });
      }

      nextPageToken = result.nextPageToken?.trim() || undefined;
      if (!nextPageToken) {
        break;
      }

      await this.sleep(2100);
    }

    if ((payload.fetchDetails ?? true) && rows.length > 0) {
      const detailsLimit = Math.min(rows.length, 60);

      for (let index = 0; index < detailsLimit; index += 1) {
        const details = await this.fetchGooglePlaceDetails(apiKey, rows[index].externalId);
        if (!details) {
          continue;
        }

        rows[index] = {
          ...rows[index],
          phone:
            this.normalizeNullableString(details.internationalPhoneNumber) ??
            this.normalizeNullableString(details.nationalPhoneNumber) ??
            rows[index].phone,
          website: this.normalizeNullableString(details.websiteUri) ?? rows[index].website,
          description: this.normalizeNullableString(details.editorialSummary?.text) ?? rows[index].description
        };

        await this.sleep(90);
      }

      // If Google editorial summary is missing, try to enrich from the school's own website metadata.
      const websiteSummaryLimit = Math.min(rows.length, 25);
      for (let index = 0; index < websiteSummaryLimit; index += 1) {
        const row = rows[index];
        if (row.description || !row.website) {
          continue;
        }

        const websiteSummary = await this.fetchWebsiteMetaDescription(row.website);
        if (!websiteSummary) {
          continue;
        }

        rows[index] = {
          ...row,
          description: websiteSummary
        };

        await this.sleep(120);
      }
    }

    if (rows.length === 0) {
      throw new BadRequestException("Google Places returned no schools for the requested location/query");
    }

    return rows;
  }

  private async fetchGoogleTextSearch(params: {
    apiKey: string;
    query: string;
    region: string;
    pageToken?: string;
  }) {
    const url = "https://places.googleapis.com/v1/places:searchText";
    const response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": params.apiKey,
        "x-goog-fieldmask":
          "places.id,places.name,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.editorialSummary,nextPageToken"
      },
      body: JSON.stringify({
        textQuery: params.query,
        languageCode: "es",
        regionCode: params.region.toUpperCase(),
        pageSize: 20,
        pageToken: params.pageToken
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new BadRequestException(`Google Places search HTTP ${response.status}${errorText ? ` (${errorText})` : ""}`);
    }

    const payload = (await response.json()) as GoogleSearchTextResponse;
    if (payload.error?.status === "INVALID_ARGUMENT" && params.pageToken) {
      await this.sleep(2100);

      const retry = await fetch(url, {
        method: "POST",
        cache: "no-store",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": params.apiKey,
          "x-goog-fieldmask":
            "places.id,places.name,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.editorialSummary,nextPageToken"
        },
        body: JSON.stringify({
          textQuery: params.query,
          languageCode: "es",
          regionCode: params.region.toUpperCase(),
          pageSize: 20,
          pageToken: params.pageToken
        })
      });
      if (!retry.ok) {
        const errorText = await retry.text().catch(() => "");
        throw new BadRequestException(
          `Google Places search retry HTTP ${retry.status}${errorText ? ` (${errorText})` : ""}`
        );
      }

      return (await retry.json()) as GoogleSearchTextResponse;
    }

    return payload;
  }

  private async fetchGooglePlaceDetails(apiKey: string, placeId: string): Promise<GooglePlaceDetailsResponse | null> {
    const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=es`;
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "x-goog-api-key": apiKey,
        "x-goog-fieldmask":
          "websiteUri,nationalPhoneNumber,internationalPhoneNumber,editorialSummary"
      }
    });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as GooglePlaceDetailsResponse;
    if (payload.error?.status || payload.error?.message) {
      return null;
    }

    return payload;
  }

  private async fetchWebsiteMetaDescription(url: string): Promise<string | null> {
    const normalizedUrl = url.trim();
    if (!normalizedUrl) {
      return null;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const response = await fetch(normalizedUrl, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; EduAdvisorBot/1.0; +https://eduadvisor.com)",
          accept: "text/html,application/xhtml+xml"
        }
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      const content = this.extractHtmlMetaContent(html);
      if (!content) {
        return null;
      }

      return content.length > 320 ? `${content.slice(0, 317)}...` : content;
    } catch {
      return null;
    }
  }

  private extractHtmlMetaContent(html: string): string | null {
    const normalized = html.replace(/\s+/g, " ").trim();
    if (!normalized) {
      return null;
    }

    const patterns = [
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      /<title[^>]*>([^<]+)<\/title>/i
    ];

    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      const candidate = match?.[1]?.replace(/\s+/g, " ").trim();
      if (candidate) {
        return candidate;
      }
    }

    return null;
  }

  private sleep(ms: number) {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private extractPlaceId(id?: string, resourceName?: string) {
    const normalizedId = id?.trim();
    if (normalizedId) {
      return normalizedId;
    }

    const normalizedResource = resourceName?.trim();
    if (!normalizedResource) {
      return null;
    }

    if (normalizedResource.startsWith("places/")) {
      return normalizedResource.slice("places/".length);
    }

    return normalizedResource;
  }

  private buildImportFixtureRows(payload: RunImportDto): ImportFixtureRow[] {
    const province = payload.province?.trim() || "Buenos Aires";
    const city = payload.city?.trim() || "Longchamps";
    const citySlug = this.slugify(city);
    const provinceSlug = this.slugify(province);
    const baseLat = citySlug === "longchamps" ? -34.857 : citySlug === "cordoba" ? -31.4173 : -32.8895;
    const baseLng = citySlug === "longchamps" ? -58.393 : citySlug === "cordoba" ? -64.1833 : -68.8458;

    return Array.from({ length: 32 }).map((_, index) => {
      const levelTag = index % 4 === 0 ? "Bilingüe" : index % 4 === 1 ? "Técnico" : index % 4 === 2 ? "Artístico" : "Integral";

      return {
        externalId: `g-${provinceSlug}-${citySlug}-${String(index + 1).padStart(3, "0")}`,
        name: `Colegio ${levelTag} ${city} ${index + 1}`,
        city,
        province,
        address: `Calle ${index + 120}, ${city}`,
        latitude: Number((baseLat + (index % 8) * 0.0032).toFixed(6)),
        longitude: Number((baseLng + Math.floor(index / 8) * 0.0031).toFixed(6)),
        phone: `+54 11 52${String(index + 10).padStart(2, "0")}-11${String(index + 30).padStart(2, "0")}`,
        website: `https://colegio-${citySlug}-${index + 1}.example.eduadvisor.ar`,
        googleRating: Number((3.6 + (index % 10) * 0.14).toFixed(1)),
        googleReviewCount: 12 + index * 3,
        photoUrls: [`https://images.eduadvisor.ar/${citySlug}/${index + 1}.jpg`],
        description: `${levelTag} con foco en innovación educativa y comunidad escolar activa.`
      };
    });
  }

  private slugify(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
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

  private normalizeNullableString(value?: string | null) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private computeProfileChangedFields(input: {
    existing: {
      name: string;
      description: string | null;
      website: string | null;
      phone: string | null;
      email: string | null;
      monthlyFeeEstimate: number | null;
      studentsCount: number | null;
      logoUrl?: string | null;
      galleryUrls?: string[];
    };
    next: {
      name?: string;
      description?: string | null;
      website?: string | null;
      phone?: string | null;
      email?: string | null;
      monthlyFeeEstimate?: number | null;
      studentsCount?: number | null;
      levels?: SchoolLevel[];
      logoUrl?: string | null;
      galleryUrls?: string[];
    };
  }) {
    const changed = new Set<string>();

    if (input.next.name !== undefined && input.next.name.trim() !== input.existing.name) {
      changed.add("name");
    }

    if (input.next.description !== undefined && this.hasMeaningfulDifference(input.existing.description, input.next.description)) {
      changed.add("description");
    }

    if (input.next.website !== undefined && this.hasMeaningfulDifference(input.existing.website, input.next.website)) {
      changed.add("website");
    }

    if (input.next.phone !== undefined && this.hasMeaningfulDifference(input.existing.phone, input.next.phone)) {
      changed.add("phone");
    }

    if (input.next.email !== undefined && this.hasMeaningfulDifference(input.existing.email, input.next.email)) {
      changed.add("email");
    }

    if (
      input.next.monthlyFeeEstimate !== undefined &&
      this.hasMeaningfulDifference(input.existing.monthlyFeeEstimate, input.next.monthlyFeeEstimate)
    ) {
      changed.add("monthlyFeeEstimate");
    }

    if (input.next.studentsCount !== undefined && this.hasMeaningfulDifference(input.existing.studentsCount, input.next.studentsCount)) {
      changed.add("studentsCount");
    }

    if (input.next.levels !== undefined) {
      changed.add("levels");
    }

    if (input.next.logoUrl !== undefined && this.hasMeaningfulDifference(input.existing.logoUrl ?? null, input.next.logoUrl)) {
      changed.add("logo");
    }

    if (input.next.galleryUrls !== undefined) {
      const current = JSON.stringify(input.existing.galleryUrls ?? []);
      const next = JSON.stringify(input.next.galleryUrls);
      if (current !== next) {
        changed.add("gallery");
      }
    }

    return Array.from(changed);
  }

  private hasMeaningfulDifference(current: unknown, next: unknown) {
    return current !== next;
  }

  private escapeCsvCell(value: string) {
    const normalized = value.replace(/\r?\n|\r/g, " ").trim();
    const escaped = normalized.replace(/"/g, "\"\"");
    return `"${escaped}"`;
  }

  private getMonthsAgoDate(monthsAgo: number) {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    return date;
  }

  private getHoursAgoDate(hoursAgo: number) {
    const date = new Date();
    date.setHours(date.getHours() - hoursAgo);
    return date;
  }

  private computeAverageReviewResponseHours(
    reviewResponseTimes: Array<{
      createdAt: Date;
      schoolResponseAt: Date | null;
    }>
  ) {
    const diffsInHours = reviewResponseTimes
      .map((item) => {
        if (!item.schoolResponseAt) {
          return null;
        }

        const diffMs = item.schoolResponseAt.getTime() - item.createdAt.getTime();
        return diffMs >= 0 ? diffMs / 3_600_000 : 0;
      })
      .filter((value): value is number => value !== null);

    if (diffsInHours.length === 0) {
      return null;
    }

    const average = diffsInHours.reduce((sum, value) => sum + value, 0) / diffsInHours.length;
    return Number(average.toFixed(1));
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

  private buildSeoScopeWhere(query: SeoScopeQuery): Prisma.SchoolWhereInput {
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

    return andFilters.length === 1 ? andFilters[0] : { AND: andFilters };
  }

  private getErrorMessage(error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }

  private asJsonInput(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
