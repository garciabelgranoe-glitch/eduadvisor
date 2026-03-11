"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    // Keep a console trace for local debugging without breaking UX.
    console.error(error);
  }, [error]);

  return (
    <section className="space-y-4">
      <Card className="space-y-2 border-amber-200 bg-amber-50/70">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Recuperación de vista</p>
        <h1 className="font-display text-3xl text-ink">No pudimos renderizar esta vista</h1>
        <p className="text-sm text-amber-900">
          Ocurrió un error inesperado. Podés reintentar esta pantalla o volver al inicio.
        </p>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={reset}>
          Reintentar
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </section>
  );
}
