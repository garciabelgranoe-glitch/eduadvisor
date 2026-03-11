import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PremiumMediaShowcaseProps {
  schoolName: string;
  schoolSlug: string;
  isPremium: boolean;
  canClaimProfile: boolean;
  imageUrls?: string[];
}

export function PremiumMediaShowcase({
  schoolName,
  schoolSlug,
  isPremium,
  canClaimProfile,
  imageUrls = []
}: PremiumMediaShowcaseProps) {
  const upgradeHref = canClaimProfile
    ? `/para-colegios?flow=claim&school=${encodeURIComponent(schoolSlug)}`
    : `/para-colegios?school=${encodeURIComponent(schoolSlug)}`;

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">Perfil visual</p>
        <h2 className="text-xl font-semibold text-ink">Imágenes institucionales</h2>
        <p className="text-sm text-slate-600">
          Mostrá campus, aulas y espacios clave para mejorar confianza y conversión de familias.
        </p>
      </div>

      {isPremium ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-brand-100 bg-paper p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.14em] text-slate-500">Galería del colegio</p>
            {imageUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {imageUrls.slice(0, 12).map((url, index) => (
                  <Image
                    key={`premium-media-slot-${index + 1}`}
                    src={url}
                    alt={`Imagen institucional ${index + 1} de ${schoolName}`}
                    width={640}
                    height={480}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="aspect-[4/3] rounded-lg border border-brand-200 bg-white object-cover"
                    loading="lazy"
                    unoptimized
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`premium-media-slot-${index + 1}`}
                    className="aspect-[4/3] rounded-lg border border-dashed border-brand-300 bg-white"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-2 text-sm">
            <p className="text-slate-700">{schoolName} puede gestionar este contenido desde su dashboard premium.</p>
            <Button asChild>
              <Link href={`/ingresar?next=/school-dashboard&school=${encodeURIComponent(schoolSlug)}`}>
                Gestionar contenido visual
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-brand-100">
            <div className="rounded-2xl bg-paper p-4">
              <p className="mb-3 text-xs uppercase tracking-[0.14em] text-slate-500">Galería del colegio</p>
              <div className="grid grid-cols-2 gap-2 blur-[1.6px] md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`locked-media-slot-${index + 1}`}
                    className="aspect-[4/3] rounded-lg border border-dashed border-brand-300 bg-white"
                  />
                ))}
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-white/45 p-4">
              <div className="max-w-lg rounded-xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/95 px-4 py-3 text-center text-sm text-amber-900 shadow-[0_10px_24px_rgba(146,92,36,0.1)]">
                Para activar logo y galería de fotos, este colegio debe activar el modo premium.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white/75 px-3 py-2.5 text-sm">
            <div className="space-y-0.5">
              <p className="font-medium text-slate-700">¿Sos representante de {schoolName}?</p>
              <p className="text-slate-600">Desbloqueá logo, galería completa y mejor presencia en el perfil.</p>
            </div>
            <Button asChild className="h-9 rounded-lg bg-amber-100 px-4 text-amber-900 hover:bg-amber-200">
              <Link href={upgradeHref as never}>Activar premium</Link>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
