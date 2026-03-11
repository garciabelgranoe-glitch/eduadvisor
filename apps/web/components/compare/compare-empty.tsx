import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureState } from "@/components/ui/feature-state";

export function CompareEmpty() {
  return (
    <FeatureState
      title="Todavía no hay colegios para comparar"
      description='Agregá colegios desde búsqueda o desde cada perfil usando el botón "Comparar".'
      actionSlot={
        <Button asChild>
          <Link href="/search">Ir a buscar colegios</Link>
        </Button>
      }
    />
  );
}
