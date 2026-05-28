import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricTone = "default" | "positive" | "warning" | "urgent";

interface MetricTileProps {
  label: string;
  value: string;
  delta?: string;
  tone?: MetricTone;
  size?: "default" | "lg";
  hint?: string;
}

const toneStyles: Record<MetricTone, string> = {
  default: "border-brand-100",
  positive: "border-emerald-200 bg-emerald-50/60",
  warning: "border-amber-200 bg-amber-50/60",
  urgent: "border-red-200 bg-red-50/60"
};

const valueStyles: Record<MetricTone, string> = {
  default: "text-ink",
  positive: "text-emerald-800",
  warning: "text-amber-800",
  urgent: "text-red-700"
};

export function MetricTile({ label, value, delta, tone = "default", size = "default", hint }: MetricTileProps) {
  return (
    <Card className={cn("space-y-1", toneStyles[tone])}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className={cn("font-bold leading-none", size === "lg" ? "text-4xl" : "text-3xl", valueStyles[tone])}>
        {value}
      </p>
      {delta && <p className="text-xs font-semibold text-brand-700">{delta}</p>}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </Card>
  );
}
