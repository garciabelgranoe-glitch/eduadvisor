"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import type { LeadItem } from "@/lib/api";

interface LeadPipelineBoardProps {
  initialLeads: LeadItem[];
  schoolId: string;
  canManageLeads: boolean;
}

const COLUMNS: {
  status: LeadItem["status"];
  label: string;
  dot: string;
  bg: string;
  border: string;
  badge: string;
}[] = [
  {
    status: "NEW",
    label: "Nuevos",
    dot: "bg-slate-400",
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-600"
  },
  {
    status: "CONTACTED",
    label: "Contactados",
    dot: "bg-blue-400",
    bg: "bg-blue-50/60",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700"
  },
  {
    status: "QUALIFIED",
    label: "Calificados",
    dot: "bg-amber-400",
    bg: "bg-amber-50/60",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700"
  },
  {
    status: "CLOSED",
    label: "Cerrados",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50/60",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700"
  }
];

const LEVEL_LABEL: Record<string, string> = {
  INICIAL: "Inicial",
  PRIMARIA: "Primaria",
  SECUNDARIA: "Secundaria",
  SUPERIOR: "Superior",
  MATERNAL: "Maternal"
};

const NEXT_STATUS: Partial<Record<LeadItem["status"], LeadItem["status"]>> = {
  NEW: "CONTACTED",
  CONTACTED: "QUALIFIED",
  QUALIFIED: "CLOSED"
};

const NEXT_LABEL: Partial<Record<LeadItem["status"], string>> = {
  NEW: "Marcar contactado →",
  CONTACTED: "Calificar →",
  QUALIFIED: "Cerrar lead →"
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

function LeadCard({
  lead,
  canManage,
  loading,
  onAdvance
}: {
  lead: LeadItem;
  canManage: boolean;
  loading: boolean;
  onAdvance: (id: string, status: LeadItem["status"]) => void;
}) {
  const next = NEXT_STATUS[lead.status];
  const nextLabel = NEXT_LABEL[lead.status];

  return (
    <div className="rounded-xl border border-white bg-white p-3 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-ink leading-tight">{lead.parentName}</p>
        <span className="shrink-0 text-[10px] text-slate-400">{formatDate(lead.createdAt)}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">
          {LEVEL_LABEL[lead.educationLevel] ?? lead.educationLevel}
        </span>
        <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">
          {lead.childAge} años
        </span>
      </div>
      <div className="space-y-0.5 text-[11px] text-slate-500">
        <p className="truncate">{lead.email}</p>
        <p>{lead.phone}</p>
      </div>
      {canManage && next && nextLabel && (
        <button
          disabled={loading}
          onClick={() => onAdvance(lead.id, next)}
          className="w-full rounded-lg border border-brand-100 bg-brand-50 py-1.5 text-[11px] font-semibold text-brand-700 transition hover:bg-brand-100 disabled:opacity-50"
        >
          {loading ? "Actualizando..." : nextLabel}
        </button>
      )}
    </div>
  );
}

export function LeadPipelineBoard({ initialLeads, schoolId, canManageLeads }: LeadPipelineBoardProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const byColumn = useMemo(() => {
    const map = new Map<LeadItem["status"], LeadItem[]>();
    for (const col of COLUMNS) map.set(col.status, []);
    for (const lead of leads) {
      map.get(lead.status)?.push(lead);
    }
    // Orden descendente por fecha dentro de cada columna
    for (const [, items] of map) {
      items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return map;
  }, [leads]);

  async function advanceLead(leadId: string, newStatus: LeadItem["status"]) {
    if (!canManageLeads) return;
    setLoadingIds((prev) => new Set(prev).add(leadId));
    setErrorMessage(null);

    try {
      const response = await fetch("/api/leads/status", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus, schoolId })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setErrorMessage(payload?.message ?? "No se pudo actualizar el lead.");
        return;
      }

      setLeads((current) =>
        current.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
      );
    } catch {
      setErrorMessage("Error de conexión. Intentá nuevamente.");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(leadId);
        return next;
      });
    }
  }

  if (leads.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="text-3xl">📭</span>
        <p className="font-semibold text-ink">Todavía no hay leads</p>
        <p className="max-w-xs text-sm text-slate-500">
          Cuando una familia complete el formulario de contacto de tu perfil, aparecerá acá para que puedas hacer el seguimiento.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {!canManageLeads && (
        <Card tone="warning" className="text-sm">
          ⚠️ Gestión de leads bloqueada — se habilita para colegios VERIFIED o PREMIUM.
        </Card>
      )}

      {errorMessage && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {/* Resumen rápido */}
      <div className="grid grid-cols-4 gap-2">
        {COLUMNS.map((col) => {
          const count = byColumn.get(col.status)?.length ?? 0;
          return (
            <div key={col.status} className={`rounded-xl border ${col.border} ${col.bg} px-3 py-2 text-center`}>
              <p className="text-xl font-bold text-ink">{count}</p>
              <p className="text-[11px] text-slate-500">{col.label}</p>
            </div>
          );
        })}
      </div>

      {/* Board kanban — scroll horizontal en mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const items = byColumn.get(col.status) ?? [];
          return (
            <div
              key={col.status}
              className={`flex min-w-[220px] flex-1 flex-col gap-2 rounded-2xl border ${col.border} ${col.bg} p-3`}
            >
              {/* Header columna */}
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {col.label}
                </span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${col.badge}`}>
                  {items.length}
                </span>
              </div>

              {/* Cards de leads */}
              {items.length === 0 ? (
                <p className="py-4 text-center text-[11px] text-slate-400">Sin leads</p>
              ) : (
                items.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    canManage={canManageLeads}
                    loading={loadingIds.has(lead.id)}
                    onAdvance={advanceLead}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
