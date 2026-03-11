import type { ReactNode } from "react";

interface DataEvidenceProps {
  label: string;
  value: ReactNode;
  context?: string;
  tone?: "default" | "positive" | "warning";
  className?: string;
}

const toneClass: Record<NonNullable<DataEvidenceProps["tone"]>, string> = {
  default: "border-brand-100 bg-paper text-ink",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900"
};

export function DataEvidence({ label, value, context, tone = "default", className }: DataEvidenceProps) {
  return (
    <article className={`rounded-xl border px-3 py-2 ${toneClass[tone]} ${className ?? ""}`}>
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
      {context ? <p className="mt-1 text-xs text-slate-500">{context}</p> : null}
    </article>
  );
}

