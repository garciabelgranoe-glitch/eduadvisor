"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { trackEvent } from "@/lib/analytics";

const levelOptions = [
  { label: "Todos los niveles", value: "" },
  { label: "Inicial", value: "INICIAL" },
  { label: "Primaria", value: "PRIMARIA" },
  { label: "Secundaria", value: "SECUNDARIA" }
];

const budgetOptions = [
  { label: "Sin tope de cuota", value: "" },
  { label: "Hasta $180.000", value: "0-180000" },
  { label: "$180.000 a $280.000", value: "180000-280000" },
  { label: "$280.000 a $420.000", value: "280000-420000" },
  { label: "Más de $420.000", value: "420000-999999" }
];

const topCityHints = ["Buenos Aires", "Córdoba", "Mendoza", "Rosario", "La Plata", "Mar del Plata"];

const topIntentTags = [
  "bilingüe",
  "jornada completa",
  "deportes",
  "programación",
  "apoyo personalizado",
  "orientación internacional"
];

const HERO_PRIMARY_CTA_LABEL = "Buscar colegios";

type Scenario = {
  label: string;
  city: string;
  level: string;
  budget: string;
  schoolName?: string;
  intent: string;
};

const quickScenarios: Scenario[] = [
  {
    label: "🌍 Bilingüe en CABA",
    city: "Buenos Aires",
    level: "PRIMARIA",
    budget: "280000-420000",
    intent: "bilingüe inglés jornada completa"
  },
  {
    label: "⚙️ Secundaria técnica",
    city: "Córdoba",
    level: "SECUNDARIA",
    budget: "180000-280000",
    intent: "orientación técnica STEM robótica"
  },
  {
    label: "🌱 Inicial accesible",
    city: "Mendoza",
    level: "INICIAL",
    budget: "0-180000",
    intent: "acompañamiento familiar y jornada simple"
  }
];

interface HeroSearchProps {
  totalSchools: number;
  totalCities: number;
}

function decodeBudgetPreset(value: string) {
  if (!value) return { feeMin: undefined, feeMax: undefined };
  const [feeMin, feeMax] = value.split("-");
  return { feeMin: feeMin || undefined, feeMax: feeMax || undefined };
}

export function HeroSearch({ totalSchools, totalCities }: HeroSearchProps) {
  const router = useRouter();
  const [city, setCity] = useState("Buenos Aires");
  const [level, setLevel] = useState("PRIMARIA");
  const [budgetPreset, setBudgetPreset] = useState("180000-280000");
  const [schoolName, setSchoolName] = useState("");
  const [intent, setIntent] = useState("");
  const [showIntentTags, setShowIntentTags] = useState(false);

  const totalSchoolsLabel = useMemo(() => totalSchools.toLocaleString("es-AR"), [totalSchools]);
  const totalCitiesLabel = useMemo(() => totalCities.toLocaleString("es-AR"), [totalCities]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const cityValue = city.trim();
    const levelValue = level.trim();
    const { feeMin, feeMax } = decodeBudgetPreset(budgetPreset);
    const schoolNameValue = schoolName.trim();
    const intentValue = intent.trim();
    const qValue = [schoolNameValue, intentValue].filter(Boolean).join(" ").trim();

    if (cityValue) params.set("city", cityValue.toLowerCase());
    if (levelValue) params.set("level", levelValue);
    if (feeMin) params.set("feeMin", feeMin);
    if (feeMax) params.set("feeMax", feeMax);
    if (qValue) params.set("q", qValue);

    trackEvent("search_submitted", {
      source: "hero_search",
      city: cityValue || null,
      level: levelValue || null,
      hasFeeMin: Boolean(feeMin),
      hasFeeMax: Boolean(feeMax),
      hasSchoolNameQuery: Boolean(schoolNameValue),
      hasIntentQuery: Boolean(intentValue)
    });

    router.push(`/search?${params.toString()}`);
  }

  function applyScenario(scenario: Scenario) {
    setCity(scenario.city);
    setLevel(scenario.level);
    setBudgetPreset(scenario.budget);
    setSchoolName(scenario.schoolName ?? "");
    setIntent(scenario.intent);
    setShowIntentTags(true);
    trackEvent("hero_scenario_selected", {
      label: scenario.label,
      city: scenario.city,
      level: scenario.level
    });
  }

  function toggleIntentTag(tag: string) {
    const tokens = intent
      .split(" ")
      .map((t) => t.trim())
      .filter(Boolean);
    const exists = tokens.some((t) => t.toLowerCase() === tag.toLowerCase());
    if (exists) {
      setIntent(tokens.filter((t) => t.toLowerCase() !== tag.toLowerCase()).join(" "));
    } else {
      setIntent([intent.trim(), tag].filter(Boolean).join(" ").trim());
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-amber-50 shadow-[0_20px_50px_rgba(31,92,77,0.12)]">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-amber-200/50 blur-3xl" />

      <div className="relative px-5 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10 md:px-10 md:pt-12">

        {/* Headline block */}
        <div className="mb-8 max-w-3xl space-y-4">
          <h1 className="font-display text-3xl leading-[1.1] tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-6xl">
            Encontrá el colegio
            <br />
            <span className="text-brand-700">que tu hijo merece.</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Comparamos colegios por zona, nivel y presupuesto para que tomés la mejor
            decisión para tu familia — con datos reales.
          </p>

          {/* Social proof strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-sm font-semibold text-ink">
                {totalSchoolsLabel} colegios
              </span>
              <span className="text-sm text-slate-500">en {totalCitiesLabel} ciudades</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-sm text-slate-500">Reviews verificadas · Score propio · Tendencias de cuota</span>
            </div>
          </div>
        </div>

        {/* Search form */}
        <form
          className="space-y-3 rounded-2xl border border-brand-100 bg-white/95 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-5"
          onSubmit={handleSubmit}
        >
          {/* Quick scenarios */}
          <div className="flex flex-wrap gap-2 pb-1">
            <span className="self-center text-xs font-semibold uppercase tracking-widest text-slate-400">
              Empezar con
            </span>
            {quickScenarios.map((scenario) => (
              <button
                key={scenario.label}
                type="button"
                onClick={() => applyScenario(scenario)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
              >
                {scenario.label}
              </button>
            ))}
          </div>

          <div className="h-px bg-brand-100" />

          {/* Primary filters row */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Ciudad
              </label>
              <Input
                list="hero-city-hints"
                placeholder="Ciudad o barrio"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <datalist id="hero-city-hints">
                {topCityHints.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Nivel
              </label>
              <Select value={level} onChange={(e) => setLevel(e.target.value)}>
                {levelOptions.map((opt) => (
                  <option key={opt.value || "all"} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Presupuesto
              </label>
              <Select value={budgetPreset} onChange={(e) => setBudgetPreset(e.target.value)}>
                {budgetOptions.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                Nombre o palabra clave
              </label>
              <Input
                placeholder="Ej: San Andrés, bilingüe…"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
          </div>

          {/* Intent row — collapsible */}
          <div>
            {showIntentTags ? (
              <div className="space-y-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Prioridades educativas
                </label>
                <Input
                  placeholder="Ej: inglés intensivo, deportes, programación"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {topIntentTags.map((tag) => {
                    const isActive = intent.toLowerCase().includes(tag.toLowerCase());
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleIntentTag(tag)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          isActive
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-brand-200 bg-white text-brand-800 hover:bg-brand-50"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowIntentTags(true)}
                className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
              >
                + Agregar prioridades educativas (bilingüe, deportes, etc.)
              </button>
            )}
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button className="h-11 w-full px-8 sm:w-auto" type="submit" aria-label={HERO_PRIMARY_CTA_LABEL}>
              {HERO_PRIMARY_CTA_LABEL}
            </Button>
            <Button asChild className="h-11 w-full px-6 sm:w-auto" variant="secondary">
              <Link href="/matches">Matching con IA →</Link>
            </Button>
            <p className="ml-auto hidden text-xs text-slate-400 sm:block">
              Podés ajustar filtros en los resultados.
            </p>
          </div>
        </form>

      </div>
    </section>
  );
}
