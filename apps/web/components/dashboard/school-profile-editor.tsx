"use client";

import { type ChangeEvent, type FormEvent, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormStatus } from "@/components/ui/form-status";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SchoolDashboardResponse } from "@/lib/api";

interface SchoolProfileEditorProps {
  school: SchoolDashboardResponse["school"];
  isEditable: boolean;
  isPremium: boolean;
}

const levels = [
  { value: "INICIAL", label: "Inicial" },
  { value: "PRIMARIA", label: "Primaria" },
  { value: "SECUNDARIA", label: "Secundaria" }
] as const;

export function SchoolProfileEditor({ school, isEditable, isPremium }: SchoolProfileEditorProps) {
  const [name, setName] = useState(school.name);
  const [description, setDescription] = useState(school.description ?? "");
  const [website, setWebsite] = useState(school.contacts.website ?? "");
  const [phone, setPhone] = useState(school.contacts.phone ?? "");
  const [email, setEmail] = useState(school.contacts.email ?? "");
  const [monthlyFeeEstimate, setMonthlyFeeEstimate] = useState(
    school.monthlyFeeEstimate ? String(school.monthlyFeeEstimate) : ""
  );
  const [studentsCount, setStudentsCount] = useState(school.studentsCount ? String(school.studentsCount) : "");
  const [selectedLevels, setSelectedLevels] = useState<Array<"INICIAL" | "PRIMARIA" | "SECUNDARIA">>(
    school.levels.filter((level): level is "INICIAL" | "PRIMARIA" | "SECUNDARIA" =>
      ["INICIAL", "PRIMARIA", "SECUNDARIA"].includes(level)
    )
  );
  const [logoUrl, setLogoUrl] = useState(school.media?.logoUrl ?? "");
  const [galleryText, setGalleryText] = useState((school.media?.galleryUrls ?? []).join("\n"));
  const logoInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return name.trim().length >= 2;
  }, [name]);

  function toggleLevel(level: "INICIAL" | "PRIMARIA" | "SECUNDARIA") {
    setSelectedLevels((current) =>
      current.includes(level) ? current.filter((item) => item !== level) : [...current, level]
    );
  }

  async function uploadMedia(kind: "logo" | "gallery", files: File[]) {
    if (!isEditable || !isPremium || files.length === 0) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    if (kind === "logo") {
      setUploadingLogo(true);
    } else {
      setUploadingGallery(true);
    }

    try {
      const formData = new FormData();
      formData.set("schoolId", school.id);
      formData.set("kind", kind);
      for (const file of files) {
        formData.append("files", file);
      }

      const response = await fetch("/api/schools/media/upload", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json().catch(() => null)) as { message?: string; urls?: string[] } | null;
      if (!response.ok) {
        setErrorMessage(payload?.message ?? "No se pudo subir el archivo.");
        return;
      }

      const uploadedUrls = payload?.urls ?? [];
      if (kind === "logo") {
        setLogoUrl(uploadedUrls[0] ?? "");
      } else {
        setGalleryText((current) => {
          const currentUrls = current
            .split("\n")
            .map((item) => item.trim())
            .filter((item) => item.length > 0);
          const merged = Array.from(new Set([...currentUrls, ...uploadedUrls]));
          return merged.slice(0, 12).join("\n");
        });
      }

      setSuccessMessage(payload?.message ?? "Archivo subido correctamente. Guarda el perfil para publicarlo.");
    } catch {
      setErrorMessage("No se pudo conectar para subir archivos.");
    } finally {
      setUploadingLogo(false);
      setUploadingGallery(false);
    }
  }

  async function handleLogoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await uploadMedia("logo", [file]);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  }

  async function handleGalleryFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }
    await uploadMedia("gallery", files);
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isEditable) {
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/schools/profile", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          schoolId: school.id,
          name,
          description: description.trim() ? description : null,
          website: website.trim() ? website : null,
          phone: phone.trim() ? phone : null,
          email: email.trim() ? email : null,
          monthlyFeeEstimate: monthlyFeeEstimate.trim() ? Number(monthlyFeeEstimate) : null,
          studentsCount: studentsCount.trim() ? Number(studentsCount) : null,
          levels: selectedLevels,
          ...(isPremium
            ? {
                logoUrl: logoUrl.trim() ? logoUrl.trim() : null,
                galleryUrls: galleryText
                  .split("\n")
                  .map((item) => item.trim())
                  .filter((item) => item.length > 0)
                  .slice(0, 12)
              }
            : {})
        })
      });

      const payload = (await response.json().catch(() => null)) as { message?: string; school?: { name?: string } } | null;

      if (!response.ok) {
        setErrorMessage(payload?.message ?? "No se pudo actualizar el perfil del colegio");
        return;
      }

      setSuccessMessage("Perfil actualizado correctamente. Recarga la página para ver todas las métricas recalculadas.");
    } catch {
      setErrorMessage("No se pudo conectar con el backend de colegios.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-4">
      <h2 className="font-display text-2xl text-ink">Editar perfil del colegio</h2>
      {!isEditable ? (
        <p className="text-sm text-slate-600">
          Esta sección se habilita cuando el perfil del colegio está en estado VERIFIED o PREMIUM.
        </p>
      ) : null}
      <form className="space-y-3" onSubmit={handleSubmit}>
        <fieldset className="space-y-3" disabled={!isEditable}>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Nombre">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                maxLength={180}
                required
              />
            </FormField>
            <FormField label="Sitio web">
              <Input
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="https://colegio.com"
              />
            </FormField>
          </div>

          <FormField label="Descripción">
            <Textarea
              className="min-h-24"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={5000}
            />
          </FormField>

          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Teléfono">
              <Input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </FormField>
            <FormField label="Email institucional">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </FormField>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FormField label="Cuota estimada mensual">
              <Input
                type="number"
                min={0}
                value={monthlyFeeEstimate}
                onChange={(event) => setMonthlyFeeEstimate(event.target.value)}
              />
            </FormField>
            <FormField label="Cantidad de alumnos">
              <Input
                type="number"
                min={0}
                value={studentsCount}
                onChange={(event) => setStudentsCount(event.target.value)}
              />
            </FormField>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-700">Niveles ofrecidos</p>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  type="button"
                  key={level.value}
                  onClick={() => toggleLevel(level.value)}
                  disabled={!isEditable}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    selectedLevels.includes(level.value)
                      ? "border-brand-700 bg-brand-700 text-white"
                      : "border-brand-100 bg-white text-slate-700"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-brand-700">Perfil visual premium</p>
              <p className="text-sm text-slate-700">
                Cargá el logo institucional y hasta 12 imágenes para mostrarlas en el perfil público.
              </p>
              {!isPremium ? (
                <p className="text-sm text-amber-800">
                  Disponible solo para colegios con Premium activo.
                </p>
              ) : null}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <FormField label="Logo institucional" hint="JPG, PNG, WEBP o AVIF. Máximo 8MB.">
                <input
                  ref={logoInputRef}
                  className="mt-1 block w-full rounded-xl border border-brand-100 bg-white px-3 py-2 text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-3 file:py-1.5 file:text-sm file:text-white"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleLogoFileChange}
                  disabled={!isPremium || !isEditable || uploadingLogo || loading}
                />
                {logoUrl ? (
                  <a
                    className="mt-2 inline-block text-xs text-brand-700 underline underline-offset-2"
                    href={logoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver logo cargado
                  </a>
                ) : null}
              </FormField>
              <FormField
                label="Imágenes institucionales"
                hint="Hasta 12 imágenes en total. Máximo 8MB por archivo."
              >
                <input
                  ref={galleryInputRef}
                  className="mt-1 block w-full rounded-xl border border-brand-100 bg-white px-3 py-2 text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-3 file:py-1.5 file:text-sm file:text-white"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  onChange={handleGalleryFileChange}
                  disabled={!isPremium || !isEditable || uploadingGallery || loading}
                />
                <span className="mt-1 block text-xs text-slate-500">
                  {galleryText
                    .split("\n")
                    .map((item) => item.trim())
                    .filter((item) => item.length > 0).length}{" "}
                  / 12 imágenes cargadas
                </span>
              </FormField>
            </div>
            <FormField label="Gestión avanzada de galería (una URL por línea)">
              <Textarea
                className="min-h-24"
                value={galleryText}
                onChange={(event) => setGalleryText(event.target.value)}
                placeholder={"https://.../foto-1.jpg\nhttps://.../foto-2.jpg"}
                disabled={!isPremium || !isEditable}
              />
            </FormField>
          </div>

          <FormStatus errorMessage={errorMessage} successMessage={successMessage} />

          <div className="flex justify-end">
            <Button type="submit" disabled={!isEditable || loading || !canSubmit}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </fieldset>
      </form>
    </Card>
  );
}
