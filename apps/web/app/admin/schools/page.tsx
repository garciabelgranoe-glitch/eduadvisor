import { AdminSchoolsTable } from "@/components/admin/admin-schools-table";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormShell } from "@/components/ui/form-shell";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getAdminSchools } from "@/lib/api";
import { pickParam, type RawSearchParams } from "@/lib/query-params";

export const dynamic = "force-dynamic";

interface AdminSchoolsPageProps {
  searchParams?: RawSearchParams;
}

export default async function AdminSchoolsPage({ searchParams }: AdminSchoolsPageProps) {
  const q = pickParam(searchParams?.q) ?? "";
  const status = (pickParam(searchParams?.status) as "all" | "active" | "inactive" | undefined) ?? "all";

  const response = await getAdminSchools({
    q: q || undefined,
    status,
    limit: "50",
    sortBy: "name",
    sortOrder: "asc"
  });

  return (
    <div className="space-y-4">
      <FormShell title="Filtrar colegios" description="Encontrá colegios por nombre, slug, ciudad o estado.">
        <form className="grid gap-3 md:grid-cols-[1.5fr_1fr_auto]" action="/admin/schools" method="get">
          <FormField label="Búsqueda">
            <Input name="q" defaultValue={q} placeholder="Buscar por nombre, slug o ciudad" />
          </FormField>
          <FormField label="Estado">
            <Select name="status" defaultValue={status}>
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </Select>
          </FormField>
          <div className="flex items-end">
            <Button type="submit" className="w-full md:w-auto">
              Filtrar
            </Button>
          </div>
        </form>
      </FormShell>

      <AdminSchoolsTable items={response.items} />
    </div>
  );
}
