export type SchoolProfileStatus = "BASIC" | "CURATED" | "VERIFIED" | "PREMIUM";

export interface SchoolProfileBadge {
  status: SchoolProfileStatus;
  label: string;
  badge: string;
  tone: "neutral" | "info" | "success" | "warning";
  verifiedAt: string | null;
  curatedAt: string | null;
  premiumSince: string | null;
  premiumUntil: string | null;
}

export interface ApiSchoolListItem {
  id: string;
  name: string;
  slug: string;
  profile: SchoolProfileBadge;
  levels: string[];
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
  rating: {
    average: number | null;
    count: number;
  };
  quality?: {
    google: {
      rating: number | null;
      reviewCount: number | null;
    };
  };
  media?: {
    logoUrl: string | null;
    galleryUrls: string[];
  };
  eduAdvisorScore: number | null;
  leadIntentScore?: number | null;
  contacts: {
    website: string | null;
    phone: string | null;
    email: string | null;
  };
}

export interface ApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface SchoolsListResponse {
  items: ApiSchoolListItem[];
  meta: ApiMeta;
}

export interface SearchResponse extends SchoolsListResponse {
  engine: "meilisearch" | "postgres_fallback";
  query: string | null;
}

export interface ApiSchoolDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  profile: SchoolProfileBadge;
  levels: string[];
  monthlyFeeEstimate: number | null;
  enrollmentFee: number | null;
  scholarshipsAvailable: boolean;
  studentsCount: number | null;
  location: {
    city: string;
    province: string;
    country: string;
    addressLine: string | null;
    postalCode: string | null;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  contacts: {
    website: string | null;
    phone: string | null;
    email: string | null;
  };
  media?: {
    logoUrl: string | null;
    galleryUrls: string[];
  };
  eduAdvisorScore: number | null;
  quality?: {
    profileCompleteness: number;
    dataFreshnessAt: string | null;
    google: {
      placeId: string | null;
      rating: number | null;
      reviewCount: number | null;
    };
  };
  rating: {
    average: number | null;
    count: number;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    schoolResponse: string | null;
    schoolResponseAt: string | null;
    createdAt: string;
  }>;
}

export interface SchoolSearchParams {
  q?: string;
  country?: string;
  province?: string;
  city?: string;
  level?: string;
  profileStatus?: "BASIC" | "CURATED" | "VERIFIED" | "PREMIUM";
  feeMin?: string;
  feeMax?: string;
  ratingMin?: string;
  page?: string;
  limit?: string;
  sortBy?: "relevance" | "leadIntentScore" | "name" | "monthlyFeeEstimate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateLeadPayload {
  schoolId: string;
  parentName: string;
  childAge: number;
  educationLevel: "INICIAL" | "PRIMARIA" | "SECUNDARIA";
  phone: string;
  email: string;
}

export interface LeadItem {
  id: string;
  schoolId: string;
  parentName: string;
  childAge: number;
  educationLevel: "INICIAL" | "PRIMARIA" | "SECUNDARIA";
  phone: string;
  email: string;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
  createdAt: string;
  updatedAt?: string;
}

export interface SchoolLeadsResponse {
  school: {
    id: string;
    name: string;
    slug: string;
  };
  items: LeadItem[];
  meta: ApiMeta;
}

export interface SchoolLeadSummaryResponse {
  school: {
    id: string;
    name: string;
    slug: string;
  };
  total: number;
  byStatus: {
    NEW: number;
    CONTACTED: number;
    QUALIFIED: number;
    CLOSED: number;
  };
}

export interface SchoolDashboardResponse {
  school: {
    id: string;
    name: string;
    slug: string;
    profile: SchoolProfileBadge;
    description: string | null;
    monthlyFeeEstimate: number | null;
    enrollmentFee: number | null;
    scholarshipsAvailable: boolean;
    studentsCount: number | null;
    levels: string[];
    location: {
      city: string;
      province: string;
      country: string;
      countryCode: string;
      addressLine: string | null;
      postalCode: string | null;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
    contacts: {
      website: string | null;
      phone: string | null;
      email: string | null;
    };
    media?: {
      logoUrl: string | null;
      galleryUrls: string[];
    };
    billing: {
      currentPlan: {
        id: string;
        status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
        planCode: string;
        priceMonthly: number | null;
        currency: string;
        startsAt: string;
        endsAt: string | null;
        trialEndsAt: string | null;
      } | null;
      entitlements: {
        canManageLeads: boolean;
        canRespondReviews: boolean;
        canUsePremiumLeadExport: boolean;
        canAccessPriorityPlacement: boolean;
      };
    };
  };
  stats: {
    leadsTotal: number;
    leadsByStatus: {
      NEW: number;
      CONTACTED: number;
      QUALIFIED: number;
      CLOSED: number;
    };
    conversionRate: number;
    reviewsApproved: number;
    reviewsPending: number;
    reviewsResponded: number;
    reviewResponseRate: number;
    averageReviewResponseHours: number | null;
    pendingReviewResponseSlaBreaches: number;
    ratingAverage: number | null;
    profileCompleteness: number;
  };
  recentLeads: LeadItem[];
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string;
    schoolResponse: string | null;
    schoolResponseAt: string | null;
    createdAt: string;
  }>;
  leadTrend: Array<{
    month: string;
    leads: number;
  }>;
}

export interface ParentSavedSchoolItem {
  id: string;
  createdAt: string;
  school: {
    id: string;
    name: string;
    slug: string;
    profileStatus: SchoolProfileStatus;
    city: string;
    province: string;
    monthlyFeeEstimate: number | null;
    rating: {
      average: number | null;
      count: number;
    };
  };
}

export interface ParentSavedSchoolsResponse {
  items: ParentSavedSchoolItem[];
  meta: {
    total: number;
    limit: number;
  };
}

export interface ParentComparisonItem {
  id: string;
  schoolSlugs: string[];
  comparePath: string;
  createdAt: string;
  updatedAt: string;
  schools: Array<{
    id: string;
    name: string;
    slug: string;
    profileStatus: SchoolProfileStatus;
    city: string;
    province: string;
    monthlyFeeEstimate: number | null;
    rating: {
      average: number | null;
      count: number;
    };
  }>;
}

export interface ParentAlertItem {
  id: string;
  type: "SAVED_SCHOOL_ADDED" | "COMPARISON_SAVED" | "SCHOOL_UPDATE";
  title: string;
  message: string;
  linkPath: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  school: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface ParentAlertsResponse {
  items: ParentAlertItem[];
  meta: {
    total: number;
    unread: number;
    limit: number;
  };
}

export interface ParentComparisonsResponse {
  items: ParentComparisonItem[];
  meta: {
    total: number;
    limit: number;
  };
}

export interface ParentDashboardResponse {
  parent: {
    id: string;
    email: string;
  };
  metrics: {
    savedSchools: number;
    activeComparisons: number;
    unreadAlerts: number;
    nextOpenHouse: string | null;
  };
  savedSchools: ParentSavedSchoolItem[];
  comparisons: ParentComparisonItem[];
  alerts: ParentAlertItem[];
  nextAction: {
    stage: "DISCOVERY" | "SHORTLIST" | "EVALUATION" | "CONTACT" | "DECISION";
    title: string;
    detail: string;
    ctaLabel: string;
    ctaPath: string;
  };
}

export interface UpdateSchoolProfilePayload {
  schoolId: string;
  name?: string;
  description?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  monthlyFeeEstimate?: number | null;
  studentsCount?: number | null;
  latitude?: number;
  longitude?: number;
  levels?: Array<"INICIAL" | "PRIMARIA" | "SECUNDARIA">;
}

export interface AdminOverviewResponse {
  schools: {
    total: number;
    active: number;
    inactive: number;
  };
  reviews: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    response: {
      responded: number;
      awaitingResponse: number;
      responseCoverageRate: number;
      averageResponseHours: number | null;
      responsesWithinSla: number;
      withinSlaRate: number;
      pendingSlaBreaches: number;
      respondingSchools: number;
      schoolsWithApprovedReviews: number;
      schoolAdoptionRate: number;
    };
  };
  claims: {
    total: number;
    byStatus: {
      PENDING: number;
      UNDER_REVIEW: number;
      APPROVED: number;
      REJECTED: number;
    };
  };
  leads: {
    total: number;
    byStatus: {
      NEW: number;
      CONTACTED: number;
      QUALIFIED: number;
      CLOSED: number;
    };
    conversionRate: number;
  };
  leadTrend: Array<{
    month: string;
    leads: number;
  }>;
  topCities: Array<{
    city: string;
    schools: number;
  }>;
}

export interface AdminSchoolItem {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  profileStatus?: SchoolProfileStatus;
  levels: string[];
  city: string;
  province: string;
  country: string;
  countryCode: string;
  subscription: {
    id: string;
    status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
    planCode: string;
    priceMonthly: number | null;
    startsAt: string;
    endsAt: string | null;
  } | null;
  leadsCount: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSchoolsResponse {
  items: AdminSchoolItem[];
  meta: ApiMeta;
}

export interface AdminBillingOverviewResponse {
  generatedAt: string;
  kpis: {
    activeSubscriptions: number;
    pastDueSubscriptions: number;
    mrr: number;
    invoicesPaid30d: number;
    revenuePaid30d: number;
    checkoutSessionsOpen: number;
  };
  invoices: {
    byStatus: {
      DRAFT: number;
      OPEN: number;
      PAID: number;
      VOID: number;
      UNCOLLECTIBLE: number;
    };
  };
  webhooks: {
    byStatus: {
      RECEIVED: number;
      PROCESSED: number;
      FAILED: number;
      DUPLICATE: number;
      IGNORED: number;
    };
  };
}

export interface AdminBillingInvoiceItem {
  id: string;
  school: {
    id: string;
    name: string;
    slug: string;
  };
  provider: "MANUAL" | "STRIPE" | "MERCADO_PAGO";
  status: "DRAFT" | "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE";
  currency: string;
  amountSubtotal: number;
  amountTax: number;
  amountTotal: number;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  externalInvoiceId: string | null;
  hostedInvoiceUrl: string | null;
}

export interface AdminBillingInvoicesResponse {
  items: AdminBillingInvoiceItem[];
  meta: ApiMeta;
}

export interface AdminBillingWebhookEventItem {
  id: string;
  provider: "MANUAL" | "STRIPE" | "MERCADO_PAGO";
  externalEventId: string;
  eventType: string;
  status: "RECEIVED" | "PROCESSED" | "FAILED" | "DUPLICATE" | "IGNORED";
  signatureValid: boolean;
  school: {
    id: string;
    name: string;
    slug: string;
  } | null;
  errorMessage: string | null;
  processedAt: string | null;
  receivedAt: string;
}

export interface AdminBillingWebhookEventsResponse {
  items: AdminBillingWebhookEventItem[];
  meta: ApiMeta;
}

export interface AdminBillingCheckoutSessionResponse {
  id: string;
  school: {
    id: string;
    name: string;
    slug: string;
  };
  provider: "MANUAL" | "STRIPE" | "MERCADO_PAGO";
  status: "OPEN" | "COMPLETED" | "EXPIRED";
  planCode: string;
  amountMonthly: number;
  currency: string;
  intervalMonths: number;
  checkoutUrl: string;
  successUrl: string | null;
  cancelUrl: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface AdminGrowthFunnelResponse {
  generatedAt: string;
  windowDays: number;
  trendDays: number;
  stages: {
    parentsTotal: number;
    parentsWithSavedSchools: number;
    parentsWithComparisons: number;
    parentsWithLeads: number;
    parentsWithClosedLeads: number;
  };
  conversion: {
    toSaved: number;
    toCompared: number;
    toLead: number;
    toClosedLead: number;
    overallToClosedLead: number;
  };
  dropOff: {
    beforeSaved: number;
    beforeCompared: number;
    beforeLead: number;
    beforeClosedLead: number;
  };
  recommendations: string[];
  trend: Array<{
    date: string;
    stages: {
      parentsTotal: number;
      parentsWithSavedSchools: number;
      parentsWithComparisons: number;
      parentsWithLeads: number;
      parentsWithClosedLeads: number;
    };
    conversion: {
      toSaved: number;
      toCompared: number;
      toLead: number;
      toClosedLead: number;
    };
  }>;
}

export interface UpdateSchoolSubscriptionPayload {
  schoolId: string;
  status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
  planCode?: string;
  priceMonthly?: number;
  durationMonths?: number;
}

export interface AdminClaimRequestItem {
  id: string;
  requestType: "CLAIM" | "PUBLISH";
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  verificationMethod: "PHONE_OTP" | "EMAIL_DOMAIN" | "MANUAL" | null;
  requestedSchool: {
    name: string;
    city: string;
    province: string;
    country: string;
    website: string | null;
  };
  representative: {
    id: string;
    fullName: string;
    role: string;
    email: string;
    phone: string;
  } | null;
  school: {
    id: string;
    name: string;
    slug: string;
    profileStatus: SchoolProfileStatus;
    profile: SchoolProfileBadge;
  } | null;
  notes: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminClaimRequestsResponse {
  items: AdminClaimRequestItem[];
  meta: ApiMeta;
}

export interface SeoCityListItem {
  city: string;
  slug: string;
  province: string;
  provinceSlug: string;
  country: string;
  countryCode: string;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
  schoolCount: number;
  averageMonthlyFee: number | null;
}

export interface SeoCitiesResponse {
  items: SeoCityListItem[];
  meta: {
    total: number;
    limit: number;
  };
}

export interface SeoCityLandingResponse {
  city: {
    name: string;
    slug: string;
    province: string;
    provinceSlug: string;
    country: string;
    countryCode: string;
    coordinates: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  stats: {
    schoolCount: number;
    averageMonthlyFee: number | null;
    monthlyFeeRange: {
      min: number | null;
      max: number | null;
    };
    levelDistribution: {
      INICIAL: number;
      PRIMARIA: number;
      SECUNDARIA: number;
    };
    lastSchoolUpdateAt: string | null;
  };
}

export interface SeoSitemapResponse {
  generatedAt: string;
  schools: Array<{
    slug: string;
    lastModified: string;
  }>;
  cities: Array<{
    slug: string;
    schoolCount: number;
    lastModified: string | null;
  }>;
}

export interface MatchRecommendationParams {
  country?: string;
  province?: string;
  city?: string;
  childAge?: string;
  educationLevel?: "INICIAL" | "PRIMARIA" | "SECUNDARIA";
  budgetMin?: string;
  budgetMax?: string;
  maxDistanceKm?: string;
  preferredTypes?: string;
  priorities?: string;
  queryText?: string;
  limit?: string;
}

export interface MatchRecommendationResponse {
  session: {
    id: string;
    createdAt: string;
  };
  criteria: {
    country?: string;
    province?: string;
    city?: string;
    childAge: number;
    educationLevel: "INICIAL" | "PRIMARIA" | "SECUNDARIA";
    budgetMin?: number;
    budgetMax?: number;
    maxDistanceKm: number;
    preferredTypes: string[];
    priorities: string[];
    queryText?: string;
    inferredTypes: string[];
    inferredPriorities: string[];
    limit: number;
    location: {
      country: string | null;
      province: string | null;
      city: string | null;
    };
  };
  meta: {
    totalConsidered: number;
    totalMatched: number;
  };
  items: Array<{
    rank: number;
    score: number;
    distanceKm: number | null;
    highlights: string[];
    breakdown: {
      distance: number;
      budget: number;
      level: number;
      quality: number;
      intent: number;
      total: number;
    };
    school: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      monthlyFeeEstimate: number | null;
      studentsCount: number | null;
      levels: string[];
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
      contacts: {
        website: string | null;
        phone: string | null;
        email: string | null;
      };
      rating: {
        average: number | null;
        count: number;
      };
      eduAdvisorScore: number | null;
    };
  }>;
}

export interface RankingParams {
  country?: string;
  province?: string;
  city?: string;
  limit?: string;
}

export interface RankingsResponse {
  generatedAt: string;
  scope: {
    country: string | null;
    province: string | null;
    city: string | null;
  };
  items: Array<{
    rank: number;
    city: {
      name: string;
      slug: string;
      province: string;
      provinceSlug: string;
      country: string;
      countryCode: string;
    };
    schools: number;
    topScore: number | null;
    averageScore: number | null;
    topSchools: Array<{
      id: string;
      name: string;
      slug: string;
      score: number | null;
      approvedReviewCount: number;
      responseCoverageRate: number;
      responseWithinSlaRate: number;
    }>;
  }>;
}

export interface MarketInsightsParams {
  country?: string;
  province?: string;
  city?: string;
  windowDays?: string;
  topLimit?: string;
}

export interface MarketInsightsResponse {
  generatedAt: string;
  scope: {
    country: string | null;
    province: string | null;
    city: string | null;
  };
  metrics: {
    avgMonthlyFee: number | null;
    monthlyFeeRange: {
      min: number | null;
      max: number | null;
    };
    demandByLevel: {
      INICIAL: number;
      PRIMARIA: number;
      SECUNDARIA: number;
    };
    satisfactionAverage: number | null;
    totalSchools: number;
    totalLeadsWindow: number;
  };
  topCities: Array<{
    city: string;
    citySlug: string;
    province: string;
    country: string;
    schools: number;
    avgMonthlyFee: number | null;
    leadsWindow: number;
  }>;
  mostSearchedSchools: Array<{
    schoolId: string;
    schoolName: string;
    schoolSlug: string;
    city: string;
    leads: number;
    reviewCount: number;
    interestScore: number;
  }>;
  leadTrend: Array<{
    month: string;
    leads: number;
  }>;
}
