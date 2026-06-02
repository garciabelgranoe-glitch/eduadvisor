import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { GoogleEmbedMap } from "@/components/maps/google-embed-map";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FeatureState } from "@/components/ui/feature-state";
import { SectionHeader } from "@/components/ui/section-header";
import { LeadCaptureForm } from "@/components/school/lead-capture-form";
import { PremiumMediaShowcase } from "@/components/school/premium-media-showcase";
import { PremiumUpgradeHighlight } from "@/components/school/premium-upgrade-highlight";
import { SchoolProfileAnalyticsTracker } from "@/components/school/profile-analytics-tracker";
import { SchoolProfileCtas } from "@/components/school/profile-ctas";
import { SchoolProfileLogoBadge } from "@/components/school/school-profile-logo-badge";
import { TrustStrip } from "@/components/school/trust-strip";
import { SearchResultCard } from "@/components/search/search-result-card";
import { JsonLd } from "@/components/seo/json-ld";
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

const levelLabelMap: Record<string, string> = {
  MATERNAL: "Maternal",
  INICIAL: "Inicial",
  PRIMARIA: "Primaria",
  SECUNDARIA: "Secundaria"
};

function buildImportedSummary(school: ApiSchoolDetail) {
  const base = `Perfil importado desde Google Maps para ${school.location.city}, ${school.location.province}.`;
  const googleRating = school.quality?.google?.rating ?? null;
  const googleReviewCount = school.quality?.google?.reviewCount ?? 0;
  if (googleRating !== null) {
    return `${base} Rating Google ${googleRating.toFixed(1)}/5 (${googleReviewCount} reseñas).`;
  }
  return `${base} Datos institucionales en proceso de curación por Radar Educativo.`;
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400" aria-label={`${rating} de ${max} estrellas`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? "text-amber-400" : "text-slate-200"}>
          ★
        </span>
      ))}
    </span>
  );
}

function matchCategoryScore(category: SeoRankingCategory, school: { name: string; description?: string | null }) {
  const text = `${school.name} ${school.description ?? ""}`.toLowerCase();
  if (category === "bilingues") return Number(text.includes("biling") || text.includes("inglés") || text.includes("ingles"));
  if (category === "deportes") return Number(text.includes("deporte") || text.includes("club") || text.includes("fútbol") || text.includes("futbol"));
  if (category === "jornada-completa") return Number(text.includes("jornada completa") || text.includes("full day") || text.includes("doble turno"));
  return Number(text.includes("tecnolog") || text.includes("steam") || text.includes("robot"));
}

async function resolveCategory(params: SchoolProfilePageProps["params"]) {
  const category = params.schoolSlug;
  if (!isValidRankingCategory(category)) return null;
  const context = await getGeoContext(params.province, params.city);
  if (!context) return null;
  const schools = await getGeoSchools(context.landing.city.slug, "60");
  const filtered = schools.items
    .map((school) => ({ school, score: matchCategoryScore(category, school) }))
    .filter((item) => item.score > 0)
    .map((item) => item.school)
    .slice(0, 24);
  return { context, category, filtered, indexable: filtered.length >= SEO_GEO_MIN_SCHOOL_COUNT };
}

async function resolveSchool(params: SchoolProfilePageProps["params"]) {
  const school = await getSchoolBySlug(params.schoolSlug);
  if (!school) return null;
  const canonicalPath = citySchoolProfilePath(school.location.province, school.location.city, school.slug);
  const requestedPath = citySchoolProfilePath(params.province, params.city, params.schoolSlug);
  return { school, canonicalPath, isCanonical: requestedPath === canonicalPath };
}

export async function generateMetadata({ params }: SchoolProfilePageProps): Promise<Metadata> {
  const categoryData = await resolveCategory(params);
  if (categoryData) {
    const categoryLabel = categoryLabels[categoryData.category as SeoRankingCategory] ?? categoryData.category;
    return buildPageMetadata({
      title: `Colegios ${categoryLabel} en ${categoryData.context.landing.city.name}`,
      description: `Listado de colegios ${categoryLabel} en ${categoryData.context.landing.city.name} con criterios de comparación locales.`,
      canonicalPath: citySchoolsCategoryPath(categoryData.context.landing.city.provinceSlug, categoryData.context.landing.city.slug, categoryData.category),
      index: categoryData.indexable
    });
  }
  const resolved = await resolveSchool(params);
  if (!resolved) return buildPageMetadata({ title: "Colegio no encontrado", description: "No encontramos el perfil solicitado.", canonicalPath: "/ar", index: false });
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
      permanentRedirect(citySchoolsCategoryPath(categoryData.context.landing.city.provinceSlug, categoryData.context.landing.city.slug, categoryData.category));
    }
    const categoryLabel = categoryLabels[categoryData.category as SeoRankingCategory] ?? categoryData.category;
    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: "Inicio", path: "/" }, { name: "Argentina", path: "/ar" },
      { name: categoryData.context.landing.city.province, path: `/ar/${categoryData.context.landing.city.provinceSlug}` },
      { name: categoryData.context.landing.city.name, path: `/ar/${categoryData.context.landing.city.provinceSlug}/${categoryData.context.landing.city.slug}` },
      { name: "Colegios", path: citySchoolsPath(categoryData.context.landing.city.provinceSlug, categoryData.context.landing.city.slug) },
      { name: categoryLabel, path: citySchoolsCategoryPath(categoryData.context.landing.city.provinceSlug, categoryData.context.landing.city.slug, categoryData.category) }
    ]);
    const itemListSchema = buildItemListSchema({
      name: `Colegios ${categoryLabel} en ${categoryData.context.landing.city.name}`,
      description: `Categoría ${categoryLabel} por ciudad`,
      path: citySchoolsCategoryPath(categoryData.context.landing.city.provinceSlug, categoryData.context.landing.city.slug, categoryData.category),
      itemUrls: categoryData.filtered.map((school) => citySchoolProfilePath(categoryData.context.landing.city.provinceSlug, categoryData.context.landing.city.slug, school.slug))
    });
    return (
      <section className="space-y-6">
        <JsonLd data={breadcrumbSchema} />
        <JsonLd data={itemListSchema} />
        <Card className="bg-gradient-to-r from-brand-50 to-white">
          <SectionHeader kicker="Categoría" title={`Colegios ${categoryLabel} en ${categoryData.context.landing.city.name}`} description="Selección de perfiles por tipo de propuesta educativa." />
        </Card>
        {!categoryData.indexable && (
          <FeatureState tone="warning" title="Categoría en consolidación" description={`Todavía estamos completando perfiles en esta ciudad (${categoryData.filtered.length}/${SEO_GEO_MIN_SCHOOL_COUNT}).`} />
        )}
        {categoryData.filtered.length === 0 ? (
          <FeatureState title="No encontramos colegios para esta categoría" description="Probá con otra categoría o explorá el buscador general." actionLabel="Ir al buscador" actionHref="/search" />
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
  if (!resolved) notFound();
  if (!resolved.isCanonical) permanentRedirect(resolved.canonicalPath);

  const { school } = resolved;
  const profileStatus = school.profile?.status ?? "BASIC";
  const canClaimProfile = profileStatus === "BASIC" || profileStatus === "CURATED";
  const canReceiveLeads = profileStatus === "PREMIUM";
  const isPremium = profileStatus === "PREMIUM";
  const miniDescription = school.description ?? buildImportedSummary(school);
  const mapQuery = [school.name, school.location.addressLine ?? undefined, school.location.city, school.location.province, school.location.country]
    .filter((v): v is string => Boolean(v)).join(", ");

  const googleRating = school.quality?.google?.rating ?? null;
  const googleReviewCount = school.quality?.google?.reviewCount ?? 0;
  const parentRating = school.rating.average;
  const scoreColor = school.eduAdvisorScore !== null && school.eduAdvisorScore >= 80
    ? "bg-emerald-700" : school.eduAdvisorScore !== null && school.eduAdvisorScore >= 60
      ? "bg-brand-800" : "bg-slate-600";

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Inicio", path: "/" }, { name: "Argentina", path: "/ar" },
    { name: school.location.province, path: provincePath(school.location.province) },
    { name: school.location.city, path: cityPath(school.location.province, school.location.city) },
    { name: "Colegios", path: citySchoolsPath(school.location.province, school.location.city) },
    { name: school.name, path: resolved.canonicalPath }
  ]);
  const schoolSchema = buildSchoolSchema({
    name: school.name, description: school.description, path: resolved.canonicalPath,
    address: { city: school.location.city, province: school.location.province, country: school.location.country },
    geo: school.location.coordinates, telephone: school.contacts.phone,
    sameAs: school.contacts.website ? [school.contacts.website] : undefined, rating: school.rating
  });

  return (
    <div className="space-y-8 pb-24 md:pb-0">
      <SchoolProfileAnalyticsTracker schoolSlug={school.slug} city={school.location.city} province={school.location.province} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={schoolSchema} />

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
        <Link href="/" className="hover:text-brand-700">Inicio</Link>
        <span>/</span>
        <Link href={`/ar/${school.location.province}`} className="hover:text-brand-700">{school.location.province}</Link>
        <span>/</span>
        <Link href={citySchoolsPath(school.location.province, school.location.city) as never} className="hover:text-brand-700">{school.location.city}</Link>
        <span>/</span>
        <span className="text-slate-600">{school.name}</span>
      </nav>

      {/* ── HERO ── */}
      <section className={`overflow-hidden rounded-3xl border ${isPremium ? "border-amber-300 shadow-[0_20px_50px_rgba(161,98,7,0.15)]" : "border-brand-100 shadow-[0_16px_40px_rgba(13,27,31,0.08)]"}`}>

        {/* Top accent */}
        <div className={`h-1 w-full ${isPremium ? "bg-gradient-to-r from-amber-400 via-amber-300 to-brand-400" : "bg-gradient-to-r from-brand-500 via-emerald-400 to-amber-400"}`} />

        <div className={`p-6 sm:p-8 ${isPremium ? "bg-gradient-to-br from-white via-amber-50/40 to-white" : "bg-gradient-to-br from-white via-brand-50/30 to-white"}`}>

          {/* School name + logo */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              {isPremium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-700">
                  ✦ Perfil Premium verificado
                </span>
              )}
              <h1 className="font-display text-2xl leading-tight text-ink sm:text-3xl md:text-4xl lg:text-5xl">
                {school.name}
              </h1>
              <p className="text-sm text-slate-500">
                {school.location.city}, {school.location.province}
                {school.location.addressLine && ` · ${school.location.addressLine}`}
              </p>
              {school.levels.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {school.levels.map((level) => (
                    <Badge key={level} className="rounded-full border-brand-100 bg-brand-50 text-brand-700">
                      {levelLabelMap[level] ?? level}
                    </Badge>
                  ))}
                </div>
              )}
              {miniDescription && (
                <p className="pt-1 max-w-2xl leading-relaxed text-slate-600">{miniDescription}</p>
              )}
            </div>
            <SchoolProfileLogoBadge
              schoolName={school.name}
              schoolSlug={school.slug}
              isPremium={canReceiveLeads}
              canClaimProfile={canClaimProfile}
              logoUrl={school.media?.logoUrl}
            />
          </div>

          {/* Key stats */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
            {/* Score — protagonista */}
            <div className={`flex flex-col items-center justify-center rounded-2xl px-4 py-4 text-white ${scoreColor} shadow-[0_8px_20px_rgba(0,0,0,0.2)]`}>
              <p className="text-3xl font-bold leading-none">
                {school.eduAdvisorScore ?? "—"}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-white/70">Score EA</p>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-brand-100 bg-white/80 px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Cuota est.</p>
              <p className="mt-1 text-lg font-bold text-ink">{formatCurrency(school.monthlyFeeEstimate) ?? "—"}</p>
              <p className="text-xs text-slate-400">por mes</p>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-brand-100 bg-white/80 px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Familias</p>
              <p className="mt-1 text-lg font-bold text-ink">
                {parentRating !== null ? formatRating(parentRating) : "—"}
              </p>
              <p className="text-xs text-slate-400">{school.rating.count} reseñas</p>
            </div>

            <div className="flex flex-col justify-center rounded-2xl border border-brand-100 bg-white/80 px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Google</p>
              <p className="mt-1 text-lg font-bold text-ink">
                {googleRating !== null ? formatRating(googleRating) : "—"}
              </p>
              <p className="text-xs text-slate-400">{googleReviewCount > 0 ? `${googleReviewCount} reseñas` : "sin datos"}</p>
            </div>
          </div>

          {/* Trust + CTAs */}
          <div className="mt-5 space-y-3">
            <TrustStrip
              profileStatus={school.profile.status}
              profileLabel={school.profile.label}
              verifiedAt={school.profile.verifiedAt}
              updatedAt={school.quality?.dataFreshnessAt ?? school.profile.curatedAt}
              sourceLabel={googleRating !== null ? "Google + Radar Educativo" : "Radar Educativo + institución"}
            />
            <SchoolProfileCtas schoolId={school.id} schoolSlug={school.slug} canClaimProfile={canClaimProfile} />
          </div>
        </div>
      </section>

      {/* ── CUERPO: dos columnas en desktop ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

        {/* Columna principal */}
        <div className="space-y-6">

          {/* Galería premium */}
          <PremiumMediaShowcase
            schoolName={school.name}
            schoolSlug={school.slug}
            isPremium={canReceiveLeads}
            canClaimProfile={canClaimProfile}
            imageUrls={school.media?.galleryUrls ?? []}
          />

          {/* Reseñas */}
          <Card className="space-y-4 border-brand-100">
            <SectionHeader
              kicker="Comunidad"
              title="Reseñas de familias"
              description={school.rating.count > 0 ? `${school.rating.count} reseñas · promedio ${formatRating(parentRating)}/5` : "Todavía no hay reseñas aprobadas."}
            />
            {school.reviews.length === 0 ? (
              <p className="text-sm text-slate-500">Sé el primero en dejar una reseña.</p>
            ) : (
              <div className="space-y-3">
                {school.reviews.slice(0, 5).map((review) => (
                  <article key={review.id} className="rounded-xl border border-brand-100 bg-brand-50/30 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-slate-400">{review.rating}/5</span>
                    </div>
                    <p className="text-sm leading-relaxed text-ink">&ldquo;{review.comment}&rdquo;</p>
                    {review.schoolResponse && (
                      <div className="rounded-lg border border-brand-100 bg-white px-3 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600">Respuesta del colegio</p>
                        <p className="mt-1 text-sm text-slate-600">{review.schoolResponse}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
            <Link
              href={`/review?school=${encodeURIComponent(school.slug)}`}
              className="inline-block text-sm font-semibold text-brand-700 hover:underline"
            >
              + Escribir una reseña
            </Link>
          </Card>

          {/* Mapa */}
          <Card className="space-y-3 border-brand-100">
            <SectionHeader kicker="Ubicación" title={school.location.city} />
            <GoogleEmbedMap query={mapQuery} title={`Mapa de ${school.name}`} heightClassName="h-64" />
            {school.location.addressLine && (
              <p className="text-sm text-slate-500">📍 {school.location.addressLine}</p>
            )}
          </Card>

        </div>

        {/* Columna lateral */}
        <div className="space-y-5">

          {/* Lead form / upgrade */}
          {!canReceiveLeads ? (
            <PremiumUpgradeHighlight
              schoolName={school.name}
              schoolSlug={school.slug}
              canClaimProfile={canClaimProfile}
              surface="school_profile"
            />
          ) : (
            <div id="lead-form">
              <LeadCaptureForm school={school} locked={false} />
            </div>
          )}

          {/* Beneficios */}
          {(school.scholarshipsAvailable || school.acceptsVoucher) && (
            <Card className="space-y-3 border-brand-100">
              <p className="ea-kicker">Beneficios</p>
              <div className="flex flex-wrap gap-2">
                {school.acceptsVoucher && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    ✓ Acepta Voucher Educativo
                  </span>
                )}
                {school.scholarshipsAvailable && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                    ✓ Otorga becas
                  </span>
                )}
              </div>
            </Card>
          )}

          {/* Datos institucionales */}
          <Card className="space-y-4 border-brand-100">
            <p className="ea-kicker">Datos institucionales</p>
            <dl className="space-y-2">
              {[
                { label: "Ciudad", value: school.location.city },
                { label: "Provincia", value: school.location.province },
                { label: "Alumnos", value: school.studentsCount ? String(school.studentsCount) : null },
                { label: "Teléfono", value: school.contacts.phone ?? null },
                { label: "Web", value: school.contacts.website ?? null, isLink: true }
              ].map(({ label, value, isLink }) => value ? (
                <div key={label} className="flex items-start justify-between gap-2 border-b border-brand-50 py-1.5 last:border-0">
                  <dt className="shrink-0 text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</dt>
                  <dd className="text-right text-sm text-ink">
                    {isLink ? (
                      <a href={value} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline underline-offset-2 break-all">
                        {value.replace(/^https?:\/\/(www\.)?/, "")}
                      </a>
                    ) : value}
                  </dd>
                </div>
              ) : null)}
            </dl>
          </Card>

          {/* Lead form si no estaba arriba */}
          {canReceiveLeads ? null : (
            <div id="lead-form">
              <LeadCaptureForm school={school} locked={!canReceiveLeads} />
            </div>
          )}

        </div>
      </div>

      {/* Sticky mobile CTA */}
      <StickyDecisionCta
        title={canReceiveLeads ? "¿Te interesa este colegio?" : "Comparar o escribir reseña"}
        primary={{
          label: canReceiveLeads ? "Solicitar información →" : "Agregar al comparador",
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
