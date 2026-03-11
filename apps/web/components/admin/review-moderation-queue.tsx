"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTimeUtc } from "@/lib/format";

interface ModerationReviewItem {
  id: string;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  school: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ReviewModerationQueueProps {
  items: ModerationReviewItem[];
}

export function ReviewModerationQueue({ items }: ReviewModerationQueueProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState(items);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function moderate(reviewId: string, status: "APPROVED" | "REJECTED") {
    setLoadingId(reviewId);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/reviews/moderate", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ reviewId, status })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setErrorMessage(payload?.message ?? "No se pudo moderar la review");
        return;
      }

      setLocalItems((current) => current.filter((item) => item.id !== reviewId));
    } catch {
      setErrorMessage("No se pudo conectar con moderación.");
    } finally {
      setLoadingId(null);
    }
  }

  if (localItems.length === 0) {
    return <Card className="text-sm text-slate-600">No hay reviews pendientes de moderación.</Card>;
  }

  return (
    <div className="space-y-3">
      {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
      {localItems.map((review) => (
        <Card key={review.id} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-ink">{review.school.name}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Rating {review.rating}/5</p>
            </div>
            <p className="text-xs text-slate-500">{formatDateTimeUtc(review.createdAt)}</p>
          </div>
          <p className="text-sm text-slate-700">{review.comment}</p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={loadingId === review.id}
              onClick={() => moderate(review.id, "APPROVED")}
            >
              Aprobar
            </Button>
            <Button
              variant="ghost"
              disabled={loadingId === review.id}
              onClick={() => moderate(review.id, "REJECTED")}
            >
              Rechazar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
