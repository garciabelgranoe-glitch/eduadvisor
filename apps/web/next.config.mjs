import path from "node:path";

/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";
const hasHostedRuntime =
  Boolean(process.env.VERCEL || process.env.RAILWAY_STATIC_URL || process.env.FLY_APP_NAME) ||
  process.env.EDUADVISOR_ENABLE_HTTPS_HEADERS === "1";
const enforceHttpsHeaders = isProduction && hasHostedRuntime;
const disableLocalCacheHeaders = !hasHostedRuntime || process.env.EDUADVISOR_DISABLE_STATIC_CACHE === "1";

function buildContentSecurityPolicy() {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https:",
    `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"} https:`,
    `connect-src 'self'${isProduction ? "" : " ws: wss:"} https:`,
    "frame-src 'self' https://www.google.com https://www.google.com/maps https://maps.google.com https://www.youtube.com"
  ];

  if (enforceHttpsHeaders) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(process.cwd())
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      },
      {
        protocol: "http",
        hostname: "localhost"
      },
      {
        protocol: "http",
        hostname: "127.0.0.1"
      }
    ]
  },
  experimental: {
    typedRoutes: true
  },
  async headers() {
    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: buildContentSecurityPolicy()
      },
      {
        key: "X-Frame-Options",
        value: "DENY"
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff"
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin"
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()"
      }
    ];

    if (enforceHttpsHeaders) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=15552000; includeSubDomains; preload"
      });
    }

    const rules = [];

    if (disableLocalCacheHeaders) {
      rules.push({
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0"
          },
          {
            key: "Pragma",
            value: "no-cache"
          }
        ]
      });

      rules.push({
        source: "/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "no-store, max-age=0"
          },
          {
            key: "Pragma",
            value: "no-cache"
          }
        ]
      });

      return rules;
    }

    rules.push({
      source: "/:path*",
      headers: securityHeaders
    });

    return rules;
  },
  async rewrites() {
    return [
      { source: "/sitemap_index.xml", destination: "/sitemaps/index" },
      { source: "/sitemap_static.xml", destination: "/sitemaps/static" },
      { source: "/sitemap_geo.xml", destination: "/sitemaps/geo" },
      { source: "/sitemap_schools.xml", destination: "/sitemaps/schools" },
      { source: "/sitemap_rankings.xml", destination: "/sitemaps/rankings" },
      { source: "/sitemap.xml", destination: "/sitemaps/index" }
    ];
  }
};

export default nextConfig;
