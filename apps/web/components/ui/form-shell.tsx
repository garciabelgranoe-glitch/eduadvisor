import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FormShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormShell({ title, description, children, className }: FormShellProps) {
  return (
    <Card className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h2 className="font-display text-3xl text-ink">{title}</h2>
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      </div>
      {children}
    </Card>
  );
}

