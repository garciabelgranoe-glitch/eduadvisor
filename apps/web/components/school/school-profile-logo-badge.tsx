import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface SchoolProfileLogoBadgeProps {
  schoolName: string;
  schoolSlug: string;
  isPremium: boolean;
  canClaimProfile: boolean;
  logoUrl?: string | null;
}

function buildInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 0) {
    return "EA";
  }

  return words.map((word) => word[0]?.toUpperCase() ?? "").join("");
}

export function SchoolProfileLogoBadge({
  schoolName,
  schoolSlug,
  isPremium,
  canClaimProfile,
  logoUrl
}: SchoolProfileLogoBadgeProps) {
  if (isPremium) {
    return (
      <div className="shrink-0 rounded-2xl border border-brand-100 bg-white/85 p-3 text-center shadow-sm backdrop-blur">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`Logo de ${schoolName}`}
            width={64}
            height={64}
            className="mx-auto h-16 w-16 rounded-xl border border-brand-200 bg-white object-cover shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-brand-200 bg-gradient-to-br from-white to-brand-50 text-sm font-semibold text-brand-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            {buildInitials(schoolName)}
          </div>
        )}
      </div>
    );
  }

  const upgradeHref = canClaimProfile
    ? `/para-colegios?flow=claim&school=${encodeURIComponent(schoolSlug)}`
    : `/para-colegios?school=${encodeURIComponent(schoolSlug)}`;

  return (
    <div className="shrink-0 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/70 p-3 text-center shadow-[0_8px_20px_rgba(146,92,36,0.08)]">
      <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-xl border border-brand-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.95),rgba(241,245,249,0.9))]" />
        <div className="absolute inset-0 blur-[1.8px]">
          <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">{buildInitials(schoolName)}</div>
        </div>
        <div className="absolute right-1.5 top-1.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-700">
          Pro
        </div>
      </div>

      <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">Logo institucional</p>
      <p className="mt-1 text-xs text-slate-600">Disponible en plan premium</p>
      <Button
        asChild
        variant="ghost"
        className="mt-2 h-8 rounded-lg border-amber-200 bg-white/90 px-3 text-xs font-semibold text-amber-800 hover:bg-amber-50"
      >
        <Link href={upgradeHref as never}>Activar premium</Link>
      </Button>
    </div>
  );
}
