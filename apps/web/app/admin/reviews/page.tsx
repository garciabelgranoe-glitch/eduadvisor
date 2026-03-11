import type { Metadata } from "next";
import { ReviewModerationQueue } from "@/components/admin/review-moderation-queue";
import { Card } from "@/components/ui/card";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata({
  title: "Moderación de reseñas",
  description: "Cola de moderación de reseñas para control de calidad editorial.",
  canonicalPath: "/admin/reviews"
});

interface QueueResponse {
  items: Array<{
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
  }>;
}

async function getModerationQueue(): Promise<QueueResponse> {
  const apiBase = process.env.API_URL ?? "http://localhost:4000";
  const adminApiKey = process.env.ADMIN_API_KEY?.trim() ?? "";

  try {
    const response = await fetch(`${apiBase}/v1/reviews/moderation/queue?status=PENDING&limit=50`, {
      headers: {
        "x-admin-key": adminApiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return { items: [] };
    }

    return (await response.json()) as QueueResponse;
  } catch {
    return { items: [] };
  }
}

export default async function AdminReviewsPage() {
  const queue = await getModerationQueue();

  return (
    <section className="space-y-6">
      <Card className="space-y-2 bg-gradient-to-r from-brand-50 to-white">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Moderación</p>
        <h1 className="font-display text-4xl text-ink">Reseñas pendientes</h1>
        <p className="text-sm text-slate-600">
          Flujo editorial para aprobar o rechazar reseñas antes de publicación pública.
        </p>
      </Card>

      <ReviewModerationQueue items={queue.items} />
    </section>
  );
}
