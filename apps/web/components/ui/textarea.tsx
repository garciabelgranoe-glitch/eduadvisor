import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "ea-focus-ring min-h-28 w-full rounded-xl border border-brand-100 bg-white p-3 text-sm text-ink outline-none transition focus:border-brand-500",
        className
      )}
      {...props}
    />
  );
}

