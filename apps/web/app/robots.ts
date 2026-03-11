import type { MetadataRoute } from "next";
import { SEO_SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/ar", "/compare", "/compare/", "/ar/"],
        disallow: [
          "/admin",
          "/school-dashboard",
          "/parent-dashboard",
          "/api/",
          "/*?*feeMin=*",
          "/*?*feeMax=*",
          "/*?*distance=*",
          "/*?*level=*",
          "/*?*tags=*",
          "/*?*page=*",
          "/staging"
        ]
      }
    ],
    sitemap: `${SEO_SITE_URL}/sitemap_index.xml`
  };
}
