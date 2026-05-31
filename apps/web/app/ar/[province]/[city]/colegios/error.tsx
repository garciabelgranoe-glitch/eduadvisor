"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CitySchoolsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CitySchoolsError({ error, reset }: CitySchoolsErrorProps) {
  useEffect(() => {
    console.error("[CitySchoolsError]", error.message, error.digest, error.stack);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-display text-2xl text-ink">Algo salió mal</h1>
      <p className="max-w-md text-sm text-slate-500">
        No pudimos cargar el listado de colegios para esta ciudad.
        {error.digest ? ` (código: ${error.digest})` : ""}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Reintentar</Button>
        <Button asChild variant="ghost">
          <Link href="/search">Ir al buscador</Link>
        </Button>
      </div>
    </div>
  );
}
