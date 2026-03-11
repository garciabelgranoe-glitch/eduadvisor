"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CtaGroup } from "@/components/ui/cta-group";
import { FeatureState } from "@/components/ui/feature-state";
import { FormField } from "@/components/ui/form-field";
import { FormShell } from "@/components/ui/form-shell";
import { FormStatus } from "@/components/ui/form-status";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TurnstileChallenge } from "@/components/security/turnstile-challenge";
import { trackEvent } from "@/lib/analytics";

interface ReviewSchoolOption {
  id: string;
  slug: string;
  name: string;
  city: string;
}

interface ReviewFormProps {
  schools: ReviewSchoolOption[];
  initialSchoolSlug?: string;
}

export function ReviewForm({ schools, initialSchoolSlug }: ReviewFormProps) {
  const [startedAt] = useState(() => Date.now());
  const [hpCompany, setHpCompany] = useState("");
  const defaultSchoolId = useMemo(() => {
    if (!initialSchoolSlug) {
      return schools[0]?.id ?? "";
    }

    return schools.find((school) => school.slug === initialSchoolSlug)?.id ?? schools[0]?.id ?? "";
  }, [initialSchoolSlug, schools]);

  const [schoolId, setSchoolId] = useState(defaultSchoolId);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          schoolId,
          rating: Number(rating),
          comment,
          _challengeToken: challengeToken,
          _startedAt: startedAt,
          _hpCompany: hpCompany
        })
      });

      const payload = (await response.json().catch(() => null)) as { message?: string; id?: string } | null;

      if (!response.ok) {
        const message = payload?.message ?? "No se pudo enviar la review";
        trackEvent("review_submit_failed", {
          source: "review_form",
          statusCode: response.status
        });
        setErrorMessage(message);
        return;
      }

      trackEvent("review_submitted", {
        source: "review_form",
        schoolId,
        rating: Number(rating)
      });
      setComment("");
      setChallengeToken("");
      setSuccessMessage(
        `Review enviada con éxito (ID ${payload?.id ?? "n/a"}). Estado: pendiente de moderación.`
      );
    } catch {
      trackEvent("review_submit_failed", {
        source: "review_form",
        statusCode: 0
      });
      setErrorMessage("No se pudo conectar con el backend de reviews.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell title="Compartí tu experiencia" description="Tu opinión ayuda a otras familias a decidir mejor.">
      {schools.length === 0 ? (
        <FeatureState
          tone="warning"
          title="No hay colegios para reseñar"
          description="Todavía no hay colegios disponibles para recibir reseñas en este entorno."
        />
      ) : (
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="hidden" aria-hidden="true">
            <label>
              Company
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={hpCompany}
                onChange={(event) => setHpCompany(event.target.value)}
              />
            </label>
          </div>
          <FormField label="Colegio">
            <Select
              value={schoolId}
              onChange={(event) => setSchoolId(event.target.value)}
              required
            >
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} · {school.city}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Calificación">
              <Select
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                required
              >
                <option value="5">5 - Excelente</option>
                <option value="4">4 - Muy bueno</option>
                <option value="3">3 - Bueno</option>
                <option value="2">2 - Regular</option>
                <option value="1">1 - Deficiente</option>
              </Select>
            </FormField>
            <div className="text-xs text-slate-500 md:self-end">
              Solo se publican reseñas aprobadas por moderación para garantizar calidad.
            </div>
          </div>

          <FormField label="Comentario">
            <Textarea
              className="min-h-36"
              placeholder="Conta los puntos fuertes, lo que mejorarias y para que tipo de familia recomendarias el colegio."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              minLength={20}
              maxLength={1200}
              required
            />
          </FormField>

          <TurnstileChallenge
            token={challengeToken}
            onTokenChange={setChallengeToken}
            onError={() => setErrorMessage("No pudimos validar la verificación de seguridad. Intenta nuevamente.")}
          />

          <FormStatus errorMessage={errorMessage} successMessage={successMessage} />

          <CtaGroup
            primary={
              <Button type="submit" disabled={loading || schools.length === 0}>
                {loading ? "Enviando..." : "Enviar reseña"}
              </Button>
            }
            helperText="Moderación activa para asegurar calidad y respeto."
          />
        </form>
      )}
    </FormShell>
  );
}
