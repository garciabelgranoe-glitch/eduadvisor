"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { CtaGroup } from "@/components/ui/cta-group";
import { FormField } from "@/components/ui/form-field";
import { FormShell } from "@/components/ui/form-shell";
import { FormStatus } from "@/components/ui/form-status";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TurnstileChallenge } from "@/components/security/turnstile-challenge";
import type { ApiSchoolDetail } from "@/lib/api";
import { trackEvent, trackFunnelStep } from "@/lib/analytics";

interface LeadCaptureFormProps {
  school: ApiSchoolDetail;
  locked?: boolean;
  lockedMessage?: string;
}

export function LeadCaptureForm({
  school,
  locked = false,
  lockedMessage = "Para activar el contacto por matrícula el colegio debe activar el modo premium."
}: LeadCaptureFormProps) {
  const [startedAt] = useState(() => Date.now());
  const [hpWebsite, setHpWebsite] = useState("");
  const [parentName, setParentName] = useState("");
  const [childAge, setChildAge] = useState("8");
  const [educationLevel, setEducationLevel] = useState<"INICIAL" | "PRIMARIA" | "SECUNDARIA">("PRIMARIA");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (locked) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          schoolId: school.id,
          parentName,
          childAge: Number(childAge),
          educationLevel,
          phone,
          email,
          _challengeToken: challengeToken,
          _startedAt: startedAt,
          _hpWebsite: hpWebsite
        })
      });

      const payload = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;

      if (!response.ok) {
        trackEvent("lead_submit_failed", {
          schoolSlug: school.slug,
          source: "school_profile",
          statusCode: response.status
        });
        setErrorMessage(payload?.message ?? "No se pudo enviar tu consulta al colegio");
        return;
      }

      trackEvent("lead_submitted", {
        schoolSlug: school.slug,
        source: "school_profile",
        educationLevel
      });
      trackFunnelStep("lead", {
        schoolSlug: school.slug,
        source: "school_profile",
        educationLevel
      });
      setSuccessMessage(
        `Consulta enviada con éxito (Lead ${payload?.id ?? "n/a"}). El colegio te contactará pronto.`
      );
      setParentName("");
      setPhone("");
      setEmail("");
      setChallengeToken("");
    } catch {
      trackEvent("lead_submit_failed", {
        schoolSlug: school.slug,
        source: "school_profile",
        statusCode: 0
      });
      setErrorMessage("No se pudo conectar con el backend de leads.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell
      title="Solicitar contacto del colegio"
      description={`Enviá tus datos y el equipo de admisiones de ${school.name} se comunicará con vos.`}
    >
      {locked ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {lockedMessage}
        </div>
      ) : null}

      <form className="space-y-3" onSubmit={onSubmit}>
        <div
          className={
            locked ? "pointer-events-none select-none opacity-35 blur-[2.2px] saturate-0 transition" : undefined
          }
        >
          <div className="hidden" aria-hidden="true">
            <label>
              Website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={hpWebsite}
                onChange={(event) => setHpWebsite(event.target.value)}
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Nombre de madre, padre o tutor">
              <Input
                value={parentName}
                onChange={(event) => setParentName(event.target.value)}
                minLength={2}
                maxLength={120}
                required
              />
            </FormField>
            <FormField label="Edad del hijo o hija">
              <Input
                type="number"
                min={2}
                max={19}
                value={childAge}
                onChange={(event) => setChildAge(event.target.value)}
                required
              />
            </FormField>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Nivel educativo">
              <Select
                value={educationLevel}
                onChange={(event) => setEducationLevel(event.target.value as "INICIAL" | "PRIMARIA" | "SECUNDARIA")}
                required
              >
                <option value="INICIAL">Inicial</option>
                <option value="PRIMARIA">Primaria</option>
                <option value="SECUNDARIA">Secundaria</option>
              </Select>
            </FormField>
            <FormField label="Teléfono">
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} required />
            </FormField>
          </div>

          <FormField label="Email de contacto">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              <Button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar consulta"}
              </Button>
            }
            helperText="Tus datos se comparten únicamente con el colegio seleccionado."
          />
        </div>
      </form>
    </FormShell>
  );
}
