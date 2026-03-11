import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "ea-focus-ring h-11 w-full rounded-xl border border-brand-100 bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-500",
        className
      )}
      {...props}
    />
  );
}

