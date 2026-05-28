import type { ReactNode } from "react";

interface DashboardShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function DashboardShell({ title, subtitle, children }: DashboardShellProps) {
  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <p className="ea-kicker">Centro de control</p>
        <h1 className="font-display text-4xl text-ink">{title}</h1>
        <p className="max-w-2xl text-slate-600">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}
