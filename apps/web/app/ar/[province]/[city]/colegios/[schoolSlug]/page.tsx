import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { GoogleEmbedMap } from "@/components/maps/google-embed-map";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FeatureState } from "@/components/ui/feature-state";
import { SectionHeader } from "@/components/ui/section-header";
import { LeadCaptureForm } from "@/components/school/lead-capture-form";
import { PremiumMediaShowcase } from "@/components/school/premium-media-showcase";
import { PremiumNameMark } from "@/components/school/premium-name-mark";
import { PremiumUpgradeHighlight } from "@/components/school/premium-upgrade-highlight";
import { SchoolProfileAnalyticsTracker } from "@/components/school/profile-analytics-tracker";
import { SchoolProfileCtas } from "@/components/school/profile-ctas";
import { SchoolProfileLogoBadge } from "@/components/school/school-profile-logo-badge";
import { TrustStrip } from "@/components/school/trust-strip";
import { ProfileStatusBadge } from "@/components/school/profile-status-badge";
import { SearchResultCard } from "@/components/search/search-result-card";
import { JsonLd } from "@/components/seo/json-ld";
import { DataEvidence } from "@/components/ui/data-evidence";
import { getSchoolBySlug, type ApiSchoolDetail } from "@/lib/api";
import { formatCurrency, formatRating } from "@/lib/format";
import { getGeoContext, getGeoSchools } from "@/lib/seo/geo-data";
import {
  SEO_GEO_MIN_SCHOOL_COUNT,
  buildSchoolSchema,
  buildPageMetadata,
  buildBreadcrumbSchema,
  buildItemListSchema,
  citySchoolProfilePath,
  cityPath,
  provincePath,
  citySchoolsCategoryPath,
  citySchoolsPath,
  isValidRankingCategory,
  type SeoRankingCategory
} from "@/lib/seo";
import { StickyDecisionCta } from "@/components/ui/sticky-decision-cta";

interface SchoolProfilePageProps {
  params: {
    province: string;
    city: string;
    schoolSlug: string;
  };
}

const categoryLabels: Record<SeoRankingCategory, string> = {
  bilingues: "bilingües",
  deportes: "deportes",
  "jornada-completa": "jornada completa",
  tecnologicos: "tecnológicos"
};

function buildImportedSummary(school: ApiSchoolDetail) {
  const base = `Perfil importado desde Google Maps para ${school.location.city}, ${school.location.province}.`;
  const googleRating = school.quality?.google?.rating ?? null;
  const googleReviewCount = school.quality?.google?.reviewCount ?? 0;

  if (googleRating !== null) {
    return `${base} Rating Google ${googleRating.toFixed(1)}/5 (${googleReviewCount} reseñas).`;
  }

  return `${base} Datos institucionales en proceso de curación por EduAdvisor.`;
}

function matchCategoryScore(category: SeoRankingCategory, school: { name: string; description?: string | null }) {
  const text = `${school.name} ${school.description ?? ""}`.toLowerCase();

  if (category === "bilingues") {
    return Number(text.includes("biling") || text.includes("inglés") || text.includes("ingles"));
  }

  if (category === "deportes") {
    return Number(text.includes("deporte") || text.includes("club") || text.includes("fútbol") || text.includes("futbol"));
  }

  if (category === "jornada-completa") {
    return Number(text.includes("jornada completa") || text.includes("full day") || text.includes("doble turno"));
  }

  return Number(text.includes("tecnolog") || text.includes("steam") || text.includes("robot"));
}

async function resolveCategory(params: SchoolProfilePageProps["params"]) {
  const category = params.schoolSlug;

  if (!isValidRankingCategory(category)) {
    return null;
  }

  const context = await getGeoContext(params.province, params.city);

  if (!context) {
    return null;
  }

  const schools = await getGeoSchools(context.landing.city.slug, "60");
  const filtered = schools.items
    .map((school) => ({ school, score: matchCategoryScore(category, school) }))
    .filter((item) => item.score > 0)
    .map((item) => item.school)
    .slice(0, 24);

  return {
    context,
    category,
    filtered,
    indexable: filtered.length >= SEO_GEO_MIN_SCHOOL_COUNT
  };
}

async function resolveSchool(params: SchoolProfilePageProps["params"]) {
  const school = await getSchoolBySlug(params.schoolSlug);

  if (!school) {
    return null;
  }

  const canonicalPath = citySchoolProfilePath(
    school.location.province,
    school.location.city,
    school.slug
  );

  const requestedPath = citySchoolProfilePath(params.province, params.city, params.schoolSlug);

  return {
    school,
    canonicalPath,
    isCanonical: requestedPath === canonicalPath
  };
}

export async function generateMetadata({ params }: SchoolProfilePageProps): Promise<Metadata> {
  const categoryData = await resolveCategory(params);

  if (categoryData) {
    const categoryLabel = categoryLabels[categoryData.category as SeoRankingCategory] ?? categoryData.category;

    return buildPageMetadata({
      title: `Colegios ${categoryLabel} en ${categoryData.context.landing.city.name}`,
      description: `Listado de colegios ${categoryLabel} en ${categoryData.context.landing.city.name} con criterios de comparación locales.`,
      canonicalPath: citySchoolsCategoryPath(
        categoryData.context.landing.city.provinceSlug,
        categoryData.context.landing.city.slug,
        categoryData.category
      ),
      index: categoryData.indexable
    });
  }

  const resolved = await resolveSchool(params);

  if (!resolved) {
    return buildPageMetadata({
      title: "Colegio no encontrado",
      description: "No encontramos el perfil solicitado.",
      canonicalPath: "/ar",
      index: false
    });
  }

  return buildPageMetadata({
    title: `${resolved.school.name} en ${resolved.school.location.city} — reseñas, cuota y niveles`,
    description: resolved.school.description ?? buildImportedSummary(resolved.school),
    canonicalPath: resolved.canonicalPath,
    openGraphType: "article"
  });
}

export default async function SchoolProfilePage({ params }: SchoolProfilePageProps) {
  const categoryData = await resolveCategory(params);

  if (categoryData) {
    if (!categoryData.context.isCanonical) {
      permanentRedirect(
        citySchoolsCategoryPath(
          categoryData.context.landing.city.provinceSlug,
          categoryData.context.landing.city.slug,
          categoryData.category
        )
      );
    }

    const categoryLabel = categoryLabels[categoryData.category as SeoRankingCategory] ?? categoryData.category;

    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Argentina", path: "/ar" },
      { name: categoryData.context.landing.city.province, path: `/ar/${categoryData.context.landing.city.provinceSlug}` },
      {
        name: categoryData.context.landing.city.name,
        path: `/ar/${categoryData.context.landing.city.provinceSlug}/${categoryData.context.landing.city.slug}`
      },
      {
        name: "Colegios",
        path: citySchoolsPath(categoryData.context.landing.city.provinceSlug, categoryData.context.landing.city.slug)
      },
      {
        name: categoryLabel,
        path: citySchoolsCategoryPath(
          categoryData.context.landing.city.provinceSlug,
          categoryData.context.landing.city.slug,
          categoryData.category
        )
      }
    ]);

    const itemListSchema = buildItemListSchema({
      name: `Colegios ${categoryLabel} en ${categoryData.context.landing.city.name}`,
      description: `Categoría ${categoryLabel} por ciudad`,
      path: citySchoolsCategoryPath(
        categoryData.context.landing.city.provinceSlug,
        categoryData.context.landing.city.slug,
        categoryData.category
      ),
      itemUrls: categoryData.filtered.map((school) =>
        citySchoolProfilePath(
          categoryData.context.landing.city.provinceSlug,
          categoryData.context.landing.city.slug,
          school.slug
        )
      )
    });

    return (
      <section className="space-y-6">
        <JsonLd data={breadcrumbSchema} />
        <JsonLd data={itemListSchema} />

        <Card className="bg-gradient-to-r from-brand-50 to-white">
          <SectionHeader
            kicker="Categoría"
            title={`Colegios ${categoryLabel} en ${categoryData.context.landing.city.name}`}
            description="Selección de perfiles por tipo de propuesta educativa."
          />
        </Card>

        {!categoryData.indexable ? (
          <FeatureState
            tone="warning"
            title="Categoría en consolidación"
            description={`Todavía estamos completando perfiles en esta ciudad (${categoryData.filtered.length}/${SEO_GEO_MIN_SCHOOL_COUNT}).`}
          />
        ) : null}

        {categoryData.filtered.length === 0 ? (
          <FeatureState
            title="No encontramos colegios para esta categoría"
            description="Probá con otra categoría o explorá el buscador general."
            actionLabel="Ir al buscador"
            actionHref="/search"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {categoryData.filtered.map((school) => (
              <SearchResultCard key={school.id} school={school} variant="compact-mobile" />
            ))}
          </div>
        )}
      </section>
    );
  }

  const resolved = await resolveSchool(params);

  if (!resolved) {
    notFound();
  }

  if (!resolved.isCanonical) {
    permanentRedirect(resolved.canonicalPath);
  }

  const { school } = resolved;
  const profileStatus = school.profile?.status ?? "BASIC";
  const canClaimProfile = profileStatus === "BASIC" || profileStatus === "CURATED";
  const canReceiveLeads = profileStatus === "PREMIUM";
  const miniDescription = school.description ?? buildImportedSummary(school);
  const mapQuery = [
    school.name,
    school.location.addressLine ?? undefined,
    school.location.city,
    school.location.province,
    school.location.country
  ]
    .filter((value): value is string => Boolean(value))
    .join(", ");

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Inicio", path: "/" },
    { name: "Argentina", path: "/ar" },
    { name: school.location.province, path: provincePath(school.location.province) },
    {
      name: school.location.city,
      path: cityPath(school.location.province, school.location.city)
    },
    {
      name: "Colegios",
      path: citySchoolsPath(school.location.province, school.location.city)
    },
    { name: school.name, path: resolved.canonicalPath }
  ]);

  const schoolSchema = buildSchoolSchema({
    name: school.name,
    description: school.description,
    path: resolved.canonicalPath,
    address: {
      city: school.location.city,
      province: school.location.province,
      country: school.location.country
    },
    geo: school.location.coordinates,
    telephone: school.contacts.phone,
    sameAs: school.contacts.website ? [school.contacts.website] : undefined,
    rating: school.rating
  });

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <SchoolProfileAnalyticsTracker
        schoolSlug={school.slug}
        city={school.location.city}
        province={school.location.province}
      />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={schoolSchema} />

      <Card
        className={`space-y-4 bg-gradient-to-r from-white via-brand-50 to-amber-50 ${
          profileStatus === "PREMIUM"
            ? "border-amber-300 shadow-[0_18px_40px_rgba(161,98,7,0.14)]"
            : ""
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Perfil de colegio</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl text-ink">{school.name}</h1>
              <PremiumNameMark show={profileStatus === "PREMIUM"} />
            </div>
            <p className="max-w-3xl text-slate-600">{miniDescription}</p>
          </div>
          <SchoolProfileLogoBadge
            schoolName={school.name}
            schoolSlug={school.slug}
            isPremium={canReceiveLeads}
            canClaimProfile={canClaimProfile}
            logoUrl={school.media?.logoUrl}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <ProfileStatusBadge profile={school.profile} />
          {school.levels.map((level) => (
            <Badge key={level}>{level}</Badge>
          ))}
        </div>
        <TrustStrip
          profileStatus={school.profile.status}
          profileLabel={school.profile.label}
          verifiedAt={school.profile.verifiedAt}
          updatedAt={school.quality?.dataFreshnessAt ?? school.profile.curatedAt}
          sourceLabel={(school.quality?.google?.rating ?? null) !== null ? "Google + EduAdvisor" : "EduAdvisor + institución"}
        />
        <div className="grid gap-3 rounded-2xl bg-white/90 p-4 md:grid-cols-5">
          <DataEvidence label="Score" value={school.eduAdvisorScore ?? "-"} context="Índice EduAdvisor" />
          <DataEvidence
            label="Rating padres"
            value={formatRating(school.rating.average)}
            context={`${school.rating.count} reseñas`}
          />
          <DataEvidence
            label="Rating Google"
            value={formatRating(school.quality?.google?.rating ?? null)}
            context={`${school.quality?.google?.reviewCount ?? 0} reseñas`}
          />
          <DataEvidence label="Cuota" value={formatCurrency(school.monthlyFeeEstimate)} context="Estimación mensual" />
          <DataEvidence label="Ubicación" value={school.location.city} context={school.location.province} />
        </div>
        <SchoolProfileCtas schoolId={school.id} schoolSlug={school.slug} canClaimProfile={canClaimProfile} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">Información institucional</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• País: {school.location.country}</li>
            <li>• Provincia: {school.location.province}</li>
            <li>• Ciudad: {school.location.city}</li>
            <li>• Alumnos: {school.studentsCount ?? "No informado"}</li>
            <li>
              • Web:{" "}
              {school.contacts.website ? (
                <a
                  href={school.contacts.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-2"
                >
                  {school.contacts.website}
                </a>
              ) : (
                "No informado"
              )}
            </li>
            <li>• Teléfono: {school.contacts.phone ?? "No informado"}</li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">Reseñas recientes</h2>
          <div className="space-y-3">
            {school.reviews.length === 0 ? (
              <p className="text-sm text-slate-600">No hay reseñas aprobadas todavía.</p>
            ) : (
              school.reviews.slice(0, 4).map((review) => (
                <article key={review.id} className="rounded-xl border border-brand-100 p-3">
                  <p className="font-medium text-ink">&quot;{review.comment}&quot;</p>
                  <p className="mt-1 text-sm text-slate-600">Rating {review.rating}/5</p>
                  {review.schoolResponse ? (
                    <div className="mt-3 rounded-lg border border-brand-100 bg-brand-50/60 p-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-brand-700">Respuesta del colegio</p>
                      <p className="mt-1 text-sm text-slate-700">{review.schoolResponse}</p>
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="space-y-3">
        <h2 className="text-xl font-semibold text-ink">Ubicación en mapa</h2>
        <GoogleEmbedMap query={mapQuery} title={`Mapa de ${school.name}`} heightClassName="h-72" />
      </Card>

      <PremiumMediaShowcase
        schoolName={school.name}
        schoolSlug={school.slug}
        isPremium={canReceiveLeads}
        canClaimProfile={canClaimProfile}
        imageUrls={school.media?.galleryUrls ?? []}
      />

      {!canReceiveLeads ? (
        <PremiumUpgradeHighlight
          schoolName={school.name}
          schoolSlug={school.slug}
          canClaimProfile={canClaimProfile}
          surface="school_profile"
        />
      ) : null}

      <div id="lead-form">
        <LeadCaptureForm school={school} locked={!canReceiveLeads} />
      </div>

      <StickyDecisionCta
        title="Decisión rápida"
        primary={{
          label: canReceiveLeads ? "Solicitar contacto" : "Agregar a comparador",
          href: canReceiveLeads ? "#lead-form" : `/compare?schools=${encodeURIComponent(school.slug)}`
        }}
        secondary={{
          label: "Escribir reseña",
          href: `/review?school=${encodeURIComponent(school.slug)}`,
          variant: "ghost"
        }}
      />
    </div>
  );
}
