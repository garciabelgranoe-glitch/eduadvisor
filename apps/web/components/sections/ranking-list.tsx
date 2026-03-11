import Link from "next/link";
import { Card } from "@/components/ui/card";

interface RankingItem {
  city: string;
  topScore: number;
  schools: number;
  path?: string;
}

interface RankingListProps {
  items: RankingItem[];
}

export function RankingList({ items }: RankingListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item, index) => (
        <div key={`${item.city}-${index}`} id={`item-${index + 1}`}>
          {item.path ? (
            <Link href={item.path as never}>
              <Card className="group space-y-2 border-brand-200 transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(13,27,31,0.12)]">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">#{index + 1} ciudad destacada</p>
                <p className="text-2xl font-semibold text-ink">{item.city}</p>
                <p className="text-sm text-slate-600">Score lider: {item.topScore}</p>
                <p className="text-sm text-slate-600">Colegios evaluados: {item.schools}</p>
                <p className="pt-1 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
                  Ver ranking de {item.city} →
                </p>
              </Card>
            </Link>
          ) : (
            <Card className="space-y-2 border-brand-200">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">#{index + 1} ciudad destacada</p>
              <p className="text-2xl font-semibold text-ink">{item.city}</p>
              <p className="text-sm text-slate-600">Score lider: {item.topScore}</p>
              <p className="text-sm text-slate-600">Colegios evaluados: {item.schools}</p>
            </Card>
          )}
        </div>
      ))}
    </div>
  );
}
