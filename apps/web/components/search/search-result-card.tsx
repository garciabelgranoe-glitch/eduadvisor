"use client";

import Image from "next/image";
import Link from "next/link";
import { SaveSchoolButton } from "@/components/parent/save-school-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ApiSchoolListItem } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { formatCurrency, formatRating } from "@/lib/format";
import { citySchoolProfilePath } from "@/lib/seo";

interface SearchResultCardProps {
  school: ApiSchoolListItem;
  showSaveButton?: boolean;
  compareHref?: string;
  compareButtonLabel?: string;
  variant?: "search" | "ranking" | "saved" | "compact-mobile";
  rank?: number;
}

const levelLabelMap: Record<string, string> = {
  MATERNAL: "Maternal",
  INICIAL: "Inicial",
  PRIMARIA: "Primaria",
  SECUNDARIA: "Secundaria"
};

export function SearchResultCard({
  school,
  showSaveButton = true,
  compareHref,
  compareButtonLabel = "Comparar",
  variant = "search",
  rank
}: SearchResultCardProps) {
  const googleRating = school.quality?.google?.rating ?? null;
  const googleReviewCount = school.quality?.google?.reviewCount ?? 0;
  const parentRating = school.rating.average;
  const isPremiumProfile = school.profile.status === "PREMIUM";
  const logoUrl = isPremiumProfile ? (school.media?.logoUrl ?? null) : null;
  const isRanking = variant === "ranking";
  const isSaved = variant === "saved";

  const schoolProfilePath = citySchoolProfilePath(
    school.location.province,
    school.location.city,
    school.slug
  );

  const scoreColor =
    school.eduAdvisorScore !== null && school.eduAdvisorScore >= 80
      ? "bg-emerald-700"
      : school.eduAdvisorScore !== null && school.eduAdvisorScore >= 60
        ? "bg-brand-800"
        : "bg-slate-600";

  // Fallback al rating de Google si no hay Score R.E.
  const googleScoreFallback =
    school.eduAdvisorScore === null && googleRating !== null && googleReviewCount >= 3
      ? { value: formatRating(googleRating), count: googleReviewCount }
      : null;

  // Perfil con contenido mínimo: tiene niveles cargados, cuota estimada o logo premium
  const profileHasContent = Boolean(school.levels?.length) || school.monthlyFeeEstimate !== null || isPremiumProfile;

  const ratingDisplay = (() => {
    // 1. Reseñas propias de Radar Educativo (cualquier cantidad)
    if (parentRating !== null && school.rating.count > 0)
      return { value: formatRating(parentRating), source: `${school.rating.count} reseña${school.rating.count !== 1 ? "s" : ""}` };
    // 2. Google como fallback: mínimo 5 reseñas y perfil con algo de contenido
    if (googleRating !== null && googleReviewCount !== null && googleReviewCount >= 5 && profileHasContent)
      return { value: formatRating(googleRating), source: `${googleReviewCount} en Google` };
    return null;
  })();

  return (
    <Card
      className={[
        "group ea-transition-standard relative overflow-hidden border-brand-200 p-0",
        "hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(13,27,31,0.12)]",
        isRanking ? "border-brand-300" : "",
        isSaved ? "border-amber-200" : "",
        isPremiumProfile
          ? "border-amber-300 bg-gradient-to-b from-white via-amber-50/40 to-white shadow-[0_16px_34px_rgba(161,98,7,0.12)]"
          : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Thin accent bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-500 via-emerald-400 to-amber-400" />

      <div className="flex flex-col gap-4 p-5">

        {/* Header: name + score */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {isRanking && rank ? (
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">#{rank}</p>
            ) : null}
            <h3 className="font-display text-xl leading-snug text-ink">
              {school.name}
              {isPremiumProfile && (
                <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                  Premium
                </span>
              )}
            </h3>
            <p className="text-sm text-slate-500">
              {school.location.city}, {school.location.province}
            </p>
          </div>

          {/* Logo (premium) + Score */}
          <div className="flex shrink-0 flex-col items-center gap-2">
            {logoUrl && (
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-amber-200 bg-white p-1 shadow-[0_4px_12px_rgba(161,98,7,0.15)]">
                <Image
                  src={logoUrl}
                  alt={`Logo ${school.name}`}
                  width={44}
                  height={44}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </div>
            )}
            {school.eduAdvisorScore !== null ? (
              <div className={`rounded-xl px-3 py-2 text-center text-white ${scoreColor} shadow-[0_8px_20px_rgba(0,0,0,0.2)]`}>
                <p className="text-lg font-bold leading-none">{school.eduAdvisorScore}</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-widest text-white/75">Score R.E.</p>
              </div>
            ) : googleScoreFallback ? (
              <div className="rounded-xl bg-slate-500 px-3 py-2 text-center text-white shadow-[0_8px_20px_rgba(0,0,0,0.15)]">
                <p className="text-lg font-bold leading-none">⭐ {googleScoreFallback.value}</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-widest text-white/75">Google</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Level pills */}
        {school.levels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {school.levels.map((level) => (
              <Badge key={level} className="rounded-full border-brand-100 bg-brand-50 text-brand-700">
                {levelLabelMap[level] ?? level}
              </Badge>
            ))}
          </div>
        )}

        {/* Key stats row */}
        <div className="grid grid-cols-3 divide-x divide-brand-100 rounded-xl border border-brand-100 bg-brand-50/40">
          <div className="px-3 py-2.5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Cuota est.</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">
              {formatCurrency(school.monthlyFeeEstimate) ?? "—"}
            </p>
          </div>
          <div className="px-3 py-2.5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Valoración</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">
              {ratingDisplay ? (
                <span title={ratingDisplay.source}>⭐ {ratingDisplay.value}</span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </p>
          </div>
          <div className="px-3 py-2.5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Alumnos</p>
            <p className="mt-0.5 text-sm font-semibold text-ink">
              {school.studentsCount !== null ? (
                school.studentsCount
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </p>
          </div>
        </div>

        {/* Beneficios */}
        {(school.acceptsVoucher || school.scholarshipsAvailable) && (
          <div className="flex flex-wrap gap-1.5">
            {school.acceptsVoucher && (
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                ✓ Voucher Educativo
              </span>
            )}
            {school.scholarshipsAvailable && (
              <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                ✓ Becas disponibles
              </span>
            )}
          </div>
        )}

        {/* Trust line — minimal */}
        <p className="text-[11px] text-slate-400">
          {school.profile.status === "PREMIUM"
            ? "✓ Perfil premium · datos verificados por Radar Educativo"
            : school.profile.status === "VERIFIED"
              ? "✓ Perfil verificado por Radar Educativo"
              : "Perfil en consolidación · datos de fuentes públicas"}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            asChild
            className="flex-1"
            onClick={() =>
              trackEvent("school_profile_opened", {
                source: "search_card",
                schoolSlug: school.slug,
                variant
              })
            }
          >
            <Link href={schoolProfilePath as never}>Ver perfil</Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            onClick={() =>
              trackEvent("school_compare_clicked", {
                source: "search_card",
                schoolSlug: school.slug,
                variant
              })
            }
          >
            <Link href={(compareHref ?? `/compare?schools=${school.slug}`) as never}>
              {compareButtonLabel}
            </Link>
          </Button>

          {showSaveButton && <SaveSchoolButton schoolId={school.id} schoolSlug={school.slug} />}
        </div>
      </div>
    </Card>
  );
}
