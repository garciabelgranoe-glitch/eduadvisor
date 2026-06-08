export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: "ciudad" | "guia" | "comparativa";
  city?: string;
  citySlug?: string;
  province?: string;
  provinceSlug?: string;
  content: string; // HTML
  faqs?: Array<{ question: string; answer: string }>;
}
