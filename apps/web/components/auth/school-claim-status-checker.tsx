"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormStatus } from "@/components/ui/form-status";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface SchoolOption {
  id: string;
  slug: string;
  name: string;
  city: string;
}

interface SchoolClaimStatusCheckerProps {
  schools: SchoolOption[];
}

interface ClaimStatusResponse {
  message: string;
}

export function SchoolClaimStatusChecker({ schools }: SchoolClaimStatusCheckerProps) {
  const defaultSchoolSlug = schools[0]?.slug ?? "";
  const [email, setEmail] = useState("");
  const [schoolSlug, setSchoolSlug] = useState(defaultSchoolSlug);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ClaimStatusResponse | null>(null);

  const selectedSchool = useMemo(() => schools.find((item) => item.slug === schoolSlug) ?? null, [schoolSlug, schools]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch("/api/session/school-claim-status", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          email,
          schoolSlug
        })
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok || !payload?.message) {
        setError(payload?.message ?? "No pudimos consultar el estado del claim.");
        return;
      }

      setStatus({
        message: payload.message
      });
    } catch {
      setError("No pudimos consultar el estado en este momento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-3 border-brand-100 bg-brand-50/40">
      <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Estado de claim</p>
      <p className="text-sm text-slate-700">
        Si ya solicitaste acceso institucional, aquí puedes verificar si está pendiente, aprobado o rechazado.
      </p>

      <form className="grid gap-3 md:grid-cols-[1.3fr_1fr_auto]" onSubmit={handleSubmit}>
        <FormField label="Email institucional">
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="direccion@colegio.edu.ar"
          />
        </FormField>

        <FormField label="Colegio">
          <Select required value={schoolSlug} onChange={(event) => setSchoolSlug(event.target.value)}>
            {schools.map((school) => (
              <option key={school.id} value={school.slug}>
                {school.name} · {school.city}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="flex items-end">
          <Button type="submit" variant="ghost" disabled={loading || schools.length === 0}>
            {loading ? "Consultando..." : "Consultar estado"}
          </Button>
        </div>
      </form>

      <FormStatus errorMessage={error} />

      {status ? (
        <div className="space-y-2 rounded-xl border border-brand-100 bg-white p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-800">
              Consulta recibida
            </span>
            {selectedSchool ? <span className="text-slate-600">{selectedSchool.name}</span> : null}
          </div>
          <p className="text-slate-700">{status.message}</p>
          <Button asChild variant="secondary">
            <Link href={`/para-colegios?flow=claim${selectedSchool ? `&school=${encodeURIComponent(selectedSchool.slug)}` : ""}`}>
              Iniciar o actualizar claim
            </Link>
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
