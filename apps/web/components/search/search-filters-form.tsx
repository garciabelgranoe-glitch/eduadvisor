"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { FormShell } from "@/components/ui/form-shell";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { SchoolSearchParams } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

interface SearchFiltersFormProps {
  current: SchoolSearchParams;
}

const FILTER_PREFS_STORAGE_KEY = "eduadvisor.search.filters.v2";

const filterPresets = [
  {
    label: "Bilingüe + jornada completa",
    values: {
      q: "bilingüe jornada completa",
      level: "PRIMARIA",
      ratingMin: "4",
      feeMax: ""
    }
  },
  {
    label: "Secundaria con alta respuesta",
    values: {
      q: "",
      level: "SECUNDARIA",
      ratingMin: "3.5",
      feeMax: ""
    }
  },
  {
    label: "Inicial cuota accesible",
    values: {
      q: "",
      level: "INICIAL",
      ratingMin: "",
      feeMax: "180000"
    }
  }
] as const;

export function SearchFiltersForm({ current }: SearchFiltersFormProps) {
  const [q, setQ] = useState(current.q ?? "");
  const [city, setCity] = useState(current.city ?? "");
  const [level, setLevel] = useState(current.level ?? "");
  const [feeMax, setFeeMax] = useState(current.feeMax ?? "");
  const [ratingMin, setRatingMin] = useState(current.ratingMin ?? "");
  const [sortBy, setSortBy] = useState<NonNullable<SchoolSearchParams["sortBy"]>>(current.sortBy ?? "relevance");
  const [sortOrder, setSortOrder] = useState<NonNullable<SchoolSearchParams["sortOrder"]>>(current.sortOrder ?? "desc");

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; clear: () => void }> = [];
    if (q.trim()) {
      chips.push({
        key: "q",
        label: `Búsqueda: ${q.trim()}`,
        clear: () => {
          setQ("");
          trackEvent("search_filter_chip_removed", { source: "search_page", filterKey: "q" });
        }
      });
    }
    if (city.trim()) {
      chips.push({
        key: "city",
        label: `Ciudad: ${city.trim()}`,
        clear: () => {
          setCity("");
          trackEvent("search_filter_chip_removed", { source: "search_page", filterKey: "city" });
        }
      });
    }
    if (level.trim()) {
      const levelMap: Record<string, string> = { INICIAL: "Inicial", PRIMARIA: "Primaria", SECUNDARIA: "Secundaria" };
      chips.push({
        key: "level",
        label: `Nivel: ${levelMap[level] ?? level}`,
        clear: () => {
          setLevel("");
          trackEvent("search_filter_chip_removed", { source: "search_page", filterKey: "level" });
        }
      });
    }
    if (feeMax.trim()) {
      chips.push({
        key: "feeMax",
        label: `Cuota máx: $${Number(feeMax).toLocaleString("es-AR")}`,
        clear: () => {
          setFeeMax("");
          trackEvent("search_filter_chip_removed", { source: "search_page", filterKey: "feeMax" });
        }
      });
    }
    if (ratingMin.trim()) {
      chips.push({
        key: "ratingMin",
        label: `Rating mín: ${ratingMin}`,
        clear: () => {
          setRatingMin("");
          trackEvent("search_filter_chip_removed", { source: "search_page", filterKey: "ratingMin" });
        }
      });
    }
    return chips;
  }, [city, feeMax, level, q, ratingMin]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    trackEvent("search_filters_applied", {
      source: "search_page",
      q: formData.get("q")?.toString().trim() || null,
      city: formData.get("city")?.toString().trim() || null,
      level: formData.get("level")?.toString().trim() || null,
      feeMax: formData.get("feeMax")?.toString().trim() || null,
      ratingMin: formData.get("ratingMin")?.toString().trim() || null,
      sortBy: formData.get("sortBy")?.toString().trim() || null
    });
  }

  function applyPreset(preset: (typeof filterPresets)[number]) {
    setQ(preset.values.q);
    setLevel(preset.values.level);
    setRatingMin(preset.values.ratingMin);
    setFeeMax(preset.values.feeMax);
    trackEvent("search_preset_applied", {
      source: "search_page",
      preset: preset.label
    });
  }

  function savePreferences() {
    const payload = { q, city, level, feeMax, ratingMin, sortBy, sortOrder };
    window.localStorage.setItem(FILTER_PREFS_STORAGE_KEY, JSON.stringify(payload));
    trackEvent("search_preferences_saved", { source: "search_page" });
  }

  function loadPreferences() {
    const raw = window.localStorage.getItem(FILTER_PREFS_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<Record<"q" | "city" | "level" | "feeMax" | "ratingMin" | "sortBy" | "sortOrder", string>>;
      setQ(parsed.q ?? "");
      setCity(parsed.city ?? "");
      setLevel(parsed.level ?? "");
      setFeeMax(parsed.feeMax ?? "");
      setRatingMin(parsed.ratingMin ?? "");
      if (parsed.sortBy === "relevance" || parsed.sortBy === "leadIntentScore" || parsed.sortBy === "name" || parsed.sortBy === "monthlyFeeEstimate" || parsed.sortBy === "createdAt") {
        setSortBy(parsed.sortBy);
      } else {
        setSortBy("relevance");
      }
      if (parsed.sortOrder === "asc" || parsed.sortOrder === "desc") {
        setSortOrder(parsed.sortOrder);
      } else {
        setSortOrder("desc");
      }
      trackEvent("search_preferences_loaded", { source: "search_page" });
    } catch {
      // No bloquear UX por preferencias corruptas.
    }
  }

  return (
    <FormShell title="Filtrar resultados" description="Componé una búsqueda inteligente y guardá tus preferencias.">
      <form className="space-y-3" action="/search" method="get" onSubmit={handleSubmit}>
        {current.country ? <input type="hidden" name="country" value={current.country} /> : null}
        {current.province ? <input type="hidden" name="province" value={current.province} /> : null}
        {current.limit ? <input type="hidden" name="limit" value={current.limit} /> : null}
        <div className="space-y-2 rounded-xl border border-brand-100 bg-brand-50/35 p-3">
          <p className="text-xs uppercase tracking-[0.14em] text-brand-700">Presets familiares</p>
          <div className="flex flex-wrap gap-2">
            {filterPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 transition hover:bg-brand-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        <FormField label="Búsqueda">
          <Input name="q" placeholder="Nombre o palabra clave" value={q} onChange={(event) => setQ(event.target.value)} />
        </FormField>
        <FormField label="Ciudad">
          <Input name="city" placeholder="Ej: Mendoza" value={city} onChange={(event) => setCity(event.target.value)} />
        </FormField>
        <FormField label="Nivel">
          <Select name="level" value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="">Todos los niveles</option>
            <option value="INICIAL">Inicial</option>
            <option value="PRIMARIA">Primaria</option>
            <option value="SECUNDARIA">Secundaria</option>
          </Select>
        </FormField>
        <FormField label="Cuota máxima">
          <Input name="feeMax" placeholder="Ej: 280000" value={feeMax} onChange={(event) => setFeeMax(event.target.value)} />
        </FormField>
        <FormField label="Rating mínimo">
          <Input
            name="ratingMin"
            placeholder="Ej: 4"
            value={ratingMin}
            onChange={(event) => setRatingMin(event.target.value)}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Ordenar por">
            <Select
              name="sortBy"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as NonNullable<SchoolSearchParams["sortBy"]>)}
            >
              <option value="relevance">Relevancia</option>
              <option value="leadIntentScore">Alta respuesta</option>
              <option value="name">Nombre</option>
              <option value="monthlyFeeEstimate">Cuota</option>
              <option value="createdAt">Más recientes</option>
            </Select>
          </FormField>
          <FormField label="Dirección">
            <Select
              name="sortOrder"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as NonNullable<SchoolSearchParams["sortOrder"]>)}
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </Select>
          </FormField>
        </div>
        {activeChips.length > 0 ? (
          <div className="space-y-2 rounded-xl border border-brand-100 bg-white p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Filtros activos</p>
            <div className="flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 transition hover:bg-brand-100"
                >
                  {chip.label} x
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button className="flex-1" size="lg" type="submit">
            Aplicar filtros
          </Button>
          <Button type="button" variant="ghost" onClick={savePreferences}>
            Guardar preferencias
          </Button>
          <Button type="button" variant="ghost" onClick={loadPreferences}>
            Cargar guardado
          </Button>
        </div>
      </form>
    </FormShell>
  );
}
