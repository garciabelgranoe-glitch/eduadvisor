import { ClaimRequestsQueue } from "@/components/admin/claim-requests-queue";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormShell } from "@/components/ui/form-shell";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getAdminClaimRequests } from "@/lib/api";
import { pickParam, type RawSearchParams } from "@/lib/query-params";

export const dynamic = "force-dynamic";

interface AdminClaimsPageProps {
  searchParams?: RawSearchParams;
}

type ClaimStatusFilter = "all" | "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
type ClaimTypeFilter = "all" | "CLAIM" | "PUBLISH";

function parseClaimStatusFilter(value: string | null | undefined): ClaimStatusFilter {
  if (value === "PENDING" || value === "UNDER_REVIEW" || value === "APPROVED" || value === "REJECTED") {
    return value;
  }

  return "all";
}

function parseClaimTypeFilter(value: string | null | undefined): ClaimTypeFilter {
  if (value === "CLAIM" || value === "PUBLISH") {
    return value;
  }

  return "all";
}

export default async function AdminClaimsPage({ searchParams }: AdminClaimsPageProps) {
  const q = pickParam(searchParams?.q) ?? "";
  const status = parseClaimStatusFilter(pickParam(searchParams?.status));
  const requestType = parseClaimTypeFilter(pickParam(searchParams?.requestType));

  const response = await getAdminClaimRequests({
    q: q || undefined,
    status: status === "all" ? undefined : status,
    requestType: requestType === "all" ? undefined : requestType,
    limit: "50",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  return (
    <div className="space-y-4">
      <FormShell title="Filtrar claims" description="Buscá solicitudes por colegio, estado o tipo de pedido.">
        <form className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr_auto]" action="/admin/claims" method="get">
          <FormField label="Búsqueda" className="md:col-span-1">
            <Input name="q" defaultValue={q} placeholder="Buscar por colegio, ciudad o representante" />
          </FormField>
          <FormField label="Estado">
            <Select name="status" defaultValue={status}>
              <option value="all">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="UNDER_REVIEW">En revisión</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
            </Select>
          </FormField>
          <FormField label="Tipo de solicitud">
            <Select name="requestType" defaultValue={requestType}>
              <option value="all">Todos los tipos</option>
              <option value="CLAIM">Claim de perfil</option>
              <option value="PUBLISH">Publicación nueva</option>
            </Select>
          </FormField>
          <div className="flex items-end">
            <Button type="submit" className="w-full md:w-auto">
              Filtrar
            </Button>
          </div>
        </form>
      </FormShell>

      <ClaimRequestsQueue items={response.items} statusFilter={status} />
    </div>
  );
}
