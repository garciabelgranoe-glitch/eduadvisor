"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type ImportStatus = "idle" | "loading" | "success" | "error";

const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Córdoba",
  "Santa Fe",
  "Mendoza",
  "Tucumán",
  "Salta",
  "Misiones",
  "Entre Ríos",
  "Chaco",
  "Corrientes",
  "Santiago del Estero",
  "San Juan",
  "Jujuy",
  "Río Negro",
  "Neuquén",
  "Formosa",
  "Chubut",
  "San Luis",
  "Catamarca",
  "La Rioja",
  "La Pampa",
  "Santa Cruz",
  "Tierra del Fuego"
];

export default function ImportRunsPage() {
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [maxPages, setMaxPages] = useState("3");
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [result, setResult] = useState<string | null>(null);

  async function handleImport() {
    setStatus("loading");
    setResult(null);

    try {
      const body: Record<string, unknown> = {
        source: "GOOGLE_PLACES",
        countryCode: "AR",
        maxPages: Number(maxPages),
        fetchDetails: true
      };
      if (province.trim()) body.province = province.trim();
      if (city.trim()) body.city = city.trim();

      const res = await fetch("/api/admin/import-runs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus("error");
        setResult(data?.message ?? `Error ${res.status}`);
        return;
      }

      setStatus("success");
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setStatus("error");
      setResult("No se pudo conectar con el backend.");
    }
  }

  async function handleReindex() {
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/admin/search-reindex", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus("error");
        setResult(data?.message ?? `Error ${res.status}`);
        return;
      }
      setStatus("success");
      setResult(JSON.stringify(data, null, 2));
    } catch {
      setStatus("error");
      setResult("No se pudo conectar con el backend.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="ea-kicker">Importación de datos</p>
        <h1 className="font-display text-3xl text-ink">Importar colegios</h1>
        <p className="mt-1 text-sm text-slate-600">
          Importa colegios desde Google Places para Argentina. Podés filtrar por provincia o ciudad.
        </p>
      </div>

      <Card className="space-y-5 border-brand-100">
        <p className="font-semibold text-ink">Configuración de importación</p>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Provincia (opcional)">
            <Select value={province} onChange={(e) => setProvince(e.target.value)}>
              <option value="">Todas las provincias</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Ciudad (opcional)">
            <Input
              placeholder="Ej: Palermo, Córdoba..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </FormField>

          <FormField label="Páginas máximas (1-5)">
            <Select value={maxPages} onChange={(e) => setMaxPages(e.target.value)}>
              <option value="1">1 página (~20 colegios)</option>
              <option value="2">2 páginas (~40 colegios)</option>
              <option value="3">3 páginas (~60 colegios)</option>
              <option value="4">4 páginas (~80 colegios)</option>
              <option value="5">5 páginas (~100 colegios)</option>
            </Select>
          </FormField>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-sm text-amber-800">
          ⚠️ Cada página consume créditos de la Google Places API. Empezá con 1-2 páginas para validar.
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleImport}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Importando..." : "🚀 Iniciar importación"}
          </Button>
        </div>
      </Card>

      <Card className="space-y-4 border-brand-100">
        <p className="font-semibold text-ink">Reindexar búsqueda</p>
        <p className="text-sm text-slate-600">
          Después de importar colegios, reindexá Meilisearch para que aparezcan en el buscador.
        </p>
        <Button
          variant="secondary"
          onClick={handleReindex}
          disabled={status === "loading"}
        >
          🔍 Reindexar Meilisearch
        </Button>
      </Card>

      {result && (
        <Card className={`border ${status === "success" ? "border-emerald-200 bg-emerald-50/40" : "border-red-200 bg-red-50/40"}`}>
          <p className="text-xs font-bold uppercase tracking-widest mb-2 ${status === 'success' ? 'text-emerald-700' : 'text-red-700'}">
            {status === "success" ? "✓ Resultado" : "✗ Error"}
          </p>
          <pre className="text-xs text-slate-700 overflow-auto max-h-64 whitespace-pre-wrap">{result}</pre>
        </Card>
      )}
    </div>
  );
}
