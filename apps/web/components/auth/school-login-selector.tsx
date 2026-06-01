"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetchControllerRef = useRef<AbortController | null>(null);

  const localResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length === 0) return schools.slice(0, 10);
    return schools
      .filter((school) => {
        const text = `${school.name} ${school.city} ${school.province ?? ""}`.toLowerCase();
        return text.includes(normalized);
      })
      .slice(0, 10);
  }, [query, schools]);

  // Búsqueda en API con debounce
  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setLoading(false);
      setResults(localResults);
      return;
    }

    fetchControllerRef.current?.abort();
    const ctrl = new AbortController();
    fetchControllerRef.current = ctrl;

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/schools/login-options?q=${encodeURIComponent(normalized)}`, {
          method: "GET",
          cache: "no-store",
          signal: ctrl.signal
        });
        const payload = (await response.json().catch(() => null)) as { items?: SchoolOption[] } | null;
        if (!ctrl.signal.aborted) {
          setResults(payload?.items?.slice(0, 10) ?? localResults);
        }
      } catch {
        if (!ctrl.signal.aborted) setResults(localResults);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      ctrl.abort();
    };
  }, [query, localResults]);

  // Cerrar dropdown al clickear fuera del contenedor
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  function selectSchool(school: SchoolOption) {
    setSelectedSchool(school);
    setQuery(formatLabel(school));
    setOpen(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setSelectedSchool(null);
    setOpen(true);
  }

  function handleInputFocus() {
    setOpen(true);
  }

  function handleClear() {
    setSelectedSchool(null);
    setQuery("");
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const showDropdown = open && !selectedSchool;

  return (
    <div ref={containerRef} className="space-y-1">
      {/* Input visible + hidden para el form */}
      <input type="hidden" name="schoolSlug" value={selectedSchool?.slug ?? ""} />

      <p className="text-sm font-medium text-slate-700">Colegio</p>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={handleInputFocus}
          onChange={handleInputChange}
          className="h-11 w-full rounded-xl border border-brand-100 bg-white px-3 pr-16 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
          placeholder="Escribí el nombre del colegio..."
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {selectedSchool && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-slate-700"
          >
            Cambiar
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="relative z-50">
          <div className="absolute left-0 right-0 top-0 max-h-60 overflow-auto rounded-xl border border-brand-100 bg-white shadow-xl">
            {loading && (
              <p className="px-3 py-2 text-xs text-slate-500">Buscando colegios...</p>
            )}
            {!loading && results.length === 0 && (
              <p className="px-3 py-2 text-xs text-slate-500">
                No encontramos colegios para esa búsqueda.
              </p>
            )}
            {!loading && results.map((school) => (
              <button
                key={school.id}
                type="button"
                className="flex w-full flex-col px-3 py-2.5 text-left hover:bg-brand-50 active:bg-brand-100"
                onPointerDown={(e) => {
                  e.preventDefault();
                  selectSchool(school);
                }}
              >
                <span className="text-sm font-medium text-ink">{school.name}</span>
                <span className="text-xs text-slate-500">
                  {school.city}{school.province ? `, ${school.province}` : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        {selectedSchool
          ? <span className="font-medium text-brand-700">✓ {selectedSchool.name} seleccionado</span>
          : "Seleccioná un colegio de la lista para continuar."}
      </p>
    </div>
  );
}
