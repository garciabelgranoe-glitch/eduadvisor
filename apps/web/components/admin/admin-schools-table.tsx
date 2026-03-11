"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AdminSchoolItem } from "@/lib/api";

interface AdminSchoolsTableProps {
  items: AdminSchoolItem[];
}

export function AdminSchoolsTable({ items }: AdminSchoolsTableProps) {
  const [rows, setRows] = useState(items);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function toggleSchoolStatus(schoolId: string, active: boolean) {
    setLoadingId(schoolId);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/schools/status", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ schoolId, active })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setErrorMessage(payload?.message ?? "No se pudo actualizar el estado del colegio");
        return;
      }

      setRows((current) => current.map((row) => (row.id === schoolId ? { ...row, active } : row)));
    } catch {
      setErrorMessage("No se pudo conectar con el backend de administración.");
    } finally {
      setLoadingId(null);
    }
  }

  async function togglePremium(schoolId: string, isPremiumActive: boolean) {
    setLoadingId(schoolId);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/subscriptions/status", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          schoolId,
          status: isPremiumActive ? "CANCELED" : "ACTIVE",
          planCode: "premium",
          durationMonths: 12,
          priceMonthly: 99000
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setErrorMessage(payload?.message ?? "No se pudo actualizar suscripción");
        return;
      }

      const nextStatus = isPremiumActive ? "CANCELED" : "ACTIVE";
      setRows((current) =>
        current.map((row) =>
          row.id === schoolId
            ? {
                ...row,
                subscription: row.subscription
                  ? {
                      ...row.subscription,
                      status: nextStatus
                    }
                  : {
                      id: `${schoolId}-subscription`,
                      status: nextStatus,
                      planCode: "premium",
                      priceMonthly: 99000,
                      startsAt: new Date().toISOString(),
                      endsAt: null
                    },
                profileStatus: nextStatus === "ACTIVE" ? "PREMIUM" : row.profileStatus === "PREMIUM" ? "VERIFIED" : row.profileStatus
              }
            : row
        )
      );
    } catch {
      setErrorMessage("No se pudo conectar con el backend de suscripciones.");
    } finally {
      setLoadingId(null);
    }
  }

  if (rows.length === 0) {
    return <Card className="text-sm text-slate-600">No hay colegios para los filtros seleccionados.</Card>;
  }

  return (
    <div className="space-y-3">
      {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-brand-100 bg-brand-50">
            <tr>
              <th className="px-4 py-3 text-slate-500">Colegio</th>
              <th className="px-4 py-3 text-slate-500">Ubicación</th>
              <th className="px-4 py-3 text-slate-500">Plan</th>
              <th className="px-4 py-3 text-slate-500">Leads</th>
              <th className="px-4 py-3 text-slate-500">Reviews</th>
              <th className="px-4 py-3 text-slate-500">Estado</th>
              <th className="px-4 py-3 text-slate-500">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-brand-50 last:border-b-0">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink">{row.name}</p>
                  <p className="text-xs text-slate-500">/{row.slug}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {row.city}, {row.province}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  <p>{row.subscription ? row.subscription.planCode.toUpperCase() : "SIN PLAN"}</p>
                  <p className="text-xs text-slate-500">{row.subscription?.status ?? row.profileStatus ?? "-"}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{row.leadsCount}</td>
                <td className="px-4 py-3 text-slate-700">{row.reviewsCount}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      row.active ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {row.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={row.active ? "ghost" : "secondary"}
                      disabled={loadingId === row.id}
                      onClick={() => toggleSchoolStatus(row.id, !row.active)}
                    >
                      {row.active ? "Desactivar" : "Activar"}
                    </Button>
                    <Button
                      variant={row.subscription?.status === "ACTIVE" ? "ghost" : "secondary"}
                      disabled={loadingId === row.id}
                      onClick={() => togglePremium(row.id, row.subscription?.status === "ACTIVE")}
                    >
                      {row.subscription?.status === "ACTIVE" ? "Quitar Premium" : "Activar Premium"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
