import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SchoolCardData } from "@/lib/mock-data";

interface SchoolCardProps {
  school: SchoolCardData;
}

export function SchoolCard({ school }: SchoolCardProps) {
  return (
    <Card className="space-y-4 animate-rise">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-ink">{school.name}</h3>
          <p className="text-sm text-slate-600">{school.city}</p>
        </div>
        <div className="rounded-xl bg-brand-900 px-3 py-2 text-right text-white">
          <p className="text-xs uppercase tracking-[0.14em]">Score</p>
          <p className="text-lg font-semibold">{school.eduAdvisorScore}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {school.levels.map((level) => (
          <Badge key={level}>{level}</Badge>
        ))}
      </div>

      <ul className="space-y-1 text-sm text-slate-600">
        {school.highlights.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-3 rounded-xl bg-paper p-3 text-sm">
        <p>
          Cuota estimada: <span className="font-semibold">${school.monthlyFee.toLocaleString("es-AR")}</span>
        </p>
        <p>
          Rating: <span className="font-semibold">{school.rating}</span> ({school.reviewCount} reviews)
        </p>
        <p>
          Distancia: <span className="font-semibold">{school.distanceKm} km</span>
        </p>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1">Ver perfil</Button>
        <Button variant="ghost" className="flex-1">
          Comparar
        </Button>
      </div>
    </Card>
  );
}
