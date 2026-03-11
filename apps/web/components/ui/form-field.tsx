import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({ label, hint, className, children }: FormFieldProps) {
  return (
    <label className={cn("block text-sm text-slate-700", className)}>
      <span className="font-medium">{label}</span>
      <div className="mt-1">{children}</div>
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

