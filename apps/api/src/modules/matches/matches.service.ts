import { BadRequestException, Injectable } from "@nestjs/common";
import { EducationType, Prisma, ReviewStatus, SchoolLevel, UserRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { MatchRecommendationDto } from "./dto/match-recommendation.dto";

const SYSTEM_PARENT_EMAIL = "matcher@eduadvisor.local";

type CandidateSchool = Prisma.SchoolGetPayload<{
  include: {
    city: {
      select: {
        name: true;
        slug: true;
      };
    };
    province: {
      select: {
        name: true;
        slug: true;
      };
    };
    country: {
      select: {
        name: true;
        isoCode: true;
      };
    };
    levels: {
      select: {
        level: true;
      };
    };
    scores: {
      select: {
        score: true;
      };
      orderBy: {
        calculatedAt: "desc";
      };
      take: 1;
    };
  };
}>;

interface NormalizedCriteria {
  country?: string;
  province?: string;
  city?: string;
  childAge: number;
  educationLevel: SchoolLevel;
  budgetMin?: number;
  budgetMax?: number;
  maxDistanceKm: number;
  preferredTypes: EducationType[];
  priorities: string[];
  queryText?: string;
  inferredTypes: EducationType[];
  inferredPriorities: string[];
  limit: number;
}

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async recommend(input: MatchRecommendationDto) {
    const criteria = this.normalizeCriteria(input);
    const referenceCity = await this.resolveReferenceCity(criteria);
    const candidates = await this.findCandidateSchools(criteria);
    const ratings = await this.getRatings(candidates.map((school) => school.id));

    const scored = candidates
      .map((school) => this.scoreSchool(school, ratings.get(school.id), criteria, referenceCity))
      .sort((a, b) => b.score - a.score);

    const topMatches = scored.slice(0, criteria.limit);
    const user = await this.getOrCreateSystemParent();

    const session = await this.prisma.matchSession.create({
      data: {
        userId: user.id,
        queryText: criteria.queryText ?? null
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    await this.prisma.parentPreference.create({
      data: {
        userId: user.id,
        cityId: referenceCity?.id,
        budgetMin: criteria.budgetMin,
        budgetMax: criteria.budgetMax,
        childAge: criteria.childAge,
        educationLevel: criteria.educationLevel,
        maxDistanceKm: Math.round(criteria.maxDistanceKm),
        preferredTypes: Array.from(new Set([...criteria.preferredTypes, ...criteria.inferredTypes])),
        priorities: {
          priorities: criteria.priorities,
          inferredPriorities: criteria.inferredPriorities,
          queryText: criteria.queryText ?? null
        }
      }
    });

    if (topMatches.length > 0) {
      await this.prisma.matchResult.createMany({
        data: topMatches.map((match) => ({
          sessionId: session.id,
          schoolId: match.school.id,
          score: match.score,
          distanceKm: match.distanceKm,
          scoreBreakdown: match.breakdown
        }))
      });
    }

    return {
      session: {
        id: session.id,
        createdAt: session.createdAt
      },
      criteria: {
        ...criteria,
        location: {
          country: criteria.country ?? null,
          province: criteria.province ?? null,
          city: criteria.city ?? null
        },
        inferredTypes: criteria.inferredTypes,
        inferredPriorities: criteria.inferredPriorities
      },
      meta: {
        totalConsidered: candidates.length,
        totalMatched: topMatches.length
      },
      items: topMatches.map((match, index) => ({
        rank: index + 1,
        score: match.score,
        distanceKm: match.distanceKm,
        highlights: match.highlights,
        breakdown: match.breakdown,
        school: {
          id: match.school.id,
          name: match.school.name,
          slug: match.school.slug,
          description: match.school.description,
          monthlyFeeEstimate: match.school.monthlyFeeEstimate,
          studentsCount: match.school.studentsCount,
          levels: match.school.levels.map((item) => item.level),
          location: {
            city: match.school.city.name,
            province: match.school.province.name,
            country: match.school.country.name,
            countryCode: match.school.country.isoCode,
            coordinates: {
              latitude: match.school.latitude,
              longitude: match.school.longitude
            }
          },
          contacts: {
            website: match.school.website,
            phone: match.school.phone,
            email: match.school.email
          },
          rating: match.rating,
          eduAdvisorScore: match.school.scores[0]?.score ?? null
        }
      }))
    };
  }

  private normalizeCriteria(input: MatchRecommendationDto): NormalizedCriteria {
    const budgetMin = input.budgetMin;
    const budgetMax = input.budgetMax;

    if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
      throw new BadRequestException("budgetMin cannot be greater than budgetMax");
    }

    const queryText = input.queryText?.trim();
    const inferred = this.inferFromQueryText(queryText);
    const preferredTypes = Array.from(new Set(input.preferredTypes ?? []));
    const priorities = Array.from(new Set((input.priorities ?? []).map((item) => item.trim()).filter(Boolean)));

    return {
      country: input.country?.trim(),
      province: input.province?.trim(),
      city: input.city?.trim(),
      childAge: input.childAge ?? 8,
      educationLevel: input.educationLevel ?? SchoolLevel.PRIMARIA,
      budgetMin,
      budgetMax,
      maxDistanceKm: input.maxDistanceKm ?? 12,
      preferredTypes,
      priorities,
      queryText,
      inferredTypes: inferred.types,
      inferredPriorities: inferred.priorities,
      limit: input.limit ?? 8
    };
  }

  private inferFromQueryText(text?: string): { types: EducationType[]; priorities: string[] } {
    if (!text) {
      return { types: [], priorities: [] };
    }

    const normalized = text.toLowerCase();
    const inferredTypes = new Set<EducationType>();
    const inferredPriorities = new Set<string>();

    const add = (condition: boolean, type: EducationType, priority: string) => {
      if (!condition) {
        return;
      }

      inferredTypes.add(type);
      inferredPriorities.add(priority);
    };

    add(/ingles|biling/.test(normalized), EducationType.BILINGUAL, "Ingles fuerte");
    add(/internacional|bachillerato internacional|ib/.test(normalized), EducationType.INTERNATIONAL, "Proyeccion internacional");
    add(/montessori/.test(normalized), EducationType.MONTESSORI, "Metodologia Montessori");
    add(/relig|catol|cristian/.test(normalized), EducationType.RELIGIOUS, "Formacion en valores");
    add(/tecnic|stem|robot|program/.test(normalized), EducationType.TECHNICAL, "Foco STEM");
    add(/arte|artist|musica|teatro/.test(normalized), EducationType.ARTISTIC, "Programa artistico");
    add(/deport|futbol|hockey|rugby/.test(normalized), EducationType.SPORTS, "Programa deportivo");
    add(/tradicional/.test(normalized), EducationType.TRADITIONAL, "Proyecto tradicional");

    if (/jornada completa|doble jornada/.test(normalized)) {
      inferredPriorities.add("Jornada completa");
    }

    if (/cerca|distancia|traslado/.test(normalized)) {
      inferredPriorities.add("Distancia corta");
    }

    return {
      types: Array.from(inferredTypes),
      priorities: Array.from(inferredPriorities)
    };
  }

  private async resolveReferenceCity(criteria: NormalizedCriteria) {
    if (!criteria.city) {
      return null;
    }

    return this.prisma.city.findFirst({
      where: {
        OR: [
          { name: { contains: criteria.city, mode: "insensitive" } },
          { slug: { contains: criteria.city.toLowerCase() } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        latitude: true,
        longitude: true
      }
    });
  }

  private async findCandidateSchools(criteria: NormalizedCriteria): Promise<CandidateSchool[]> {
    const andFilters: Prisma.SchoolWhereInput[] = [{ active: true }];

    if (criteria.country) {
      andFilters.push({
        country: {
          OR: [
            { name: { contains: criteria.country, mode: "insensitive" } },
            { isoCode: { equals: criteria.country.toUpperCase() } }
          ]
        }
      });
    }

    if (criteria.province) {
      andFilters.push({
        province: {
          OR: [
            { name: { contains: criteria.province, mode: "insensitive" } },
            { slug: { contains: criteria.province.toLowerCase() } }
          ]
        }
      });
    }

    if (criteria.city) {
      andFilters.push({
        city: {
          OR: [{ name: { contains: criteria.city, mode: "insensitive" } }, { slug: { contains: criteria.city.toLowerCase() } }]
        }
      });
    }

    const strictWhere: Prisma.SchoolWhereInput = {
      AND: [
        andFilters.length > 1 ? { AND: andFilters } : andFilters[0],
        {
          levels: {
            some: {
              level: criteria.educationLevel
            }
          }
        }
      ]
    };

    const broadWhere = andFilters.length > 1 ? { AND: andFilters } : andFilters[0];

    const include = {
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
          score: true
        },
        orderBy: {
          calculatedAt: "desc" as const
        },
        take: 1
      }
    };

    const strict = await this.prisma.school.findMany({
      where: strictWhere,
      include,
      take: 60
    });

    if (strict.length >= criteria.limit) {
      return strict;
    }

    const fallback = await this.prisma.school.findMany({
      where: broadWhere,
      include,
      take: 80
    });

    const byId = new Map<string, CandidateSchool>();
    for (const school of [...strict, ...fallback]) {
      byId.set(school.id, school);
    }

    return Array.from(byId.values());
  }

  private async getRatings(schoolIds: string[]) {
    if (schoolIds.length === 0) {
      return new Map<string, { average: number | null; count: number }>();
    }

    const aggregates = await this.prisma.review.groupBy({
      by: ["schoolId"],
      where: {
        schoolId: {
          in: schoolIds
        },
        status: ReviewStatus.APPROVED
      },
      _avg: {
        rating: true
      },
      _count: {
        _all: true
      }
    });

    return new Map(
      aggregates.map((item) => [
        item.schoolId,
        {
          average: item._avg.rating ? Number(item._avg.rating.toFixed(2)) : null,
          count: item._count._all
        }
      ])
    );
  }

  private scoreSchool(
    school: CandidateSchool,
    rating: { average: number | null; count: number } | undefined,
    criteria: NormalizedCriteria,
    referenceCity: { latitude: number | null; longitude: number | null } | null
  ) {
    const distanceKm =
      referenceCity && referenceCity.latitude !== null && referenceCity.longitude !== null
        ? this.calculateDistanceKm(referenceCity.latitude, referenceCity.longitude, school.latitude, school.longitude)
        : null;

    const distanceScore = this.distanceScore(distanceKm, criteria.maxDistanceKm);
    const budgetScore = this.budgetScore(school.monthlyFeeEstimate, criteria.budgetMin, criteria.budgetMax);
    const levelScore = school.levels.some((level) => level.level === criteria.educationLevel) ? 1 : 0.2;
    const qualityScore = this.qualityScore(rating, school.scores[0]?.score ?? null);
    const intentScore = this.intentScore(school, criteria);

    const breakdown = {
      distance: Number((distanceScore * 100).toFixed(1)),
      budget: Number((budgetScore * 100).toFixed(1)),
      level: Number((levelScore * 100).toFixed(1)),
      quality: Number((qualityScore * 100).toFixed(1)),
      intent: Number((intentScore * 100).toFixed(1))
    };

    const score = Number(
      (
        distanceScore * 26 +
        budgetScore * 24 +
        levelScore * 20 +
        qualityScore * 18 +
        intentScore * 12
      ).toFixed(1)
    );

    const highlights = this.buildHighlights(school, criteria, distanceKm, rating);

    return {
      school,
      score,
      distanceKm: distanceKm !== null ? Number(distanceKm.toFixed(2)) : null,
      rating: rating ?? {
        average: null,
        count: 0
      },
      highlights,
      breakdown: {
        ...breakdown,
        total: score
      }
    };
  }

  private distanceScore(distanceKm: number | null, maxDistanceKm: number) {
    if (distanceKm === null) {
      return 0.6;
    }

    if (distanceKm <= maxDistanceKm) {
      const ratio = maxDistanceKm === 0 ? 0 : distanceKm / maxDistanceKm;
      return Math.max(0.65, 1 - ratio * 0.35);
    }

    const overflow = distanceKm - maxDistanceKm;
    const ratio = maxDistanceKm === 0 ? 1 : overflow / maxDistanceKm;
    return Math.max(0.05, 0.65 - ratio * 0.45);
  }

  private budgetScore(monthlyFee: number | null, budgetMin?: number, budgetMax?: number) {
    if (monthlyFee === null) {
      return 0.55;
    }

    if (budgetMin === undefined && budgetMax === undefined) {
      return 0.65;
    }

    if (budgetMin !== undefined && monthlyFee < budgetMin) {
      const diff = budgetMin - monthlyFee;
      const ratio = budgetMin === 0 ? 0 : diff / budgetMin;
      return Math.max(0.65, 0.9 - ratio * 0.25);
    }

    if (budgetMax !== undefined && monthlyFee > budgetMax) {
      const diff = monthlyFee - budgetMax;
      const ratio = budgetMax === 0 ? 1 : diff / budgetMax;
      return Math.max(0.05, 1 - ratio);
    }

    return 1;
  }

  private qualityScore(rating: { average: number | null } | undefined, eduAdvisorScore: number | null) {
    const ratingValue = rating?.average !== null && rating?.average !== undefined ? rating.average / 5 : 0.6;
    const eduValue = eduAdvisorScore !== null ? eduAdvisorScore / 100 : 0.6;
    return ratingValue * 0.55 + eduValue * 0.45;
  }

  private intentScore(school: CandidateSchool, criteria: NormalizedCriteria) {
    const text = `${school.name} ${school.description ?? ""}`.toLowerCase();
    const typeKeywords = this.educationTypeKeywords();
    const requestedTypes = new Set([...criteria.preferredTypes, ...criteria.inferredTypes]);
    const requestedPriorityKeywords = [...criteria.priorities, ...criteria.inferredPriorities]
      .flatMap((value) => this.priorityKeywords(value))
      .filter(Boolean);

    if (requestedTypes.size === 0 && requestedPriorityKeywords.length === 0 && !criteria.queryText) {
      return 0.55;
    }

    let score = 0.35;

    for (const type of requestedTypes) {
      const keywords = typeKeywords[type] ?? [];
      if (keywords.some((keyword) => text.includes(keyword))) {
        score += 0.2;
      }
    }

    if (requestedPriorityKeywords.length > 0) {
      const uniqueKeywords = Array.from(new Set(requestedPriorityKeywords));
      const hits = uniqueKeywords.filter((keyword) => text.includes(keyword)).length;
      const ratio = hits / uniqueKeywords.length;
      score += ratio * 0.3;
    }

    if (criteria.queryText) {
      const tokens = criteria.queryText
        .toLowerCase()
        .split(/\s+/)
        .map((item) => item.replace(/[^a-z0-9áéíóúñ]/gi, ""))
        .filter((item) => item.length >= 4);
      const uniqueTokens = Array.from(new Set(tokens));
      if (uniqueTokens.length > 0) {
        const matches = uniqueTokens.filter((token) => text.includes(token)).length;
        score += (matches / uniqueTokens.length) * 0.15;
      }
    }

    return Math.min(1, score);
  }

  private buildHighlights(
    school: CandidateSchool,
    criteria: NormalizedCriteria,
    distanceKm: number | null,
    rating: { average: number | null; count: number } | undefined
  ) {
    const highlights: string[] = [];

    if (distanceKm !== null && distanceKm <= criteria.maxDistanceKm) {
      highlights.push(`Dentro del radio objetivo (${distanceKm.toFixed(1)} km)`);
    }

    if (school.monthlyFeeEstimate !== null && criteria.budgetMax !== undefined && school.monthlyFeeEstimate <= criteria.budgetMax) {
      highlights.push("Cuota alineada al presupuesto");
    }

    if (school.levels.some((level) => level.level === criteria.educationLevel)) {
      highlights.push(`Ofrece nivel ${criteria.educationLevel}`);
    }

    if (rating?.average !== null && rating?.average !== undefined && rating.average >= 4) {
      highlights.push(`Rating destacado (${rating.average.toFixed(1)}/5)`);
    }

    if ((school.scores[0]?.score ?? 0) >= 85) {
      highlights.push("EduAdvisor Score alto");
    }

    return highlights.slice(0, 4);
  }

  private educationTypeKeywords(): Record<EducationType, string[]> {
    return {
      BILINGUAL: ["biling", "ingles", "english"],
      RELIGIOUS: ["relig", "pastoral", "catol", "cristian"],
      MONTESSORI: ["montessori"],
      INTERNATIONAL: ["internacional", "ib", "international"],
      TECHNICAL: ["stem", "robot", "tecn", "program"],
      ARTISTIC: ["arte", "artist", "musica", "teatro"],
      SPORTS: ["deporte", "futbol", "hockey", "rugby"],
      TRADITIONAL: ["tradicional", "clasico"]
    };
  }

  private priorityKeywords(priority: string) {
    const normalized = priority.toLowerCase();

    if (normalized.includes("ingles")) {
      return ["ingles", "english", "biling"];
    }

    if (normalized.includes("jornada")) {
      return ["jornada completa", "doble jornada"];
    }

    if (normalized.includes("distancia") || normalized.includes("cerca")) {
      return ["cerc", "acceso", "ubicacion"];
    }

    if (normalized.includes("stem") || normalized.includes("tecn")) {
      return ["stem", "tecn", "robot", "program"];
    }

    if (normalized.includes("arte")) {
      return ["arte", "artist", "musica", "teatro"];
    }

    if (normalized.includes("deporte")) {
      return ["deport", "futbol", "hockey", "rugby"];
    }

    return [normalized];
  }

  private calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  private async getOrCreateSystemParent() {
    return this.prisma.user.upsert({
      where: {
        email: SYSTEM_PARENT_EMAIL
      },
      update: {
        role: UserRole.PARENT
      },
      create: {
        email: SYSTEM_PARENT_EMAIL,
        role: UserRole.PARENT
      },
      select: {
        id: true
      }
    });
  }
}
