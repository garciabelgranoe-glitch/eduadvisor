"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="space-y-4">
      <Card className="space-y-2 border-amber-200 bg-amber-50/70">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Panel administrador</p>
        <h1 className="font-display text-3xl text-ink">No se pudo renderizar el panel de administración</h1>
        <p className="text-sm text-amber-900">Vuelve a intentar. Si persiste, validamos credenciales y estado de API.</p>
      </Card>
      <Button type="button" onClick={reset}>
        Reintentar panel admin
      </Button>
    </section>
  );
}
