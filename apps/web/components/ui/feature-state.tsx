import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FeatureStateTone = "neutral" | "warning" | "danger" | "success";

interface FeatureStateProps {
  title: string;
  description: string;
  tone?: FeatureStateTone;
  actionLabel?: string;
  actionHref?: string;
  actionSlot?: ReactNode;
  className?: string;
}

const toneStyles: Record<FeatureStateTone, string> = {
  neutral: "border-brand-100 bg-white/90",
  warning: "border-amber-200 bg-amber-50/70",
  danger: "border-red-200 bg-red-50/70",
  success: "border-emerald-200 bg-emerald-50/70"
};

export function FeatureState({
  title,
  description,
  tone = "neutral",
  actionLabel,
  actionHref,
  actionSlot,
  className
}: FeatureStateProps) {
  return (
    <Card className={cn("space-y-3", toneStyles[tone], className)}>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
      {actionSlot}
      {!actionSlot && actionHref && actionLabel ? (
        <Button asChild>
          <Link href={actionHref as never}>{actionLabel}</Link>
        </Button>
      ) : null}
    </Card>
  );
}
