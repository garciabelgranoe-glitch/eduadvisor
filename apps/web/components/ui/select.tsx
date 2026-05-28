import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative w-full">
      <select
        className={cn(
          "ea-focus-ring h-11 w-full cursor-pointer appearance-none rounded-xl border border-brand-100 bg-white py-0 pl-3 pr-9 text-sm font-medium text-ink outline-none transition",
          "hover:border-brand-300 focus:border-brand-500",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {/* Custom chevron */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
