"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";

const MP_MENSUAL = "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=5e56b9e1deb84722968c3b45935ab1f1";
const MP_ANUAL = "https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=c733e3511c5f408c94d46756a7024d1f";

type PremiumUpgradeSurface = "school_profile" | "school_dashboard";

interface PremiumUpgradeHighlightProps {
  schoolName: string;
  schoolSlug: string;
  schoolId?: string;
  canClaimProfile: boolean;
  surface: PremiumUpgradeSurface;
}

export function PremiumUpgradeHighlight({
  schoolName,
  schoolSlug,
  canClaimProfile,
  surface
}: PremiumUpgradeHighlightProps) {
  const claimHref = `/para-colegios?flow=claim&school=${encodeURIComponent(schoolSlug)}`;

  if (canClaimProfile) {
    return (
      <Card className="space-y-4 border-brand-200 bg-gradient-to-br from-white via-brand-50/50 to-amber-50/70">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Activación comercial</p>
          <h3 className="text-xl font-semibold text-ink">Reclamá el perfil de {schoolName}</h3>
          <p className="text-sm text-slate-700">
            Primero reclamá la titularidad del perfil. Una vez verificado podés activar el plan Premium.
          </p>
        </div>
        <Button asChild>
          <Link
            href={claimHref as never}
            onClick={() => trackEvent("premium_upgrade_cta_clicked", { source: surface, schoolSlug, action: "claim" })}
          >
            Reclamar perfil →
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="space-y-5 border-brand-200 bg-gradient-to-br from-white via-brand-50/50 to-amber-50/70">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Plan Premium</p>
        <h3 className="text-xl font-semibold text-ink">Desbloqueá el perfil premium de {schoolName}</h3>
        <p className="text-sm text-slate-700">
          Aparecé primero en los resultados, recibí consultas de familias y mostrá fotos institucionales.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-brand-100 bg-white/90 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Visibilidad</p>
          <p className="mt-1 text-sm font-semibold text-ink">Primero en resultados de tu ciudad</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white/90 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Conversión</p>
          <p className="mt-1 text-sm font-semibold text-ink">Recibí consultas de familias interesadas</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white/90 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Marca</p>
          <p className="mt-1 text-sm font-semibold text-ink">Logo, galería y video institucional</p>
        </div>
      </div>

      {/* Planes */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Mensual */}
        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Plan mensual</p>
            <p className="mt-1 text-2xl font-semibold text-ink">$20.000 <span className="text-sm font-normal text-slate-500">/ mes</span></p>
            <p className="text-xs text-slate-400">Cancelá cuando quieras</p>
          </div>
          <Button asChild variant="secondary" className="w-full">
            <a
              href={MP_MENSUAL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("premium_upgrade_cta_clicked", { source: surface, schoolSlug, action: "upgrade_mensual" })}
            >
              Suscribirse mensual →
            </a>
          </Button>
        </div>

        {/* Anual */}
        <div className="rounded-xl border-2 border-brand-400 bg-white/90 p-4 space-y-3 relative">
          <span className="absolute -top-3 left-4 rounded-full bg-brand-700 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            Mejor precio
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Plan anual</p>
            <p className="mt-1 text-2xl font-semibold text-ink">$175.000 <span className="text-sm font-normal text-slate-500">/ año</span></p>
            <p className="text-xs text-brand-700 font-medium">Ahorrás $65.000 vs mensual</p>
          </div>
          <Button asChild className="w-full">
            <a
              href={MP_ANUAL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("premium_upgrade_cta_clicked", { source: surface, schoolSlug, action: "upgrade_anual" })}
            >
              Suscribirse anual →
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}
