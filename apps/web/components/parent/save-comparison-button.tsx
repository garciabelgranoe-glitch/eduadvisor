"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { ParentComparisonsResponse } from "@/lib/api";
import { trackEvent, trackFunnelStep } from "@/lib/analytics";

interface SaveComparisonButtonProps {
  schoolSlugs: string[];
}

const PARENT_COMPARISONS_QUERY_KEY = ["parent", "comparisons"] as const;

async function fetchParentComparisons() {
  const response = await fetch("/api/parent/comparisons", {
    method: "GET",
    cache: "no-store"
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("COMPARISONS_FETCH_FAILED");
  }

  return (await response.json()) as ParentComparisonsResponse;
}

function toComparableKey(values: string[]) {
  return [...values].sort().join("|");
}

export function SaveComparisonButton({ schoolSlugs }: SaveComparisonButtonProps) {
  const queryClient = useQueryClient();
  const normalizedSlugs = useMemo(
    () =>
      Array.from(
        new Set(
          schoolSlugs
            .map((entry) => entry.trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 3)
        )
      ),
    [schoolSlugs]
  );
  const candidateKey = useMemo(() => toComparableKey(normalizedSlugs), [normalizedSlugs]);

  const redirectToSignIn = () => {
    if (typeof window === "undefined") {
      return;
    }
    const nextPath = `${window.location.pathname}${window.location.search || ""}`;
    window.location.href = `/ingresar?next=${encodeURIComponent(nextPath)}`;
  };

  const comparisonsQuery = useQuery({
    queryKey: PARENT_COMPARISONS_QUERY_KEY,
    queryFn: fetchParentComparisons,
    staleTime: 30_000
  });

  const existingComparison =
    comparisonsQuery.data?.items.find((item) => toComparableKey(item.schoolSlugs) === candidateKey) ?? null;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/parent/comparisons", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          schoolSlugs: normalizedSlugs
        })
      });

      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      if (!response.ok) {
        throw new Error("SAVE_COMPARISON_FAILED");
      }
    },
    onSuccess: () => {
      trackEvent("comparison_saved", {
        schools: normalizedSlugs.join(",")
      });
      trackFunnelStep("comparison", {
        source: "save_comparison_button",
        schools: normalizedSlugs.join(",")
      });
      queryClient.invalidateQueries({ queryKey: PARENT_COMPARISONS_QUERY_KEY }).catch(() => null);
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        queryClient.setQueryData(PARENT_COMPARISONS_QUERY_KEY, null);
        redirectToSignIn();
      }
    }
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (!existingComparison) {
        return;
      }

      const response = await fetch(
        `/api/parent/comparisons?comparisonId=${encodeURIComponent(existingComparison.id)}`,
        {
          method: "DELETE"
        }
      );

      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }

      if (!response.ok) {
        throw new Error("REMOVE_COMPARISON_FAILED");
      }
    },
    onSuccess: () => {
      trackEvent("comparison_removed", {
        schools: normalizedSlugs.join(",")
      });
      queryClient.invalidateQueries({ queryKey: PARENT_COMPARISONS_QUERY_KEY }).catch(() => null);
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        queryClient.setQueryData(PARENT_COMPARISONS_QUERY_KEY, null);
        redirectToSignIn();
      }
    }
  });

  const isPending = saveMutation.isPending || removeMutation.isPending;
  const isSaved = Boolean(existingComparison);

  const handleClick = () => {
    if (normalizedSlugs.length < 2) {
      return;
    }

    if (comparisonsQuery.data === null) {
      redirectToSignIn();
      return;
    }

    if (comparisonsQuery.isLoading || comparisonsQuery.isFetching || isPending) {
      return;
    }

    if (isSaved) {
      removeMutation.mutate();
      return;
    }

    saveMutation.mutate();
  };

  return (
    <Button
      type="button"
      variant={isSaved ? "secondary" : "ghost"}
      onClick={handleClick}
      disabled={comparisonsQuery.isLoading || isPending || normalizedSlugs.length < 2}
    >
      {isPending ? "Actualizando..." : isSaved ? "Comparación guardada" : "Guardar comparación"}
    </Button>
  );
}
