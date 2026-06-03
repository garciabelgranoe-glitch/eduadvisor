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
    title: "Redireccionando...",
    description: "Esta página redirige al listado de colegios correspondiente.",
    canonicalPath: citySchoolsCategoryPath(params.province, params.city, params.category)
  });
}

export default function LegacyRankingCategoryPage({ params }: LegacyRankingCategoryPageProps) {
  permanentRedirect(citySchoolsCategoryPath(params.province, params.city, params.category));
}
