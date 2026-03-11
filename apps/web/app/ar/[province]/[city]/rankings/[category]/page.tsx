import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { buildNoIndexMetadata, citySchoolsCategoryPath } from "@/lib/seo";

interface LegacyRankingCategoryPageProps {
  params: {
    province: string;
    city: string;
    category: string;
  };
}

export async function generateMetadata({ params }: LegacyRankingCategoryPageProps): Promise<Metadata> {
  return buildNoIndexMetadata({
    title: "Ruta consolidada",
    description: "La categoría fue consolidada al listado canónico de colegios por intención.",
    canonicalPath: citySchoolsCategoryPath(params.province, params.city, params.category)
  });
}

export default function LegacyRankingCategoryPage({ params }: LegacyRankingCategoryPageProps) {
  permanentRedirect(citySchoolsCategoryPath(params.province, params.city, params.category));
}
