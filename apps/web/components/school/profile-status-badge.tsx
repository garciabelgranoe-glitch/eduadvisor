import { Badge } from "@/components/ui/badge";
import type { SchoolProfileBadge } from "@/lib/api";

interface ProfileStatusBadgeProps {
  profile?: SchoolProfileBadge | null;
}

const toneClass: Record<SchoolProfileBadge["tone"], string> = {
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
  info: "border-sky-200 bg-sky-100 text-sky-700",
  success: "border-emerald-200 bg-emerald-100 text-emerald-700",
  warning: "border-amber-300 bg-amber-100 text-amber-800"
};

export function ProfileStatusBadge({ profile }: ProfileStatusBadgeProps) {
  if (!profile) {
    return <Badge className={toneClass.neutral}>Perfil no verificado</Badge>;
  }

  return <Badge className={toneClass[profile.tone] ?? toneClass.neutral}>{profile.label}</Badge>;
}
