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

export function buildSchoolSchema({
  name,
  description,
  path,
  address,
  geo,
  telephone,
  sameAs,
  rating
}: {
  name: string;
  description?: string | null;
  path: string;
  address: {
    city: string;
    province: string;
    country: string;
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "School",
    name,
    description: description ?? undefined,
    url: absoluteUrl(path),
    telephone: telephone ?? undefined,
    sameAs: sameAs && sameAs.length > 0 ? sameAs : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: address.city,
      addressRegion: address.province,
      addressCountry: address.country
    },
    geo:
      geo && Number.isFinite(geo.latitude) && Number.isFinite(geo.longitude)
        ? {
            "@type": "GeoCoordinates",
            latitude: geo.latitude,
            longitude: geo.longitude
          }
        : undefined,
    aggregateRating:
      rating && rating.average !== null
        ? {
            "@type": "AggregateRating",
            ratingValue: rating.average,
            reviewCount: rating.count
          }
        : undefined
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
