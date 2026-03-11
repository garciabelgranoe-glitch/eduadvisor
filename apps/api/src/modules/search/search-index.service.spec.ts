import { SchoolProfileStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { SearchIndexService } from "./search-index.service";

describe("SearchIndexService", () => {
  let service: SearchIndexService;

  beforeEach(() => {
    service = new SearchIndexService({} as PrismaService);
  });

  it("prioritizes lead intent sorting for empty relevance queries", () => {
    const sort = (service as any).buildSort({
      sortBy: "relevance",
      q: ""
    });

    expect(sort).toEqual(["leadIntentScore:desc", "rankingBoost:desc", "eduAdvisorScore:desc", "ratingAverage:desc"]);
  });

  it("computes higher lead intent score for richer school profiles", () => {
    const lowScore = (service as any).calculateLeadIntentScore({
      profileStatus: SchoolProfileStatus.BASIC,
      phone: null,
      website: null,
      email: null,
      description: null,
      monthlyFeeEstimate: null,
      levelsCount: 1,
      googleRating: null,
      googleReviewCount: null,
      eduAdvisorScore: 0
    });

    const highScore = (service as any).calculateLeadIntentScore({
      profileStatus: SchoolProfileStatus.PREMIUM,
      phone: "+54 11 0000-0000",
      website: "https://colegio.example",
      email: "admisiones@colegio.example",
      description: "Proyecto educativo integral",
      monthlyFeeEstimate: 250000,
      levelsCount: 3,
      googleRating: 4.6,
      googleReviewCount: 180,
      eduAdvisorScore: 88
    });

    expect(lowScore).toBeLessThan(highScore);
    expect(highScore).toBeLessThanOrEqual(100);
  });
});
