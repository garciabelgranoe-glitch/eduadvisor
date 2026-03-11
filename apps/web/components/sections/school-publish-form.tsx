"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CtaGroup } from "@/components/ui/cta-group";
import { FormField } from "@/components/ui/form-field";
import { FormShell } from "@/components/ui/form-shell";
import { FormStatus } from "@/components/ui/form-status";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TurnstileChallenge } from "@/components/security/turnstile-challenge";
import { trackEvent } from "@/lib/analytics";

interface SchoolPublishFormProps {
  initialFlow?: "publish" | "claim";
  initialSchoolSlug?: string;
}

interface PublishResponse {
  requestId: string;
  status: string;
}

function toTitleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function SchoolPublishForm({ initialFlow = "publish", initialSchoolSlug }: SchoolPublishFormProps) {
  const [startedAt] = useState(() => Date.now());
  const [hpWebsite, setHpWebsite] = useState("");
  const schoolSlug = initialSchoolSlug?.trim().toLowerCase() || undefined;
  const [flow, setFlow] = useState<"publish" | "claim">(initialFlow);
  const [schoolName, setSchoolName] = useState(initialSchoolSlug ? toTitleCase(initialSchoolSlug) : "");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const helperText = useMemo(() => {
    if (flow === "claim") {
      return "Solicita el claim de un perfil existente para tomar control institucional y habilitar funciones comerciales.";
    }

    return "Envianos los datos iniciales para dar de alta el colegio y preparar su activacion comercial.";
  }, [flow]);

  const submitLabel = flow === "claim" ? "Iniciar claim institucional" : "Solicitar alta de colegio";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/schools/publish", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          flow,
          schoolSlug,
          schoolName,
          city,
          province,
          contactName,
          contactRole,
          email,
          phone,
          website: website || null,
          message: message || null,
          _challengeToken: challengeToken,
          _startedAt: startedAt,
          _hpWebsite: hpWebsite
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            request?: PublishResponse;
          }
        | null;

      if (!response.ok || !payload?.request) {
        trackEvent("school_request_failed", {
          flow,
          source: "for_schools",
          statusCode: response.status
        });
        setErrorMessage(payload?.message ?? "No pudimos registrar tu solicitud en este momento.");
        return;
      }

      trackEvent("school_request_submitted", {
        flow,
        source: "for_schools"
      });
      setSuccessMessage(
        `Solicitud recibida (${payload.request.requestId}). Te contactaremos por email para validar y activar el acceso.`
      );

      if (flow === "publish") {
        setSchoolName("");
        setCity("");
        setProvince("");
        setWebsite("");
      }
      setMessage("");
      setChallengeToken("");
    } catch {
      trackEvent("school_request_failed", {
        flow,
        source: "for_schools",
        statusCode: 0
      });
      setErrorMessage("No se pudo conectar con EduAdvisor. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell title="Publicar o reclamar colegio" description={helperText}>
      <form className="space-y-3" onSubmit={handleSubmit}>
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
          <FormField label="Tipo de solicitud">
            <Select
              value={flow}
              onChange={(event) => setFlow(event.target.value as "publish" | "claim")}
            >
              <option value="publish">Publicar colegio nuevo</option>
              <option value="claim">Reclamar perfil existente</option>
            </Select>
          </FormField>
          <FormField label="Nombre del colegio">
            <Input
              value={schoolName}
              onChange={(event) => setSchoolName(event.target.value)}
              required
            />
          </FormField>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Ciudad">
            <Input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
            />
          </FormField>
          <FormField label="Provincia">
            <Input
              value={province}
              onChange={(event) => setProvince(event.target.value)}
              required
            />
          </FormField>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <FormField label="Nombre de contacto">
            <Input
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              required
            />
          </FormField>
          <FormField label="Rol">
            <Input
              value={contactRole}
              onChange={(event) => setContactRole(event.target.value)}
              placeholder="Director, marketing, admisiones..."
              required
            />
          </FormField>
          <FormField label="Teléfono">
            <Input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </FormField>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Email">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </FormField>
          <FormField label="Sitio web (opcional)">
            <Input
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://..."
            />
          </FormField>
        </div>

        <FormField label="Mensaje (opcional)">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Cuéntanos qué necesitas y en qué plazo."
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
              {loading ? "Enviando..." : submitLabel}
            </Button>
          }
          helperText="Verificamos cada solicitud para mantener la calidad del marketplace."
        />
      </form>
    </FormShell>
  );
}
