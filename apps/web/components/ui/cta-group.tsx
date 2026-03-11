import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CtaGroupProps {
  primary: ReactNode;
  secondary?: ReactNode;
  tertiary?: ReactNode;
  helperText?: string;
  className?: string;
}

export function CtaGroup({ primary, secondary, tertiary, helperText, className }: CtaGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {primary}
        {secondary}
        {tertiary}
      </div>
      {helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}

