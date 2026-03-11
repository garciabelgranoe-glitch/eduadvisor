import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getSeoCityBySlug } from "@/lib/api";
import { buildNoIndexMetadata, citySchoolsPath, getCitySlugFromLandingSegment } from "@/lib/seo";

export const revalidate = 900;

interface LegacyCityLandingPageProps {
  params: {
    cityLanding: string;
  };
}

export async function generateMetadata({ params }: LegacyCityLandingPageProps): Promise<Metadata> {
  const citySlug = getCitySlugFromLandingSegment(params.cityLanding);

  if (!citySlug) {
    return buildNoIndexMetadata({
      title: "Landing legacy no disponible",
      description: "La ruta solicitada no existe.",
      canonicalPath: "/ar"
    });
  }

  const cityLanding = await getSeoCityBySlug(citySlug);

  if (!cityLanding) {
    return buildNoIndexMetadata({
      title: "Landing legacy no disponible",
      description: "La ruta solicitada no existe.",
      canonicalPath: "/ar"
    });
  }

  return buildNoIndexMetadata({
    title: `Migrado a ${cityLanding.city.name}`,
    description: "Ruta legacy consolidada a arquitectura geo canónica.",
    canonicalPath: citySchoolsPath(cityLanding.city.provinceSlug, cityLanding.city.slug)
  });
}

export default async function LegacyCityLandingPage({ params }: LegacyCityLandingPageProps) {
  const citySlug = getCitySlugFromLandingSegment(params.cityLanding);

  if (!citySlug) {
    notFound();
  }

  const cityLanding = await getSeoCityBySlug(citySlug);

  if (!cityLanding) {
    notFound();
  }

  permanentRedirect(citySchoolsPath(cityLanding.city.provinceSlug, cityLanding.city.slug));
}
