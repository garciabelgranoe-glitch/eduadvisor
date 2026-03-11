"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface StickyDecisionAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
}

interface StickyDecisionCtaProps {
  title?: string;
  primary: StickyDecisionAction;
  secondary?: StickyDecisionAction;
}

export function StickyDecisionCta({
  title = "Siguiente paso",
  primary,
  secondary
}: StickyDecisionCtaProps) {
  return (
    <aside className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-brand-100 bg-white/95 p-3 shadow-[0_18px_44px_rgba(13,27,31,0.2)] backdrop-blur md:hidden">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {secondary ? (
          <Button asChild variant={secondary.variant ?? "ghost"} className="w-full" onClick={secondary.onClick}>
            <Link href={secondary.href as never}>{secondary.label}</Link>
          </Button>
        ) : (
          <div />
        )}
        <Button asChild variant={primary.variant ?? "primary"} className="w-full" onClick={primary.onClick}>
          <Link href={primary.href as never}>{primary.label}</Link>
        </Button>
      </div>
    </aside>
  );
}

