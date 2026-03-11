"use client";

import { Badge } from "@/components/ui/badge";
import type { SchoolProfileStatus } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

interface TrustStripProps {
  profileStatus: SchoolProfileStatus;
  profileLabel: string;
  verifiedAt?: string | null;
  updatedAt?: string | null;
  sourceLabel?: string;
  methodologyHref?: string;
  compact?: boolean;
  className?: string;
}

function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function profileTrustLabel(profileStatus: SchoolProfileStatus) {
  if (profileStatus === "PREMIUM") {
    return "Perfil premium verificado";
  }

  if (profileStatus === "VERIFIED") {
    return "Perfil verificado";
  }

  if (profileStatus === "CURATED") {
    return "Perfil curado por EduAdvisor";
  }

  return "Perfil en consolidación";
}

export function TrustStrip({
  profileStatus,
  profileLabel,
  verifiedAt,
  updatedAt,
  sourceLabel = "Google + datos institucionales",
  methodologyHref = "/market-insights",
  compact = false,
  className
}: TrustStripProps) {
  const verifiedLabel = formatShortDate(verifiedAt);
  const updatedLabel = formatShortDate(updatedAt);

  return (
    <div
      className={`rounded-xl border border-brand-100 bg-white/80 px-3 py-2 text-[11px] text-slate-600 ${className ?? ""}`}
    >
      <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "justify-between"}`}>
        <Badge className="border-brand-200 bg-brand-50 text-brand-800">{profileLabel}</Badge>
        <span className="font-medium text-slate-700">{profileTrustLabel(profileStatus)}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>Fuente: {sourceLabel}</span>
        <span>Actualización: {updatedLabel ?? "sin fecha"}</span>
        <span>Verificación: {verifiedLabel ?? "pendiente"}</span>
        <a
          href={methodologyHref}
          onClick={() =>
            trackEvent("trust_methodology_opened", {
              source: "trust_strip",
              profileStatus
            })
          }
          className="font-semibold text-brand-700 underline decoration-brand-200 underline-offset-2"
        >
          Ver metodología
        </a>
      </div>
    </div>
  );
}
