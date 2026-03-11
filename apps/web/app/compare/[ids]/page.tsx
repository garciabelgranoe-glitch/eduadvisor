import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { buildPageMetadata, comparePath } from "@/lib/seo";

interface CompareByIdsPageProps {
  params: {
    ids: string;
  };
}

function decodeSafe(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseSlugs(ids: string) {
  const decoded = decodeSafe(ids);

  return decoded
    .split(",")
    .map((slug) => decodeSafe(slug).trim())
    .filter(Boolean)
    .filter((slug, index, list) => list.indexOf(slug) === index)
    .slice(0, 3);
}

export async function generateMetadata({ params }: CompareByIdsPageProps): Promise<Metadata> {
  const slugs = parseSlugs(params.ids);
  const readable = slugs.join(" vs ");

  return buildPageMetadata({
    title: `Comparar colegios${readable ? `: ${readable}` : ""}`,
    description: "Comparación lado a lado con foco en cuota, niveles, ratings y contexto local.",
    canonicalPath: comparePath(params.ids)
  });
}

export default async function CompareByIdsPage({ params }: CompareByIdsPageProps) {
  const slugs = parseSlugs(params.ids).join(",");
  permanentRedirect(comparePath(slugs));
}
