"use client";

import Link from "next/link";
import { SaveSchoolButton } from "@/components/parent/save-school-button";
import { TrustStrip } from "@/components/school/trust-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataEvidence } from "@/components/ui/data-evidence";
import { ProfileStatusBadge } from "@/components/school/profile-status-badge";
import { PremiumNameMark } from "@/components/school/premium-name-mark";
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
  const hasGoogleRating = googleRating !== null;
  const parentRating = school.rating.average;
  const hasParentRating = parentRating !== null;
  const leadIntentScore = school.leadIntentScore ?? null;
  const leadIntentLabel =
    leadIntentScore === null
      ? null
      : leadIntentScore >= 75
        ? "Alta respuesta"
        : leadIntentScore >= 55
          ? "Respuesta media"
          : "Perfil en desarrollo";
  const levelLabelMap: Record<string, string> = {
    INICIAL: "Inicial",
    PRIMARIA: "Primaria",
    SECUNDARIA: "Secundaria"
  };
  const website = school.contacts.website;
  const schoolProfilePath = citySchoolProfilePath(school.location.province, school.location.city, school.slug);
  const isCompact = variant === "compact-mobile";
  const isRanking = variant === "ranking";
  const isSaved = variant === "saved";
  const isPremiumProfile = school.profile.status === "PREMIUM";
  const websiteHost = (() => {
    if (!website) {
      return null;
    }
    try {
      return new URL(website).hostname.replace(/^www\./i, "");
    } catch {
      return website;
    }
  })();
  const scoreTone =
    school.eduAdvisorScore !== null && school.eduAdvisorScore >= 80
      ? "bg-emerald-700"
      : school.eduAdvisorScore !== null && school.eduAdvisorScore >= 60
        ? "bg-brand-900"
        : "bg-slate-800";

  return (
    <Card
      className={`group ea-transition-standard ea-enter relative overflow-hidden border-brand-200 p-0 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(13,27,31,0.12)] ${
        isRanking ? "border-brand-300 shadow-[0_14px_28px_rgba(31,92,77,0.12)]" : ""
      } ${isSaved ? "border-amber-200 bg-gradient-to-b from-white to-amber-50/30" : ""} ${
        isPremiumProfile ? "border-amber-300 bg-gradient-to-b from-white via-amber-50/45 to-white shadow-[0_16px_34px_rgba(161,98,7,0.14)]" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 via-emerald-500 to-amber-400" />

      <div className="space-y-4 p-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            {isRanking && rank ? (
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Ranking #{rank}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-semibold leading-tight text-ink">{school.name}</h3>
              <PremiumNameMark show={isPremiumProfile} size="sm" />
            </div>
            <p className="text-sm text-slate-600">
              {school.location.city}, {school.location.province}
            </p>

            <div className="flex flex-wrap gap-2">
              <ProfileStatusBadge profile={school.profile} />
              {leadIntentLabel ? (
                <Badge
                  className={
                    leadIntentScore !== null && leadIntentScore >= 75
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }
                >
                  {leadIntentLabel}
                </Badge>
              ) : null}
              {school.levels.map((level) => (
                <Badge key={level}>{levelLabelMap[level] ?? level}</Badge>
              ))}
            </div>
          </div>

          <div className={`shrink-0 rounded-xl px-3 py-2 text-right text-white shadow-[0_10px_25px_rgba(31,92,77,0.35)] ${scoreTone}`}>
            <p className="text-[10px] uppercase tracking-[0.14em]">Score</p>
            <p className="text-lg font-semibold leading-none">{school.eduAdvisorScore ?? "-"}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-white/80">EduAdvisor</p>
          </div>
        </div>

        {websiteHost ? (
          <div className="rounded-xl border border-brand-100 bg-brand-50/40 px-3 py-2 text-xs text-slate-600">
            Sitio oficial:{" "}
            <a
              href={website ?? undefined}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-2"
            >
              {websiteHost}
            </a>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-600">
            Sitio oficial no informado
          </div>
        )}

        <TrustStrip
          profileStatus={school.profile.status}
          profileLabel={school.profile.label}
          verifiedAt={school.profile.verifiedAt}
          updatedAt={school.profile.curatedAt ?? school.profile.verifiedAt}
          sourceLabel={hasGoogleRating ? "Google + EduAdvisor" : "EduAdvisor + fuentes institucionales"}
          compact={isCompact}
        />

        <div className={`grid gap-2 text-sm ${isCompact ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
          <DataEvidence
            label="Cuota"
            value={formatCurrency(school.monthlyFeeEstimate)}
            context={isCompact ? undefined : "Estimación mensual"}
          />
          <DataEvidence
            label="Google"
            value={hasGoogleRating ? formatRating(googleRating) : "Sin datos"}
            context={hasGoogleRating ? `${googleReviewCount} reseñas` : "Sin reseñas públicas"}
          />
          <DataEvidence
            label="Familias"
            value={hasParentRating ? formatRating(parentRating) : "Sin reseñas"}
            context={hasParentRating ? `${school.rating.count} reseñas` : "Sin muestra suficiente"}
          />
          {!isCompact ? (
            <DataEvidence label="Alumnos" value={school.studentsCount ?? "No informado"} context="Matrícula estimada" />
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            onClick={() => {
              trackEvent("school_profile_opened", {
                source: "search_card",
                schoolSlug: school.slug,
                variant
              });
            }}
          >
            <Link href={schoolProfilePath as never}>Ver perfil completo</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            onClick={() => {
              trackEvent("school_compare_clicked", {
                source: "search_card",
                schoolSlug: school.slug,
                variant
              });
            }}
          >
            <Link href={((compareHref ?? `/compare?schools=${school.slug}`) as never)}>{compareButtonLabel}</Link>
          </Button>
          {showSaveButton ? <SaveSchoolButton schoolId={school.id} schoolSlug={school.slug} /> : null}
        </div>
      </div>
    </Card>
  );
}
