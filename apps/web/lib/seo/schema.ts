import { absoluteUrl } from "./routes";

interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function buildItemListSchema({
  name,
  description,
  path,
  itemUrls
}: {
  name: string;
  description: string;
  path: string;
  itemUrls: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    url: absoluteUrl(path),
    numberOfItems: itemUrls.length,
    itemListElement: itemUrls.map((itemUrl, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(itemUrl)
    }))
  };
}

const EDUCATION_LEVEL_MAP: Record<string, string> = {
  MATERNAL: "Preschool",
  INICIAL: "Preschool",
  PRIMARIA: "PrimaryEducation",
  SECUNDARIA: "SecondaryEducation",
  SUPERIOR: "HigherEducation"
};

export function buildSchoolSchema({
  name,
  description,
  path,
  address,
  geo,
  telephone,
  sameAs,
  rating,
  levels,
  logoUrl,
  numberOfStudents,
  monthlyFeeEstimate
}: {
  name: string;
  description?: string | null;
  path: string;
  address: {
    city: string;
    province: string;
    countryCode: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  } | null;
  telephone?: string | null;
  sameAs?: string[];
  rating?: {
    average: number | null;
    count: number;
  };
  levels?: string[];
  logoUrl?: string | null;
  numberOfStudents?: number | null;
  monthlyFeeEstimate?: number | null;
}) {
  const educationalLevels = levels && levels.length > 0
    ? [...new Set(levels.map((l) => EDUCATION_LEVEL_MAP[l]).filter(Boolean))]
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "School",
    name,
    description: description ?? undefined,
    url: absoluteUrl(path),
    telephone: telephone ?? undefined,
    sameAs: sameAs && sameAs.length > 0 ? sameAs : undefined,
    image: logoUrl ?? undefined,
    numberOfStudents: numberOfStudents ?? undefined,
    priceRange: monthlyFeeEstimate
      ? `$${Math.round(monthlyFeeEstimate * 0.8).toLocaleString("es-AR")} – $${Math.round(monthlyFeeEstimate * 1.2).toLocaleString("es-AR")}`
      : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: address.city,
      addressRegion: address.province,
      addressCountry: address.countryCode
    },
    geo:
      geo && Number.isFinite(geo.latitude) && Number.isFinite(geo.longitude)
        ? {
            "@type": "GeoCoordinates",
            latitude: geo.latitude,
            longitude: geo.longitude
          }
        : undefined,
    educationalLevel: educationalLevels,
    aggregateRating:
      rating && rating.average !== null && rating.count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: rating.average,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1
          }
        : undefined
  };
}

export function buildBlogPostSchema({
  title,
  description,
  publishedAt,
  updatedAt,
  path
}: {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  path: string;
}) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: {
      "@type": "Organization",
      name: "Radar Educativo",
      url: absoluteUrl("/")
    },
    publisher: {
      "@type": "Organization",
      name: "Radar Educativo",
      url: absoluteUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon.svg")
      }
    }
  };
}

export function buildFaqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}
