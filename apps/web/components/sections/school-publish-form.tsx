"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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

interface SchoolOption {
  id: string;
  slug: string;
  name: string;
  city: string;
  province: string;
}

function toTitleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// ─── Autocomplete de colegios para el flow de claim ──────────────────────────
function SchoolClaimAutocomplete({
  initialSlug,
  onSelect
}: {
  initialSlug?: string;
  onSelect: (school: SchoolOption | null) => void;
}) {
  const [query, setQuery] = useState(initialSlug ? toTitleCase(initialSlug) : "");
  const [selected, setSelected] = useState<SchoolOption | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SchoolOption[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const id = setTimeout(async () => {
      controllerRef.current?.abort();
      const ctrl = new AbortController();
      controllerRef.current = ctrl;
      setLoading(true);

      try {
        const res = await fetch(`/api/schools/login-options?q=${encodeURIComponent(normalized)}`, {
          cache: "no-store",
          signal: ctrl.signal
        });
        const data = (await res.json().catch(() => null)) as { items?: SchoolOption[] } | null;
        setResults((data?.items ?? []).slice(0, 12));
      } catch {
        // aborted o error — no hacer nada
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(id);
      controllerRef.current?.abort();
    };
  }, [query]);

  function pick(school: SchoolOption) {
    setSelected(school);
    setQuery(`${school.name} · ${school.city}`);
    setOpen(false);
    onSelect(school);
  }

  function clear() {
    setSelected(null);
    setQuery("");
    setOpen(false);
    onSelect(null);
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          required
          value={query}
          placeholder="Escribí el nombre del colegio..."
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-brand-100 bg-white px-3 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
          onFocus={() => { if (!selected) setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            onSelect(null);
            setOpen(true);
          }}
        />
        {selected && (
          <button
            type="button"
            onClick={clear}
            className="shrink-0 text-xs text-slate-400 hover:text-slate-600"
          >
            ✕ cambiar
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && !selected && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-brand-100 bg-white shadow-lg">
          {loading && (
            <p className="px-3 py-2 text-xs text-slate-500">Buscando colegios...</p>
          )}
          {!loading && results.length === 0 && query.trim().length >= 2 && (
            <p className="px-3 py-2 text-xs text-slate-500">
              No encontramos ese colegio. Si es nuevo, usá el modo <strong>Publicar colegio nuevo</strong>.
            </p>
          )}
          {!loading && results.map((school) => (
            <button
              key={school.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); pick(school); }}
              className="flex w-full flex-col px-3 py-2 text-left hover:bg-brand-50"
            >
              <span className="text-sm font-medium text-ink">{school.name}</span>
              <span className="text-xs text-slate-500">{school.city}, {school.province}</span>
            </button>
          ))}
        </div>
      )}

      {/* Estado visual */}
      <p className="mt-1 text-xs text-slate-500">
        {selected
          ? <span className="font-medium text-brand-700">✓ {selected.name} — {selected.city}, {selected.province}</span>
          : "Seleccioná el colegio de la lista para vincularlo correctamente."}
      </p>
    </div>
  );
}

// ─── Formulario principal ────────────────────────────────────────────────────
export function SchoolPublishForm({ initialFlow = "publish", initialSchoolSlug }: SchoolPublishFormProps) {
  const [startedAt] = useState(() => Date.now());
  const [hpWebsite, setHpWebsite] = useState("");
  const [flow, setFlow] = useState<"publish" | "claim">(initialFlow);

  // Campos del formulario
  const [schoolName, setSchoolName] = useState(initialSchoolSlug ? toTitleCase(initialSchoolSlug) : "");
  const [schoolSlug, setSchoolSlug] = useState(initialSchoolSlug ?? "");
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
      return "Buscá y seleccioná tu colegio de la lista para iniciar el proceso de verificación institucional.";
    }
    return "Envianos los datos iniciales para dar de alta el colegio y preparar su activación comercial.";
  }, [flow]);

  const submitLabel = flow === "claim" ? "Iniciar claim institucional" : "Solicitar alta de colegio";

  function handleSchoolSelect(school: SchoolOption | null) {
    if (school) {
      setSchoolName(school.name);
      setSchoolSlug(school.slug);
      setCity(school.city);
      setProvince(school.province);
    } else {
      setSchoolSlug("");
      setSchoolName("");
      setCity("");
      setProvince("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/schools/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          flow,
          schoolSlug: schoolSlug || undefined,
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
        | { message?: string; request?: PublishResponse }
        | null;

      if (!response.ok || !payload?.request) {
        trackEvent("school_request_failed", { flow, source: "for_schools", statusCode: response.status });
        setErrorMessage(payload?.message ?? "No pudimos registrar tu solicitud en este momento.");
        return;
      }

      trackEvent("school_request_submitted", { flow, source: "for_schools" });
      setSuccessMessage(
        `Solicitud recibida (${payload.request.requestId}). Te contactaremos por email para validar y activar el acceso.`
      );

      if (flow === "publish") {
        setSchoolName("");
        setSchoolSlug("");
        setCity("");
        setProvince("");
        setWebsite("");
      }
      setMessage("");
      setChallengeToken("");
    } catch {
      trackEvent("school_request_failed", { flow, source: "for_schools", statusCode: 0 });
      setErrorMessage("No se pudo conectar con EduAdvisor. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormShell title="Publicar o reclamar colegio" description={helperText}>
      <form className="space-y-3" onSubmit={handleSubmit}>
        {/* Honeypot */}
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={hpWebsite}
              onChange={(e) => setHpWebsite(e.target.value)}
            />
          </label>
        </div>

        {/* Tipo de solicitud */}
        <FormField label="Tipo de solicitud">
          <Select value={flow} onChange={(e) => setFlow(e.target.value as "publish" | "claim")}>
            <option value="publish">Publicar colegio nuevo</option>
            <option value="claim">Reclamar perfil existente</option>
          </Select>
        </FormField>

        {/* Campo de colegio — autocomplete para claim, texto libre para publish */}
        {flow === "claim" ? (
          <FormField label="Colegio a reclamar">
            <SchoolClaimAutocomplete
              initialSlug={initialSchoolSlug}
              onSelect={handleSchoolSelect}
            />
          </FormField>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <FormField label="Nombre del colegio">
              <Input
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Ciudad">
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Provincia">
              <Input
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
              />
            </FormField>
          </div>
        )}

        {/* Datos de contacto */}
        <div className="grid gap-3 md:grid-cols-3">
          <FormField label="Nombre de contacto">
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Rol">
            <Input
              value={contactRole}
              onChange={(e) => setContactRole(e.target.value)}
              placeholder="Director, marketing, admisiones..."
              required
            />
          </FormField>
          <FormField label="Teléfono">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </FormField>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Sitio web (opcional)">
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
            />
          </FormField>
        </div>

        <FormField label="Mensaje (opcional)">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
