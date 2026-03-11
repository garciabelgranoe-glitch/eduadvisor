import { cn } from "@/lib/utils";

interface GoogleEmbedMapProps {
  query: string;
  title: string;
  className?: string;
  heightClassName?: string;
}

const FALLBACK_MESSAGE =
  "Mapa no disponible. Verificá la consulta o configurá NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY.";

export function GoogleEmbedMap({
  query,
  title,
  className,
  heightClassName = "h-56"
}: GoogleEmbedMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY?.trim() ?? "";
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return (
      <div
        className={cn(
          "rounded-xl border border-brand-100 bg-gradient-to-br from-brand-200 to-brand-50 p-4 text-sm text-brand-900",
          heightClassName,
          className
        )}
      >
        {FALLBACK_MESSAGE}
      </div>
    );
  }

  // Default to keyless Google Maps embed (no Maps Platform API dependency).
  const src = apiKey
    ? `https://www.google.com/maps/embed/v1/search?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(
        normalizedQuery
      )}&language=es&region=AR`
    : `https://maps.google.com/maps?output=embed&q=${encodeURIComponent(normalizedQuery)}&hl=es`;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-brand-100 bg-white", className)}>
      <iframe
        title={title}
        src={src}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className={cn("w-full", heightClassName)}
      />
    </div>
  );
}
