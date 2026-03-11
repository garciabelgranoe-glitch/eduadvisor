import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "ea-focus-ring h-11 w-full rounded-xl border border-brand-100 bg-white px-3 text-sm text-ink outline-none transition focus:border-brand-500",
        className
      )}
      {...props}
    />
  );
}
