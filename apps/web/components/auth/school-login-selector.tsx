"use client";

import { useEffect, useMemo, useState } from "react";

interface SchoolOption {
  id: string;
  slug: string;
  name: string;
  city: string;
  province?: string;
}

interface SchoolLoginSelectorProps {
  schools: SchoolOption[];
}

function formatLabel(school: SchoolOption) {
  return `${school.name} · ${school.city}${school.province ? `, ${school.province}` : ""}`;
}

export function SchoolLoginSelector({ schools }: SchoolLoginSelectorProps) {
  const [query, setQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<SchoolOption | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SchoolOption[]>(schools.slice(0, 10));

  const localResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length === 0) {
      return schools.slice(0, 10);
    }

    return schools
      .filter((school) => {
        const text = `${school.name} ${school.city} ${school.province ?? ""}`.toLowerCase();
        return text.includes(normalized);
      })
      .slice(0, 10);
  }, [query, schools]);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setLoading(false);
      setResults(localResults);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/schools/login-options?q=${encodeURIComponent(normalized)}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal
        });
        const payload = (await response.json().catch(() => null)) as { items?: SchoolOption[] } | null;
        if (!response.ok || !payload?.items) {
          setResults(localResults);
          return;
        }

        setResults(payload.items.slice(0, 10));
      } catch {
        setResults(localResults);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [localResults, query]);

  function selectSchool(school: SchoolOption) {
    setSelectedSchool(school);
    setQuery(formatLabel(school));
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="schoolSlug" value={selectedSchool?.slug ?? ""} />

      <label className="block text-sm text-slate-700">
        Colegio
        <input
          type="text"
          required
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => setOpen(false), 120);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedSchool(null);
            setOpen(true);
          }}
          className="mt-1 h-11 w-full rounded-xl border border-brand-100 bg-white px-3 text-sm text-ink"
          placeholder="Escribe nombre, ciudad o provincia"
          autoComplete="off"
        />
      </label>

      {open ? (
        <div className="max-h-60 overflow-auto rounded-xl border border-brand-100 bg-white p-1">
          {loading ? <p className="px-2 py-2 text-xs text-slate-500">Buscando colegios...</p> : null}
          {!loading && results.length === 0 ? (
            <p className="px-2 py-2 text-xs text-slate-500">No encontramos colegios para esa búsqueda.</p>
          ) : null}
          {!loading
            ? results.map((school) => (
                <button
                  key={school.id}
                  type="button"
                  className="flex w-full items-start rounded-lg px-2 py-2 text-left hover:bg-brand-50"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectSchool(school);
                  }}
                >
                  <span className="text-sm text-ink">{formatLabel(school)}</span>
                </button>
              ))
            : null}
        </div>
      ) : null}

      <p className="text-xs text-slate-500">
        {selectedSchool
          ? `Seleccionado: ${selectedSchool.name}`
          : "Selecciona un colegio de la lista para habilitar acceso institucional."}
      </p>
    </div>
  );
}
