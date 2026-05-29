"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormStatus } from "@/components/ui/form-status";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const levels = [
  { value: "INICIAL", label: "Inicial" },
  { value: "PRIMARIA", label: "Primaria" },
  { value: "SECUNDARIA", label: "Secundaria" }
] as const;

interface SchoolData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthlyFeeEstimate: number | null;
  studentsCount: number | null;
  levels: string[];
  location: { city: string; province: string; addressLine: string | null };
  contacts: { website: string | null; phone: string | null; email: string | null };
  media: { logoUrl: string | null; galleryUrls: string[] } | null;
  profile: { status: string; label: string };
}

export default function AdminSchoolEditPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [studentsCount, setStudentsCount] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState("");

  useEffect(() => {
    fetch(`/api/schools/${slug}`)
      .then((r) => r.json())
      .then((data: SchoolData) => {
        setSchool(data);
        setName(data.name);
        setDescription(data.description ?? "");
        setWebsite(data.contacts.website ?? "");
        setPhone(data.contacts.phone ?? "");
        setEmail(data.contacts.email ?? "");
        setMonthlyFee(data.monthlyFeeEstimate ? String(data.monthlyFeeEstimate) : "");
        setStudentsCount(data.studentsCount ? String(data.studentsCount) : "");
        setSelectedLevels(data.levels);
        setLogoUrl(data.media?.logoUrl ?? "");
        setGalleryUrls((data.media?.galleryUrls ?? []).join("\n"));
      })
      .catch(() => setError("No se pudo cargar el colegio."))
      .finally(() => setLoading(false));
  }, [slug]);

  function toggleLevel(level: string) {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  }

  async function handleSave() {
    if (!school) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/schools/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          schoolId: school.id,
          name: name.trim(),
          description: description.trim() || null,
          website: website.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          monthlyFeeEstimate: monthlyFee.trim() ? Number(monthlyFee) : null,
          studentsCount: studentsCount.trim() ? Number(studentsCount) : null,
          levels: selectedLevels,
          logoUrl: logoUrl.trim() || null,
          galleryUrls: galleryUrls
            .split("\n")
            .map((u) => u.trim())
            .filter(Boolean)
            .slice(0, 12)
        })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message ?? "No se pudo guardar.");
        return;
      }
      setSuccess("Perfil actualizado correctamente.");
    } catch {
      setError("No se pudo conectar con el backend.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="ea-kicker">Edición de colegio</p>
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="space-y-4">
        <p className="ea-kicker">Edición de colegio</p>
        <Card className="border-red-200 bg-red-50/40 text-sm text-red-700">
          No se encontró el colegio con slug <code>{slug}</code>.
        </Card>
        <Button asChild variant="ghost">
          <Link href="/admin/schools">← Volver a colegios</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="ea-kicker">Edición admin</p>
          <h1 className="font-display text-3xl text-ink">{school.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {school.location.city}, {school.location.province} ·{" "}
            <span className="font-medium text-brand-700">{school.profile.label}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/ar/${school.location.province}/${school.location.city}/colegios/${slug}`} target="_blank">
              Ver perfil público →
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/schools">← Volver</Link>
          </Button>
        </div>
      </div>

      <FormStatus errorMessage={error} successMessage={success} />

      {/* Datos básicos */}
      <Card className="space-y-4 border-brand-100">
        <p className="ea-kicker">Datos básicos</p>

        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Nombre del colegio">
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={180} />
          </FormField>
          <FormField label="Cuota mensual estimada (ARS)">
            <Input
              type="number"
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              placeholder="Ej: 280000"
            />
          </FormField>
        </div>

        <FormField label="Descripción">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción institucional del colegio..."
            className="min-h-[100px]"
          />
        </FormField>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Niveles educativos</p>
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => {
              const active = selectedLevels.includes(level.value);
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => toggleLevel(level.value)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                    active
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-brand-200 bg-white text-brand-800 hover:bg-brand-50"
                  }`}
                >
                  {level.label}
                </button>
              );
            })}
          </div>
        </div>

        <FormField label="Cantidad de alumnos">
          <Input
            type="number"
            value={studentsCount}
            onChange={(e) => setStudentsCount(e.target.value)}
            placeholder="Ej: 450"
          />
        </FormField>
      </Card>

      {/* Contacto */}
      <Card className="space-y-4 border-brand-100">
        <p className="ea-kicker">Contacto</p>
        <div className="grid gap-3 md:grid-cols-3">
          <FormField label="Sitio web">
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
            />
          </FormField>
          <FormField label="Teléfono">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej: 11-4444-5555" />
          </FormField>
          <FormField label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@colegio.edu.ar" />
          </FormField>
        </div>
      </Card>

      {/* Media */}
      <Card className="space-y-4 border-brand-100">
        <p className="ea-kicker">Imágenes</p>
        <FormField label="URL del logo">
          <Input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
          />
        </FormField>
        {logoUrl && (
          <img src={logoUrl} alt="Logo preview" className="h-16 w-16 rounded-xl object-contain border border-brand-100" />
        )}
        <FormField label="URLs de galería (una por línea, máx 12)">
          <Textarea
            value={galleryUrls}
            onChange={(e) => setGalleryUrls(e.target.value)}
            placeholder={"https://imagen1.jpg\nhttps://imagen2.jpg"}
            className="min-h-[100px] font-mono text-xs"
          />
        </FormField>
      </Card>

      {/* Guardar */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="px-8">
          {saving ? "Guardando..." : "💾 Guardar cambios"}
        </Button>
        <Button asChild variant="ghost">
          <Link href={`/ar/${school.location.province}/${school.location.city}/colegios/${slug}`} target="_blank">
            Ver perfil público →
          </Link>
        </Button>
      </div>
    </div>
  );
}
