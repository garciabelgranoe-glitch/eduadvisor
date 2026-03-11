import { Card } from "@/components/ui/card";

interface Activity {
  title: string;
  detail: string;
  time: string;
}

interface RecentActivityProps {
  items: Activity[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-ink">Actividad reciente</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={`${item.title}-${item.time}`} className="rounded-xl border border-brand-100 p-3">
            <p className="font-medium text-ink">{item.title}</p>
            <p className="text-sm text-slate-600">{item.detail}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{item.time}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
