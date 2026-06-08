import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollDepthTracker } from "@/components/analytics/scroll-depth-tracker";
import { WebVitalsTracker } from "@/components/analytics/web-vitals-tracker";
import { ChunkLoadRecovery } from "@/components/runtime/chunk-load-recovery";
import { baseMetadata, SEO_DEFAULT_LANG, SEO_GSC_VERIFICATION } from "@/lib/seo";

export const metadata: Metadata = {
  ...baseMetadata,
  verification: SEO_GSC_VERIFICATION
    ? {
        google: SEO_GSC_VERIFICATION
      }
    : undefined
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={SEO_DEFAULT_LANG}>
      <body
        className="min-h-screen"
        style={{
          margin: 0,
          minHeight: "100vh",
          color: "#0d1b1f",
          fontFamily: "'Avenir Next', Avenir, 'Nunito Sans', 'Segoe UI', sans-serif",
          background:
            "radial-gradient(1200px 500px at 100% -10%, rgba(124, 197, 170, 0.25), transparent 60%), radial-gradient(900px 500px at -5% 25%, rgba(254, 215, 123, 0.25), transparent 55%), linear-gradient(180deg, #f6faf9 0%, #ffffff 35%, #f9fbfb 100%)"
        }}
      >
        <QueryProvider>
          <WebVitalsTracker />
          <ScrollDepthTracker />
          <ChunkLoadRecovery />
          <div className="relative min-h-screen overflow-hidden">
            {process.env.NEXT_PUBLIC_GA_ID ? <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} /> : null}
          <div className="pointer-events-none absolute inset-0 grid-pattern opacity-50" />
            <div className="relative">
              <SiteHeader />
              <main className="mx-auto max-w-6xl px-4 pb-10 pt-2 md:pt-4">{children}</main>
              <SiteFooter />
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
