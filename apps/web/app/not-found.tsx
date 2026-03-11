import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-2xl py-16">
      <Card className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">404</p>
        <h1 className="font-display text-4xl text-ink">No encontramos esa página</h1>
        <p className="text-sm text-slate-600">Puede que el colegio haya cambiado su URL o ya no esté publicado.</p>
        <div>
          <Button asChild>
            <Link href="/search">Volver a buscar colegios</Link>
          </Button>
        </div>
      </Card>
    </section>
  );
}
