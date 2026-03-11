import type { Metadata } from "next";
import { SEO_DEFAULT_LOCALE, SEO_SITE_NAME, SEO_SITE_URL } from "./config";
import { absoluteUrl } from "./routes";

export const baseMetadata: Metadata = {
  metadataBase: new URL(SEO_SITE_URL),
  title: {
    default: `${SEO_SITE_NAME} | Encontrá y compará colegios privados`,
    template: `%s | ${SEO_SITE_NAME}`
  },
  description:
    "Marketplace para descubrir, comparar y revisar colegios privados en Latinoamérica con datos verificables.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    siteName: SEO_SITE_NAME,
    locale: SEO_DEFAULT_LOCALE,
    url: SEO_SITE_URL,
    title: SEO_SITE_NAME,
    description: "Descubrí, compará y evaluá colegios privados con contexto local y datos útiles."
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_SITE_NAME,
    description: "Descubrí, compará y evaluá colegios privados con contexto local y datos útiles."
  }
};

interface BuildPageMetadataInput {
  title: string;
  description: string;
  canonicalPath: string;
  index?: boolean;
  follow?: boolean;
  openGraphType?: "website" | "article";
  images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
}

export function buildPageMetadata({
  title,
  description,
  canonicalPath,
  index = true,
  follow = true,
  openGraphType = "website",
  images
}: BuildPageMetadataInput): Metadata {
  const canonicalUrl = absoluteUrl(canonicalPath);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    robots: {
      index,
      follow,
      googleBot: {
        index,
        follow,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1
      }
    },
    openGraph: {
      type: openGraphType,
      title,
      description,
      locale: SEO_DEFAULT_LOCALE,
      url: canonicalUrl,
      images
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((image) => image.url)
    }
  };
}

export function buildNoIndexMetadata({
  title,
  description,
  canonicalPath,
  follow = true
}: {
  title: string;
  description: string;
  canonicalPath: string;
  follow?: boolean;
}) {
  return buildPageMetadata({
    title,
    description,
    canonicalPath,
    index: false,
    follow
  });
}
