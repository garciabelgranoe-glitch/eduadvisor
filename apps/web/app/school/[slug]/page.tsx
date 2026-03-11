import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getSchoolBySlug } from "@/lib/api";
import { buildNoIndexMetadata, citySchoolProfilePath } from "@/lib/seo";

interface LegacySchoolPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: LegacySchoolPageProps): Promise<Metadata> {
  const school = await getSchoolBySlug(params.slug);

  if (!school) {
    return buildNoIndexMetadata({
      title: "Colegio no encontrado",
      description: "Perfil no disponible.",
      canonicalPath: "/ar"
    });
  }

  return buildNoIndexMetadata({
    title: `Redirección de ${school.name}`,
    description: "Perfil legado consolidado al path geográfico canónico.",
    canonicalPath: citySchoolProfilePath(school.location.province, school.location.city, school.slug)
  });
}

export default async function LegacySchoolPage({ params }: LegacySchoolPageProps) {
  const school = await getSchoolBySlug(params.slug);

  if (!school) {
    notFound();
  }

  permanentRedirect(citySchoolProfilePath(school.location.province, school.location.city, school.slug));
}
