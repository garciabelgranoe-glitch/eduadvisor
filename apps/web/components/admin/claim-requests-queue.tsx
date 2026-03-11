"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormStatus } from "@/components/ui/form-status";
import { Select } from "@/components/ui/select";
import type { AdminClaimRequestItem } from "@/lib/api";
import { formatDateTimeUtc } from "@/lib/format";

type ClaimStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
type VerificationMethod = "PHONE_OTP" | "EMAIL_DOMAIN" | "MANUAL";

interface ClaimRequestsQueueProps {
  items: AdminClaimRequestItem[];
  statusFilter?: ClaimStatus | "all";
}

function statusLabel(status: ClaimStatus) {
  if (status === "UNDER_REVIEW") return "En revisión";
  if (status === "APPROVED") return "Aprobado";
  if (status === "REJECTED") return "Rechazado";
  return "Pendiente";
}

function statusTone(status: ClaimStatus) {
  if (status === "APPROVED") return "bg-emerald-100 text-emerald-800";
  if (status === "REJECTED") return "bg-red-100 text-red-800";
  if (status === "UNDER_REVIEW") return "bg-blue-100 text-blue-800";
  return "bg-amber-100 text-amber-800";
}

function methodLabel(method: VerificationMethod) {
  if (method === "PHONE_OTP") return "Teléfono (OTP)";
  if (method === "EMAIL_DOMAIN") return "Dominio email";
  return "Manual";
}

export function ClaimRequestsQueue({ items, statusFilter = "all" }: ClaimRequestsQueueProps) {
  const [rows, setRows] = useState(items);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationMethodById, setVerificationMethodById] = useState<Record<string, VerificationMethod>>(
    () =>
      Object.fromEntries(
        items.map((item) => [item.id, item.verificationMethod ?? ("EMAIL_DOMAIN" satisfies VerificationMethod)])
      )
  );

  const visibleRows = useMemo(() => {
    if (statusFilter === "all") {
      return rows;
    }

    return rows.filter((item) => item.status === statusFilter);
  }, [rows, statusFilter]);

  async function updateStatus(claimRequestId: string, status: ClaimStatus) {
    setLoadingId(claimRequestId);
    setErrorMessage(null);

    try {
      const verificationMethod = status === "APPROVED" ? verificationMethodById[claimRequestId] : undefined;
      const response = await fetch("/api/admin/claim-requests/status", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          claimRequestId,
          status,
          verificationMethod
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setErrorMessage(payload?.message ?? "No se pudo actualizar el claim");
        return;
      }

      setRows((current) =>
        current.map((item) =>
          item.id === claimRequestId
            ? {
                ...item,
                status,
                verificationMethod: status === "APPROVED" ? verificationMethod ?? null : item.verificationMethod,
                reviewedAt: new Date().toISOString()
              }
            : item
        )
      );
    } catch {
      setErrorMessage("No se pudo conectar con administración de claims.");
    } finally {
      setLoadingId(null);
    }
  }

  if (visibleRows.length === 0) {
    return <Card className="text-sm text-slate-600">No hay claims para los filtros seleccionados.</Card>;
  }

  return (
    <div className="space-y-3">
      <FormStatus errorMessage={errorMessage} />
      {visibleRows.map((claim) => (
        <Card key={claim.id} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-ink">{claim.requestedSchool.name}</p>
              <p className="text-xs text-slate-500">
                {claim.requestedSchool.city}, {claim.requestedSchool.province} · {claim.requestType}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(claim.status)}`}>
              {statusLabel(claim.status)}
            </span>
          </div>

          <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
            <div className="space-y-1">
              <p>
                <span className="font-semibold">Representante:</span> {claim.representative?.fullName ?? "Sin dato"}
              </p>
              <p>
                <span className="font-semibold">Rol:</span> {claim.representative?.role ?? "Sin dato"}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {claim.representative?.email ?? "Sin dato"}
              </p>
              <p>
                <span className="font-semibold">Tel:</span> {claim.representative?.phone ?? "Sin dato"}
              </p>
            </div>
            <div className="space-y-1">
              <p>
                <span className="font-semibold">Perfil asociado:</span>{" "}
                {claim.school ? `${claim.school.name} (${claim.school.slug})` : "No enlazado"}
              </p>
              <p>
                <span className="font-semibold">Website:</span>{" "}
                {claim.requestedSchool.website ? (
                  <a
                    href={claim.requestedSchool.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-700 underline underline-offset-2"
                  >
                    {claim.requestedSchool.website}
                  </a>
                ) : (
                  "Sin dato"
                )}
              </p>
              <p>
                <span className="font-semibold">Solicitado:</span> {formatDateTimeUtc(claim.createdAt)}
              </p>
              <p>
                <span className="font-semibold">Verificación:</span>{" "}
                {claim.verificationMethod ? methodLabel(claim.verificationMethod) : "Pendiente"}
              </p>
            </div>
          </div>

          {claim.notes ? <p className="text-sm text-slate-600">Nota: {claim.notes}</p> : null}

          <div className="flex flex-wrap items-center gap-2">
            <FormField label="Método de verificación" className="min-w-[220px]">
              <Select
                value={verificationMethodById[claim.id] ?? "EMAIL_DOMAIN"}
                onChange={(event) =>
                  setVerificationMethodById((current) => ({
                    ...current,
                    [claim.id]: event.target.value as VerificationMethod
                  }))
                }
                className="h-10"
              >
                <option value="EMAIL_DOMAIN">Dominio email</option>
                <option value="PHONE_OTP">Teléfono OTP</option>
                <option value="MANUAL">Validación manual</option>
              </Select>
            </FormField>

            <Button
              variant="ghost"
              disabled={loadingId === claim.id || claim.status === "UNDER_REVIEW"}
              onClick={() => updateStatus(claim.id, "UNDER_REVIEW")}
            >
              Marcar en revisión
            </Button>
            <Button
              variant="secondary"
              disabled={loadingId === claim.id || claim.status === "APPROVED"}
              onClick={() => updateStatus(claim.id, "APPROVED")}
            >
              Aprobar
            </Button>
            <Button
              variant="ghost"
              disabled={loadingId === claim.id || claim.status === "REJECTED"}
              onClick={() => updateStatus(claim.id, "REJECTED")}
            >
              Rechazar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
