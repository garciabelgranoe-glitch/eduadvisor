import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "soft" | "warning" | "danger";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
};

const toneStyles: Record<Tone, string> = {
  default: "border-brand-100 bg-white/90",
  soft: "border-brand-100 bg-brand-50/60",
  warning: "border-amber-200 bg-amber-50/70",
  danger: "border-red-200 bg-red-50/70"
};

export function Card({ className, tone = "default", ...props }: CardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border p-5 shadow-[0_8px_24px_rgba(13,27,31,0.06)] backdrop-blur",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
