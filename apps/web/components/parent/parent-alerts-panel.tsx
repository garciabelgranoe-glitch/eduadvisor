"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { ParentAlertItem, ParentAlertsResponse } from "@/lib/api";
import { formatDateTimeUtc } from "@/lib/format";

const PARENT_ALERTS_QUERY_KEY = ["parent", "alerts"] as const;

interface ParentAlertsPanelProps {
  initialItems: ParentAlertItem[];
}

function getInitialResponse(items: ParentAlertItem[]): ParentAlertsResponse {
  return {
    items,
    meta: {
      total: items.length,
      unread: items.filter((item) => !item.isRead).length,
      limit: items.length
    }
  };
}

async function fetchAlerts() {
  const response = await fetch("/api/parent/alerts", {
    method: "GET",
    cache: "no-store"
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("PARENT_ALERTS_FETCH_FAILED");
  }

  return (await response.json()) as ParentAlertsResponse;
}

export function ParentAlertsPanel({ initialItems }: ParentAlertsPanelProps) {
  const queryClient = useQueryClient();
  const alertsQuery = useQuery({
    queryKey: PARENT_ALERTS_QUERY_KEY,
    queryFn: fetchAlerts,
    initialData: getInitialResponse(initialItems),
    staleTime: 30_000
  });

  const markReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch("/api/parent/alerts", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ alertId })
      });

      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      if (!response.ok) {
        throw new Error("PARENT_ALERTS_MARK_FAILED");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARENT_ALERTS_QUERY_KEY }).catch(() => null);
    }
  });

  const items = alertsQuery.data?.items ?? initialItems;

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        No hay alertas por ahora. Cuando tus colegios guardados actualicen información, aparecerán aquí.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((alert) => (
        <li
          key={alert.id}
          className={`rounded-xl border p-3 ${alert.isRead ? "border-slate-200 bg-white" : "border-brand-100 bg-brand-50/40"}`}
        >
          <p className="text-sm font-semibold text-ink">{alert.title}</p>
          <p className="text-sm text-slate-600">{alert.message}</p>
          <p className="mt-1 text-xs text-slate-500">{formatDateTimeUtc(alert.createdAt)}</p>
          <div className="mt-2 flex items-center gap-3">
            {alert.linkPath ? (
              <Link href={alert.linkPath as never} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                Ver detalle
              </Link>
            ) : null}
            {!alert.isRead ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => markReadMutation.mutate(alert.id)}
                disabled={markReadMutation.isPending}
              >
                Marcar leída
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
