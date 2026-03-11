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
    label: "Bilingüe en CABA",
    city: "Buenos Aires",
    level: "PRIMARIA",
    budget: "280000-420000",
    intent: "bilingüe inglés jornada completa"
  },
  {
    label: "Secundaria técnica",
    city: "Córdoba",
    level: "SECUNDARIA",
    budget: "180000-280000",
    intent: "orientación técnica STEM robótica"
  },
  {
    label: "Inicial con cuota accesible",
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
  if (!value) {
    return {
      feeMin: undefined,
      feeMax: undefined
    };
  }

  const [feeMin, feeMax] = value.split("-");
  return {
    feeMin: feeMin || undefined,
    feeMax: feeMax || undefined
  };
}

export function HeroSearch({ totalSchools, totalCities }: HeroSearchProps) {
  const router = useRouter();
  const [city, setCity] = useState("Buenos Aires");
  const [level, setLevel] = useState("PRIMARIA");
  const [budgetPreset, setBudgetPreset] = useState("180000-280000");
  const [schoolName, setSchoolName] = useState("");
  const [intent, setIntent] = useState("");

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

    if (cityValue) {
      params.set("city", cityValue.toLowerCase());
    }

    if (levelValue) {
      params.set("level", levelValue);
    }

    if (feeMin) {
      params.set("feeMin", feeMin);
    }

    if (feeMax) {
      params.set("feeMax", feeMax);
    }

    if (qValue) {
      params.set("q", qValue);
    }

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
    trackEvent("hero_scenario_selected", {
      label: scenario.label,
      city: scenario.city,
      level: scenario.level
    });
  }

  function toggleIntentTag(tag: string) {
    const tokens = intent
      .split(" ")
      .map((token) => token.trim())
      .filter(Boolean);
    const exists = tokens.some((token) => token.toLowerCase() === tag.toLowerCase());
    if (exists) {
      setIntent(tokens.filter((token) => token.toLowerCase() !== tag.toLowerCase()).join(" "));
      return;
    }
    setIntent([intent.trim(), tag].filter(Boolean).join(" ").trim());
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-amber-50 p-4 shadow-[0_20px_50px_rgba(31,92,77,0.12)] sm:p-5 md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-100 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-amber-200/50 blur-2xl" />
      <div className="relative space-y-5 md:space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Búsqueda inteligente</p>
        <h1 className="font-display max-w-4xl text-3xl leading-tight text-ink sm:text-4xl md:text-5xl">
          Encontrá el colegio ideal con un buscador guiado por intención real de cada familia.
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
          Combiná ubicación, nivel, presupuesto y prioridades educativas en una sola búsqueda.
        </p>

        <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
          <div className="rounded-2xl border border-brand-100 bg-white/80 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Catálogo</p>
            <p className="text-base font-semibold text-ink sm:text-lg">{totalSchoolsLabel} colegios activos</p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white/80 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Cobertura</p>
            <p className="text-base font-semibold text-ink sm:text-lg">{totalCitiesLabel} ciudades de todo el país</p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white/80 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Señales</p>
            <p className="text-base font-semibold text-ink sm:text-lg">Reviews, score y tendencias</p>
          </div>
        </div>

        <form
          className="space-y-3 rounded-2xl border border-brand-100 bg-white/90 p-3 shadow-[0_12px_35px_rgba(15,23,42,0.08)] sm:p-4 md:p-5"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-3 lg:grid-cols-5">
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Ciudad
              </label>
              <Input
                list="hero-city-hints"
                placeholder="Ciudad o barrio"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="mt-1"
              />
              <datalist id="hero-city-hints">
                {topCityHints.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>

            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Nivel
              </label>
              <Select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="mt-1 bg-gradient-to-r from-slate-50 to-white font-semibold"
              >
                {levelOptions.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Presupuesto
              </label>
              <Select
                value={budgetPreset}
                onChange={(event) => setBudgetPreset(event.target.value)}
                className="mt-1 bg-gradient-to-r from-slate-50 to-white font-semibold"
              >
                {budgetOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Nombre de colegio o palabra clave
              </label>
              <Input
                placeholder="Ej: San Andrés, bilingüe, jornada completa"
                value={schoolName}
                onChange={(event) => setSchoolName(event.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Prioridades educativas
            </label>
            <Input
              placeholder="Ej: inglés intensivo, deportes, programación"
              value={intent}
              onChange={(event) => setIntent(event.target.value)}
            />
          </div>

          <div className="space-y-2 rounded-xl border border-brand-100 bg-brand-50/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
              Sugerencias opcionales
            </p>
            <p className="text-xs text-slate-500">
              Estos botones son solo de orientación y te ayudan a completar más rápido la búsqueda.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {topIntentTags.map((tag) => {
                const isActive = intent.toLowerCase().includes(tag.toLowerCase());
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleIntentTag(tag)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-brand-200 bg-white text-brand-800 hover:bg-brand-100"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 border-t border-brand-100 pt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
              Ejemplos listos para probar
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {quickScenarios.map((scenario) => (
                <button
                  key={scenario.label}
                  type="button"
                  onClick={() => applyScenario(scenario)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50"
                >
                  {scenario.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              className="h-11 w-full min-w-[10rem] px-5 sm:w-auto"
              type="submit"
              aria-label={HERO_PRIMARY_CTA_LABEL}
            >
              <span>{HERO_PRIMARY_CTA_LABEL}</span>
            </Button>
            <Button asChild className="h-11 w-full px-5 sm:w-auto" variant="secondary">
              <Link href="/matches">Probar matching IA</Link>
            </Button>
            <Button asChild className="h-11 w-full px-5 sm:w-auto" variant="ghost">
              <Link href="/rankings">Ver rankings por ciudad</Link>
            </Button>
            <p className="text-xs text-slate-500">Ajustás filtros luego en resultados y comparador.</p>
          </div>
        </form>
      </div>
    </section>
  );
}
