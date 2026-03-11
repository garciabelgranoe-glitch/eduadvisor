"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";

type PremiumUpgradeSurface = "school_profile" | "school_dashboard";

interface PremiumUpgradeHighlightProps {
  schoolName: string;
  schoolSlug: string;
  schoolId?: string;
  canClaimProfile: boolean;
  surface: PremiumUpgradeSurface;
}

function buildCheckoutHref(schoolId: string, schoolSlug: string) {
  return `/api/schools/billing/checkout?schoolId=${encodeURIComponent(schoolId)}&school=${encodeURIComponent(schoolSlug)}`;
}

export function PremiumUpgradeHighlight({
  schoolName,
  schoolSlug,
  schoolId,
  canClaimProfile,
  surface
}: PremiumUpgradeHighlightProps) {
  const primaryHref = canClaimProfile
    ? `/para-colegios?flow=claim&school=${encodeURIComponent(schoolSlug)}`
    : schoolId
      ? buildCheckoutHref(schoolId, schoolSlug)
      : `/para-colegios?school=${encodeURIComponent(schoolSlug)}`;

  const primaryLabel = canClaimProfile ? "Reclamar perfil y activar premium" : "Activar premium ahora";

  return (
    <Card className="space-y-4 border-brand-200 bg-gradient-to-br from-white via-brand-50/50 to-amber-50/70">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Activación comercial</p>
        <h3 className="text-xl font-semibold text-ink">Desbloqueá el perfil premium de {schoolName}</h3>
        <p className="text-sm text-slate-700">
          El modo premium activa contacto por matrícula, logo y galería institucional, y mejora visibilidad en
          resultados y rankings.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-brand-100 bg-white/90 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Visibilidad</p>
          <p className="mt-1 text-sm font-semibold text-ink">Mayor exposición frente a familias</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white/90 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Conversión</p>
          <p className="mt-1 text-sm font-semibold text-ink">Formulario de matrícula activo</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white/90 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Marca</p>
          <p className="mt-1 text-sm font-semibold text-ink">Logo e imágenes institucionales</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link
            href={primaryHref as never}
            onClick={() =>
              trackEvent("premium_upgrade_cta_clicked", {
                source: surface,
                schoolSlug,
                action: canClaimProfile ? "claim_and_upgrade" : "upgrade"
              })
            }
          >
            {primaryLabel}
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link
            href={`/para-colegios?school=${encodeURIComponent(schoolSlug)}` as never}
            onClick={() =>
              trackEvent("premium_upgrade_info_clicked", {
                source: surface,
                schoolSlug
              })
            }
          >
            Ver beneficios del plan
          </Link>
        </Button>
      </div>
    </Card>
  );
}
