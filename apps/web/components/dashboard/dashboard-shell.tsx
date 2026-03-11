import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface DashboardShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function DashboardShell({ title, subtitle, children }: DashboardShellProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Centro de control</p>
        <h1 className="font-display text-4xl text-ink">{title}</h1>
        <p className="max-w-2xl text-slate-600">{subtitle}</p>
      </header>
      <Card className="bg-gradient-to-r from-brand-50 to-white">{children}</Card>
    </section>
  );
}
