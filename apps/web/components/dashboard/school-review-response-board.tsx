"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormStatus } from "@/components/ui/form-status";
import { Textarea } from "@/components/ui/textarea";
import type { SchoolDashboardResponse } from "@/lib/api";
import { formatDateTimeUtc } from "@/lib/format";

type ReviewItem = SchoolDashboardResponse["recentReviews"][number];
type QueueFilter = "ALL" | "PENDING" | "SLA_BREACH" | "RESPONDED";

interface SchoolReviewResponseBoardProps {
  initialReviews: ReviewItem[];
  schoolId: string;
  canManageResponses: boolean;
  referenceTimeIso: string;
}

export function SchoolReviewResponseBoard({
  initialReviews,
  schoolId,
  canManageResponses,
  referenceTimeIso
}: SchoolReviewResponseBoardProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialReviews.map((review) => [review.id, review.schoolResponse ?? ""]))
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<QueueFilter>("ALL");
  const referenceTimeMs = useMemo(() => {
    const parsed = new Date(referenceTimeIso).getTime();
    return Number.isNaN(parsed) ? Date.now() : parsed;
  }, [referenceTimeIso]);

  const orderedReviews = useMemo(() => {
    const now = referenceTimeMs;

    function getQueueState(review: ReviewItem) {
      if (review.schoolResponseAt) {
        return "RESPONDED" as const;
      }

      const ageHours = Math.max(0, Math.floor((now - new Date(review.createdAt).getTime()) / 3_600_000));
      return ageHours >= 72 ? ("SLA_BREACH" as const) : ("PENDING" as const);
    }

    function queuePriority(state: ReturnType<typeof getQueueState>) {
      if (state === "SLA_BREACH") {
        return 0;
      }

      if (state === "PENDING") {
        return 1;
      }

      return 2;
    }

    return [...reviews]
      .sort((a, b) => {
        const stateA = getQueueState(a);
        const stateB = getQueueState(b);

        const priorityA = queuePriority(stateA);
        const priorityB = queuePriority(stateB);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        if (stateA === "RESPONDED" && stateB === "RESPONDED") {
          const respondedA = a.schoolResponseAt ? new Date(a.schoolResponseAt).getTime() : 0;
          const respondedB = b.schoolResponseAt ? new Date(b.schoolResponseAt).getTime() : 0;
          return respondedB - respondedA;
        }

        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
      .filter((review) => {
        if (filter === "ALL") {
          return true;
        }

        return getQueueState(review) === filter;
      });
  }, [filter, referenceTimeMs, reviews]);

  const queueMetrics = useMemo(() => {
    const now = referenceTimeMs;

    return reviews.reduce(
      (acc, review) => {
        if (review.schoolResponseAt) {
          acc.responded += 1;
          return acc;
        }

        const ageHours = Math.max(0, Math.floor((now - new Date(review.createdAt).getTime()) / 3_600_000));
        if (ageHours >= 72) {
          acc.slaBreaches += 1;
        } else {
          acc.pending += 1;
        }

        return acc;
      },
      {
        pending: 0,
        slaBreaches: 0,
        responded: 0
      }
    );
  }, [referenceTimeMs, reviews]);

  async function saveResponse(reviewId: string) {
    if (!canManageResponses) {
      return;
    }

    setLoadingId(reviewId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/reviews/respond", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          reviewId,
          schoolId,
          response: drafts[reviewId] ?? ""
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            id?: string;
            schoolResponse?: string | null;
            schoolResponseAt?: string | null;
            message?: string;
          }
        | null;

      if (!response.ok) {
        setErrorMessage(payload?.message ?? "No se pudo guardar la respuesta del colegio");
        return;
      }

      setReviews((current) =>
        current.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                schoolResponse: payload?.schoolResponse ?? null,
                schoolResponseAt: payload?.schoolResponseAt ?? null
              }
            : review
        )
      );
      setDrafts((current) => ({
        ...current,
        [reviewId]: payload?.schoolResponse ?? ""
      }));
      setSuccessMessage("Respuesta guardada.");
    } catch {
      setErrorMessage("No se pudo conectar con el backend de reviews.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-3">
      <Card className="space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          <p className="text-sm text-slate-700">
            Pendientes <span className="font-semibold text-ink">{queueMetrics.pending}</span>
          </p>
          <p className="text-sm text-slate-700">
            SLA vencido <span className="font-semibold text-ink">{queueMetrics.slaBreaches}</span>
          </p>
          <p className="text-sm text-slate-700">
            Respondidas <span className="font-semibold text-ink">{queueMetrics.responded}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={filter === "ALL" ? "primary" : "ghost"} onClick={() => setFilter("ALL")}>
            Todas
          </Button>
          <Button variant={filter === "SLA_BREACH" ? "primary" : "ghost"} onClick={() => setFilter("SLA_BREACH")}>
            SLA vencido
          </Button>
          <Button variant={filter === "PENDING" ? "primary" : "ghost"} onClick={() => setFilter("PENDING")}>
            Pendientes
          </Button>
          <Button variant={filter === "RESPONDED" ? "primary" : "ghost"} onClick={() => setFilter("RESPONDED")}>
            Respondidas
          </Button>
        </div>
      </Card>

      {!canManageResponses ? (
        <Card className="text-sm text-slate-600">
          Respuesta a reseñas bloqueada. Esta función se habilita para colegios VERIFIED o PREMIUM.
        </Card>
      ) : null}
      <FormStatus errorMessage={errorMessage} successMessage={successMessage} />

      {orderedReviews.length === 0 ? (
        <Card className="text-sm text-slate-600">
          {reviews.length === 0
            ? "No hay reseñas aprobadas para responder todavía."
            : "No hay reseñas para el filtro seleccionado."}
        </Card>
      ) : (
        orderedReviews.map((review) => {
          const draftValue = drafts[review.id] ?? "";
          const reviewAgeHours = Math.max(
            0,
            Math.floor((referenceTimeMs - new Date(review.createdAt).getTime()) / 3_600_000)
          );
          const queueState = review.schoolResponseAt
            ? "RESPONDED"
            : reviewAgeHours >= 72
              ? "SLA_BREACH"
              : "PENDING";
          const queueLabel =
            queueState === "RESPONDED"
              ? "Respondida"
              : queueState === "SLA_BREACH"
                ? `SLA vencido (${reviewAgeHours}h)`
                : `Pendiente (${reviewAgeHours}h)`;
          const queueToneClass =
            queueState === "RESPONDED"
              ? "bg-brand-50 text-brand-700"
              : queueState === "SLA_BREACH"
                ? "bg-amber-100 text-amber-900"
                : "bg-slate-100 text-slate-700";

          return (
            <Card key={review.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Rating {review.rating}/5</p>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${queueToneClass}`}>{queueLabel}</span>
                  <p className="text-xs text-slate-500">{formatDateTimeUtc(review.createdAt)}</p>
                </div>
              </div>

              <p className="text-sm font-medium text-ink">&quot;{review.comment}&quot;</p>

              <FormField label="Respuesta oficial del colegio">
                <Textarea
                  className="min-h-24"
                  value={draftValue}
                  onChange={(event) =>
                    setDrafts((current) => ({
                      ...current,
                      [review.id]: event.target.value
                    }))
                  }
                  maxLength={1200}
                  placeholder="Agradecé feedback, explicá mejoras y mantené tono institucional."
                  disabled={!canManageResponses || loadingId === review.id}
                />
              </FormField>

              {review.schoolResponseAt ? (
                <p className="text-xs text-slate-500">
                  Última actualización: {formatDateTimeUtc(review.schoolResponseAt)}
                </p>
              ) : null}

              <div className="flex justify-end">
                <Button disabled={!canManageResponses || loadingId === review.id} onClick={() => saveResponse(review.id)}>
                  {loadingId === review.id
                    ? "Guardando..."
                    : draftValue.trim().length === 0
                      ? "Quitar respuesta"
                      : "Guardar respuesta"}
                </Button>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
