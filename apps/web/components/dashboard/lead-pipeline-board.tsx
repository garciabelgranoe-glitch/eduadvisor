"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { LeadItem } from "@/lib/api";
import { formatDateTimeUtc } from "@/lib/format";

interface LeadPipelineBoardProps {
  initialLeads: LeadItem[];
  schoolId: string;
  canManageLeads: boolean;
}

export function LeadPipelineBoard({ initialLeads, schoolId, canManageLeads }: LeadPipelineBoardProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const orderedLeads = useMemo(
    () => [...leads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [leads]
  );

  async function changeStatus(leadId: string, status: LeadItem["status"]) {
    if (!canManageLeads) {
      return;
    }
    setLoadingId(leadId);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/leads/status", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ leadId, status, schoolId })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setErrorMessage(payload?.message ?? "No se pudo actualizar el estado del lead");
        return;
      }

      setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)));
    } catch {
      setErrorMessage("No se pudo conectar con el backend de leads.");
    } finally {
      setLoadingId(null);
    }
  }

  if (orderedLeads.length === 0) {
    return <Card className="text-sm text-slate-600">No hay leads cargados para este colegio.</Card>;
  }

  return (
    <div className="space-y-3">
      {!canManageLeads ? (
        <Card className="text-sm text-slate-600">
          Gestión de leads bloqueada. Esta función se habilita para colegios VERIFIED o PREMIUM.
        </Card>
      ) : null}
      {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
      {orderedLeads.map((lead) => (
        <Card key={lead.id} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-ink">{lead.parentName}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                {lead.educationLevel} · {lead.childAge} años
              </p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
              {lead.status}
            </span>
          </div>

          <div className="grid gap-1 text-sm text-slate-600 md:grid-cols-2">
            <p>Email: {lead.email}</p>
            <p>Teléfono: {lead.phone}</p>
            <p>Creado: {formatDateTimeUtc(lead.createdAt)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!canManageLeads || loadingId === lead.id}
              onClick={() => changeStatus(lead.id, "CONTACTED")}
              variant="ghost"
            >
              Contactado
            </Button>
            <Button
              disabled={!canManageLeads || loadingId === lead.id}
              onClick={() => changeStatus(lead.id, "QUALIFIED")}
              variant="secondary"
            >
              Calificado
            </Button>
            <Button disabled={!canManageLeads || loadingId === lead.id} onClick={() => changeStatus(lead.id, "CLOSED")}>
              Cerrar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
