import type {
  AdminClaimRequestsResponse,
  AdminBillingCheckoutSessionResponse,
  AdminBillingInvoicesResponse,
  AdminBillingOverviewResponse,
  AdminBillingWebhookEventsResponse,
  AdminGrowthFunnelResponse,
  AdminOverviewResponse,
  AdminSchoolsResponse,
  ApiSchoolDetail,
  MarketInsightsParams,
  MarketInsightsResponse,
  MatchRecommendationParams,
  MatchRecommendationResponse,
  ParentComparisonsResponse,
  ParentDashboardResponse,
  ParentAlertsResponse,
  ParentSavedSchoolsResponse,
  RankingParams,
  RankingsResponse,
  SeoCitiesResponse,
  SeoCityLandingResponse,
  SeoSitemapResponse,
  SchoolDashboardResponse,
  SchoolLeadSummaryResponse,
  SchoolLeadsResponse,
  SchoolSearchParams,
  SchoolsListResponse,
  SearchResponse
} from "./types";

const API_BASE = process.env.API_URL ?? "http://localhost:4000";
const API_PREFIX = `${API_BASE}/v1`;

const defaultListResponse: SchoolsListResponse = {
  items: [],
  meta: {
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
    hasNextPage: false
  }
};

const defaultSearchResponse: SearchResponse = {
  ...defaultListResponse,
  engine: "postgres_fallback",
  query: null
};

export async function getSchools(params: SchoolSearchParams = {}): Promise<SchoolsListResponse> {
  const query = toQueryString(params);
  try {
    const response = await fetch(`${API_PREFIX}/schools${query}`, {
      next: { revalidate: 120 }
    });

    if (!response.ok) {
      return defaultListResponse;
    }

    return (await response.json()) as SchoolsListResponse;
  } catch {
    return defaultListResponse;
  }
}

export async function searchSchools(params: SchoolSearchParams = {}): Promise<SearchResponse> {
  const query = toQueryString(params);
  try {
    const response = await fetch(`${API_PREFIX}/search${query}`, {
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return defaultSearchResponse;
    }

    return (await response.json()) as SearchResponse;
  } catch {
    return defaultSearchResponse;
  }
}

export async function getSchoolBySlug(slug: string): Promise<ApiSchoolDetail | null> {
  try {
    const response = await fetch(`${API_PREFIX}/schools/${slug}`, {
      next: { revalidate: 120 }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ApiSchoolDetail;
  } catch {
    return null;
  }
}

export async function getSeoCities(params: {
  country?: string;
  province?: string;
  limit?: string;
} = {}): Promise<SeoCitiesResponse> {
  const query = toQueryString(params);

  try {
    const response = await fetch(`${API_PREFIX}/schools/seo/cities${query}`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return {
        items: [],
        meta: {
          total: 0,
          limit: Number(params.limit ?? 0) || 200
        }
      };
    }

    return (await response.json()) as SeoCitiesResponse;
  } catch {
    return {
      items: [],
      meta: {
        total: 0,
        limit: Number(params.limit ?? 0) || 200
      }
    };
  }
}

export async function getSeoCityBySlug(citySlug: string): Promise<SeoCityLandingResponse | null> {
  try {
    const response = await fetch(`${API_PREFIX}/schools/seo/cities/${citySlug}`, {
      next: { revalidate: 600 }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SeoCityLandingResponse;
  } catch {
    return null;
  }
}

export async function getSeoSitemap(params: { limit?: string } = {}): Promise<SeoSitemapResponse | null> {
  const query = toQueryString(params);

  try {
    const response = await fetch(`${API_PREFIX}/schools/seo/sitemap${query}`, {
      next: { revalidate: 900 }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SeoSitemapResponse;
  } catch {
    return null;
  }
}

export async function getMatchRecommendations(
  params: MatchRecommendationParams
): Promise<MatchRecommendationResponse | null> {
  const query = toQueryString(params);

  try {
    const response = await fetch(`${API_PREFIX}/matches${query}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as MatchRecommendationResponse;
  } catch {
    return null;
  }
}

export async function getRankings(params: RankingParams = {}): Promise<RankingsResponse | null> {
  const query = toQueryString(params);

  try {
    const response = await fetch(`${API_PREFIX}/rankings${query}`, {
      next: { revalidate: 600 }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as RankingsResponse;
  } catch {
    return null;
  }
}

export async function getMarketInsights(params: MarketInsightsParams = {}): Promise<MarketInsightsResponse | null> {
  const query = toQueryString(params);

  try {
    const response = await fetch(`${API_PREFIX}/market-insights${query}`, {
      next: { revalidate: 600 }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as MarketInsightsResponse;
  } catch {
    return null;
  }
}

export async function getSchoolLeads(
  schoolId: string,
  params: { status?: string; page?: string; limit?: string; query?: string } = {}
): Promise<SchoolLeadsResponse> {
  const query = toQueryString(params);
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const response = await fetch(`${API_PREFIX}/leads/school/${schoolId}${query}`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return {
        school: {
          id: schoolId,
          name: "School",
          slug: "school"
        },
        items: [],
        meta: defaultListResponse.meta
      };
    }

    return (await response.json()) as SchoolLeadsResponse;
  } catch {
    return {
      school: {
        id: schoolId,
        name: "School",
        slug: "school"
      },
      items: [],
      meta: defaultListResponse.meta
    };
  }
}

export async function getSchoolLeadSummary(schoolId: string): Promise<SchoolLeadSummaryResponse | null> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const response = await fetch(`${API_PREFIX}/leads/school/${schoolId}/summary`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SchoolLeadSummaryResponse;
  } catch {
    return null;
  }
}

export async function getSchoolDashboard(schoolId: string): Promise<SchoolDashboardResponse | null> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const response = await fetch(`${API_PREFIX}/schools/id/${schoolId}/dashboard`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SchoolDashboardResponse;
  } catch {
    return null;
  }
}

export async function getParentDashboard(userId: string): Promise<ParentDashboardResponse | null> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const response = await fetch(`${API_PREFIX}/parents/${encodeURIComponent(userId)}/dashboard`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ParentDashboardResponse;
  } catch {
    return null;
  }
}

export async function getParentSavedSchools(userId: string): Promise<ParentSavedSchoolsResponse | null> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const response = await fetch(`${API_PREFIX}/parents/${encodeURIComponent(userId)}/saved-schools`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ParentSavedSchoolsResponse;
  } catch {
    return null;
  }
}

export async function getParentComparisons(userId: string): Promise<ParentComparisonsResponse | null> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const response = await fetch(`${API_PREFIX}/parents/${encodeURIComponent(userId)}/comparisons`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ParentComparisonsResponse;
  } catch {
    return null;
  }
}

export async function getParentAlerts(userId: string): Promise<ParentAlertsResponse | null> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const response = await fetch(`${API_PREFIX}/parents/${encodeURIComponent(userId)}/alerts`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ParentAlertsResponse;
  } catch {
    return null;
  }
}

export async function getAdminOverview(): Promise<AdminOverviewResponse | null> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const response = await fetch(`${API_PREFIX}/admin/overview`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AdminOverviewResponse;
  } catch {
    return null;
  }
}

export async function getAdminBillingOverview(): Promise<AdminBillingOverviewResponse | null> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const response = await fetch(`${API_PREFIX}/admin/billing/overview`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AdminBillingOverviewResponse;
  } catch {
    return null;
  }
}

export async function getAdminBillingInvoices(params: {
  schoolId?: string;
  provider?: "MANUAL" | "STRIPE" | "MERCADO_PAGO";
  status?: "DRAFT" | "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE";
  page?: string;
  limit?: string;
} = {}): Promise<AdminBillingInvoicesResponse> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  const query = toQueryString(params);

  try {
    const response = await fetch(`${API_PREFIX}/admin/billing/invoices${query}`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return { items: [], meta: defaultListResponse.meta };
    }

    return (await response.json()) as AdminBillingInvoicesResponse;
  } catch {
    return { items: [], meta: defaultListResponse.meta };
  }
}

export async function getAdminBillingWebhookEvents(params: {
  schoolId?: string;
  provider?: "MANUAL" | "STRIPE" | "MERCADO_PAGO";
  status?: "RECEIVED" | "PROCESSED" | "FAILED" | "DUPLICATE" | "IGNORED";
  page?: string;
  limit?: string;
} = {}): Promise<AdminBillingWebhookEventsResponse> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  const query = toQueryString(params);

  try {
    const response = await fetch(`${API_PREFIX}/admin/billing/webhook-events${query}`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return { items: [], meta: defaultListResponse.meta };
    }

    return (await response.json()) as AdminBillingWebhookEventsResponse;
  } catch {
    return { items: [], meta: defaultListResponse.meta };
  }
}

export async function getAdminBillingCheckoutSession(
  sessionId: string
): Promise<AdminBillingCheckoutSessionResponse | null> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const response = await fetch(`${API_PREFIX}/admin/billing/checkout-sessions/${encodeURIComponent(sessionId)}`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AdminBillingCheckoutSessionResponse;
  } catch {
    return null;
  }
}

export async function getAdminSchools(params: {
  q?: string;
  status?: "all" | "active" | "inactive";
  page?: string;
  limit?: string;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
} = {}): Promise<AdminSchoolsResponse> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  const query = toQueryString(params);

  try {
    const response = await fetch(`${API_PREFIX}/admin/schools${query}`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return { items: [], meta: defaultListResponse.meta };
    }

    return (await response.json()) as AdminSchoolsResponse;
  } catch {
    return { items: [], meta: defaultListResponse.meta };
  }
}

export async function getAdminClaimRequests(params: {
  q?: string;
  status?: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  requestType?: "CLAIM" | "PUBLISH";
  page?: string;
  limit?: string;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
} = {}): Promise<AdminClaimRequestsResponse> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  const query = toQueryString(params);

  try {
    const response = await fetch(`${API_PREFIX}/admin/claim-requests${query}`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return { items: [], meta: defaultListResponse.meta };
    }

    return (await response.json()) as AdminClaimRequestsResponse;
  } catch {
    return { items: [], meta: defaultListResponse.meta };
  }
}

export async function getAdminGrowthFunnel(params: {
  windowDays?: string;
  trendDays?: string;
} = {}): Promise<AdminGrowthFunnelResponse | null> {
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";
  const query = toQueryString(params);

  try {
    const response = await fetch(`${API_PREFIX}/admin/growth-funnel${query}`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AdminGrowthFunnelResponse;
  } catch {
    return null;
  }
}

function toQueryString(params: object) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    query.set(key, String(value));
  }

  const queryString = query.toString();
  return queryString.length > 0 ? `?${queryString}` : "";
}
