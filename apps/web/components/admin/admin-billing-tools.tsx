"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormStatus } from "@/components/ui/form-status";
import { Input } from "@/components/ui/input";

interface SchoolOption {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  province?: string | null;
}

interface AdminBillingToolsProps {
  schools: SchoolOption[];
}

function formatSchoolLabel(school: SchoolOption) {
  const location = [school.city, school.province].filter(Boolean).join(", ");
  if (!location) {
    return `${school.name} · /${school.slug}`;
  }

  return `${school.name} · /${school.slug} · ${location}`;
}

export function AdminBillingTools({ schools }: AdminBillingToolsProps) {
  const [schoolId, setSchoolId] = useState(schools[0]?.id ?? "");
  const [schoolQuery, setSchoolQuery] = useState(schools[0] ? formatSchoolLabel(schools[0]) : "");
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>(() => schools.slice(0, 20));
  const [isSchoolMenuOpen, setIsSchoolMenuOpen] = useState(false);
  const [isSearchingSchools, setIsSearchingSchools] = useState(false);
  const [schoolSearchError, setSchoolSearchError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [knownSchools, setKnownSchools] = useState<Record<string, SchoolOption>>(() =>
    Object.fromEntries(schools.map((school) => [school.id, school]))
  );
  const schoolSelectorRef = useRef<HTMLDivElement | null>(null);

  const selectedSchool = useMemo(() => (schoolId ? knownSchools[schoolId] ?? null : null), [knownSchools, schoolId]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!schoolSelectorRef.current?.contains(event.target as Node)) {
        setIsSchoolMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (selectedSchool && schoolQuery === formatSchoolLabel(selectedSchool)) {
      setIsSearchingSchools(false);
      return;
    }

    const query = schoolQuery.trim();
    if (query.length === 0) {
      setSchoolOptions(schools.slice(0, 20));
      setSchoolSearchError(null);
      setIsSearchingSchools(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingSchools(true);
      setSchoolSearchError(null);

      try {
        const response = await fetch(
          `/api/admin/schools/search?q=${encodeURIComponent(query)}&limit=20&status=all`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal
          }
        );
        const payload = (await response.json().catch(() => null)) as
          | {
              items?: SchoolOption[];
              message?: string;
            }
          | null;

        if (!response.ok) {
          setSchoolOptions([]);
          setSchoolSearchError(payload?.message ?? "No se pudo buscar colegios.");
          return;
        }

        const items = payload?.items ?? [];
        setSchoolOptions(items);
        setKnownSchools((current) => {
          const next = { ...current };
          for (const school of items) {
            next[school.id] = school;
          }
          return next;
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setSchoolOptions([]);
        setSchoolSearchError("No se pudo buscar colegios en este momento.");
      } finally {
        setIsSearchingSchools(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [schoolQuery, schools, selectedSchool]);

  function selectSchool(school: SchoolOption) {
    setKnownSchools((current) => ({
      ...current,
      [school.id]: school
    }));
    setSchoolId(school.id);
    setSchoolQuery(formatSchoolLabel(school));
    setSchoolSearchError(null);
    setIsSchoolMenuOpen(false);
  }

  async function createCheckout() {
    if (!schoolId) {
      return;
    }

    setLoadingAction("checkout");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/admin/billing/checkout", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          schoolId
        })
      });

      const payload = (await response.json().catch(() => null)) as { message?: string; checkoutUrl?: string } | null;
      if (!response.ok) {
        setErrorMessage(payload?.message ?? "No se pudo crear checkout.");
        return;
      }

      const checkoutUrl = payload?.checkoutUrl;
      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      }
      setSuccessMessage("Checkout demo creado. Abrimos la sesión en una nueva pestaña.");
    } catch {
      setErrorMessage("No se pudo conectar con el servicio de billing.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function simulate(eventType: "invoice.paid" | "invoice.payment_failed" | "subscription.canceled") {
    if (!schoolId) {
      return;
    }

    setLoadingAction(eventType);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/admin/billing/simulate", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          schoolId,
          eventType
        })
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setErrorMessage(payload?.message ?? "No se pudo simular el evento.");
        return;
      }

      const successLabels: Record<typeof eventType, string> = {
        "invoice.paid": "Se simuló pago exitoso.",
        "invoice.payment_failed": "Se simuló pago fallido.",
        "subscription.canceled": "Se simuló cancelación de suscripción."
      };
      setSuccessMessage(successLabels[eventType]);
      window.setTimeout(() => window.location.reload(), 450);
    } catch {
      setErrorMessage("No se pudo conectar con el backend de billing.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <Card className="space-y-3">
      <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Operaciones de facturación</p>
      <div className="grid gap-3 md:grid-cols-[1.9fr_auto_auto_auto_auto] md:items-end">
        <FormField label="Colegio objetivo">
          <div ref={schoolSelectorRef} className="relative mt-1">
            <Input
              value={schoolQuery}
              onChange={(event) => {
                setSchoolQuery(event.target.value);
                setSchoolId("");
                setIsSchoolMenuOpen(true);
              }}
              onFocus={() => setIsSchoolMenuOpen(true)}
              placeholder="Escribe nombre, slug o ciudad"
            />
            {isSchoolMenuOpen ? (
              <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-brand-100 bg-white shadow-[0_18px_35px_rgba(15,23,42,0.18)]">
                {isSearchingSchools ? (
                  <p className="px-3 py-2 text-sm text-slate-500">Buscando colegios...</p>
                ) : schoolOptions.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-slate-500">No encontramos colegios para esa búsqueda.</p>
                ) : (
                  schoolOptions.map((school) => (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => selectSchool(school)}
                      className="block w-full border-b border-brand-50 px-3 py-2 text-left text-sm text-ink transition hover:bg-brand-50 last:border-b-0"
                    >
                      <p className="font-medium">{school.name}</p>
                      <p className="text-xs text-slate-500">
                        /{school.slug}
                        {school.city || school.province ? ` · ${[school.city, school.province].filter(Boolean).join(", ")}` : ""}
                      </p>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
          {selectedSchool ? (
            <p className="mt-1 text-xs text-slate-500">
              Seleccionado: {selectedSchool.name} ({selectedSchool.slug})
            </p>
          ) : (
            <p className="mt-1 text-xs text-amber-700">Selecciona un colegio del listado para continuar.</p>
          )}
          {schoolSearchError ? <p className="mt-1 text-xs text-red-700">{schoolSearchError}</p> : null}
        </FormField>

        <Button disabled={!schoolId || loadingAction !== null} onClick={createCheckout} variant="secondary">
          Crear checkout
        </Button>
        <Button
          disabled={!schoolId || loadingAction !== null}
          onClick={() => simulate("invoice.paid")}
          variant="ghost"
        >
          Simular pago OK
        </Button>
        <Button
          disabled={!schoolId || loadingAction !== null}
          onClick={() => simulate("invoice.payment_failed")}
          variant="ghost"
        >
          Simular pago fallido
        </Button>
        <Button
          disabled={!schoolId || loadingAction !== null}
          onClick={() => simulate("subscription.canceled")}
          variant="ghost"
        >
          Simular cancelación
        </Button>
      </div>

      <FormStatus errorMessage={errorMessage} successMessage={successMessage} />
    </Card>
  );
}
