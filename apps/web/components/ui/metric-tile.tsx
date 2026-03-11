import { Card } from "@/components/ui/card";

interface MetricTileProps {
  label: string;
  value: string;
  delta?: string;
}

export function MetricTile({ label, value, delta }: MetricTileProps) {
  return (
    <Card className="space-y-2">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="text-3xl font-semibold text-ink">{value}</p>
      {delta ? <p className="text-sm text-brand-700">{delta}</p> : null}
    </Card>
  );
}
