"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { ParentSavedSchoolsResponse } from "@/lib/api";
import { trackEvent, trackFunnelStep } from "@/lib/analytics";

interface SaveSchoolButtonProps {
  schoolId: string;
  schoolSlug: string;
}

const PARENT_SAVED_SCHOOLS_QUERY_KEY = ["parent", "saved-schools"] as const;

async function fetchParentSavedSchools() {
  const response = await fetch("/api/parent/saved-schools", {
    method: "GET",
    cache: "no-store"
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("SAVED_SCHOOLS_FETCH_FAILED");
  }

  return (await response.json()) as ParentSavedSchoolsResponse;
}

function buildMutationError(response: Response) {
  if (response.status === 401) {
    return new Error("UNAUTHORIZED");
  }

  return new Error("SAVE_SCHOOL_MUTATION_FAILED");
}

export function SaveSchoolButton({ schoolId, schoolSlug }: SaveSchoolButtonProps) {
  const queryClient = useQueryClient();

  const redirectToSignIn = () => {
    if (typeof window === "undefined") {
      return;
    }

    const nextPath = `${window.location.pathname}${window.location.search || ""}`;
    window.location.href = `/ingresar?next=${encodeURIComponent(nextPath)}`;
  };

  const savedQuery = useQuery({
    queryKey: PARENT_SAVED_SCHOOLS_QUERY_KEY,
    queryFn: fetchParentSavedSchools,
    staleTime: 30_000
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/parent/saved-schools", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ schoolId })
      });

      if (!response.ok) {
        throw buildMutationError(response);
      }
    },
    onSuccess: () => {
      trackEvent("school_saved", {
        schoolSlug
      });
      trackFunnelStep("shortlist", {
        source: "save_school_button",
        schoolSlug
      });
      queryClient.invalidateQueries({ queryKey: PARENT_SAVED_SCHOOLS_QUERY_KEY }).catch(() => null);
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        queryClient.setQueryData(PARENT_SAVED_SCHOOLS_QUERY_KEY, null);
        redirectToSignIn();
      }
    }
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/parent/saved-schools?schoolId=${encodeURIComponent(schoolId)}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw buildMutationError(response);
      }
    },
    onSuccess: () => {
      trackEvent("school_unsaved", {
        schoolSlug
      });
      queryClient.invalidateQueries({ queryKey: PARENT_SAVED_SCHOOLS_QUERY_KEY }).catch(() => null);
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        queryClient.setQueryData(PARENT_SAVED_SCHOOLS_QUERY_KEY, null);
        redirectToSignIn();
      }
    }
  });

  const isSaved = savedQuery.data?.items.some((item) => item.school.id === schoolId) ?? false;
  const isPending = saveMutation.isPending || removeMutation.isPending;

  const handleClick = () => {
    if (savedQuery.data === null) {
      trackEvent("school_save_requires_auth", {
        schoolSlug
      });
      redirectToSignIn();
      return;
    }

    if (savedQuery.isLoading || savedQuery.isFetching || isPending) {
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
      disabled={savedQuery.isLoading || isPending}
      aria-pressed={isSaved}
    >
      {isPending ? "Actualizando..." : isSaved ? "Guardado" : "Guardar"}
    </Button>
  );
}
