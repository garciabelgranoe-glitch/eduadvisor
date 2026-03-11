"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CheckoutSimulationActionsProps {
  schoolId: string;
  sessionId: string;
}

export function CheckoutSimulationActions({ schoolId, sessionId }: CheckoutSimulationActionsProps) {
  const [loadingAction, setLoadingAction] = useState<"success" | "failed" | "canceled" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function run(action: "success" | "failed" | "canceled") {
    setLoadingAction(action);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/billing/checkout/simulate", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          schoolId,
          sessionId,
          action
        })
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setErrorMessage(payload?.message ?? "No se pudo completar la simulación.");
        return;
      }

      setSuccessMessage(payload?.message ?? "Simulación completada.");
      window.setTimeout(() => window.location.reload(), 500);
    } catch {
      setErrorMessage("No se pudo conectar con el servicio de simulación.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button disabled={loadingAction !== null} onClick={() => run("success")}>
          Simular pago exitoso
        </Button>
        <Button variant="ghost" disabled={loadingAction !== null} onClick={() => run("failed")}>
          Simular pago fallido
        </Button>
        <Button variant="ghost" disabled={loadingAction !== null} onClick={() => run("canceled")}>
          Simular cancelación
        </Button>
      </div>

      {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
      {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}
    </div>
  );
}

