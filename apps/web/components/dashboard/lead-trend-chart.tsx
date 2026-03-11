import { Card } from "@/components/ui/card";

interface LeadTrendChartProps {
  trend: Array<{
    month: string;
    leads: number;
  }>;
}

export function LeadTrendChart({ trend }: LeadTrendChartProps) {
  const max = Math.max(...trend.map((item) => item.leads), 1);

  return (
    <Card className="space-y-3">
      <h3 className="text-lg font-semibold text-ink">Tendencia de leads (6 meses)</h3>
      <div className="space-y-2">
        {trend.map((item) => (
          <div key={item.month} className="grid grid-cols-[80px_1fr_40px] items-center gap-3 text-sm">
            <span className="text-slate-600">{item.month}</span>
            <div className="h-3 rounded-full bg-brand-50">
              <div
                className="h-3 rounded-full bg-brand-700"
                style={{ width: `${Math.max((item.leads / max) * 100, item.leads > 0 ? 8 : 0)}%` }}
              />
            </div>
            <span className="text-right font-medium text-ink">{item.leads}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
