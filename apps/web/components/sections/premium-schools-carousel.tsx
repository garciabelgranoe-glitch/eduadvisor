"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import { citySchoolProfilePath } from "@/lib/seo";

interface PremiumCarouselItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  city: string;
  province: string;
}

interface PremiumSchoolsCarouselProps {
  items: PremiumCarouselItem[];
}

export function PremiumSchoolsCarousel({ items }: PremiumSchoolsCarouselProps) {
  const carouselItems = useMemo(() => [...items, ...items], [items]);
  const animationSeconds = Math.max(24, items.length * 5);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    trackEvent("premium_carousel_viewed", {
      source: "landing",
      featuredCount: items.length
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <Card className="space-y-4 overflow-hidden border-amber-300 bg-gradient-to-r from-amber-50/90 via-white to-brand-50/90 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-800">Colegios destacados</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-2xl space-y-1">
            <h2 className="font-display text-3xl text-ink">Impulsa tu colegio con presencia premium</h2>
            <p className="text-sm text-slate-600">
              Los colegios premium aparecen en esta vidriera principal con su marca visible para miles de familias.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/para-colegios#solicitud-colegio">Quiero destacar mi colegio</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 overflow-hidden border-amber-300 bg-gradient-to-r from-amber-50/90 via-white to-brand-50/90 p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-0">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber-800">Colegios destacados</p>
          <h2 className="font-display text-3xl text-ink">Instituciones premium en EduAdvisor</h2>
          <p className="mt-1 text-sm text-slate-600">
            Mayor visibilidad para colegios que activaron su presencia premium.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/para-colegios#solicitud-colegio">Quiero destacar mi colegio</Link>
        </Button>
      </div>

      <div className="premium-carousel relative overflow-hidden px-5 pb-5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white via-white/70 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white via-white/70 to-transparent" />

        <div
          className="premium-carousel-track flex w-max items-stretch gap-3 py-1"
          style={{ animationDuration: `${animationSeconds}s` }}
        >
          {carouselItems.map((item, index) => (
            <Link
              key={`${item.id}-${index}`}
              href={citySchoolProfilePath(item.province, item.city, item.slug) as never}
              onClick={() =>
                trackEvent("premium_carousel_clicked", {
                  source: "landing",
                  schoolSlug: item.slug,
                  schoolName: item.name
                })
              }
              className="group block min-w-[210px] rounded-2xl border border-brand-100 bg-white px-4 py-3 shadow-[0_8px_20px_rgba(13,27,31,0.08)] transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_16px_28px_rgba(13,27,31,0.12)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-white p-1">
                  <Image
                    src={item.logoUrl}
                    alt={`Logo ${item.name}`}
                    width={48}
                    height={48}
                    className="h-full w-full rounded-md object-contain"
                    loading="lazy"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {item.city}, {item.province}
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">Premium</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .premium-carousel-track {
          animation-name: premiumMarquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .premium-carousel:hover .premium-carousel-track {
          animation-play-state: paused;
        }

        @keyframes premiumMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </Card>
  );
}
