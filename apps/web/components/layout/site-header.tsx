"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

interface SessionState {
  role: "PARENT" | "SCHOOL" | null;
  appRole: "PARENT" | "SCHOOL_ADMIN" | null;
  email: string | null;
  schoolSlug: string | null;
  dashboardPath: Route | null;
  authenticated: boolean;
}

const navItems: Array<{ href: Route; desktopLabel: string; mobileLabel: string }> = [
  { href: "/search", desktopLabel: "Buscar", mobileLabel: "Buscar colegios" },
  { href: "/compare", desktopLabel: "Comparar", mobileLabel: "Comparar" },
  { href: "/rankings", desktopLabel: "Rankings", mobileLabel: "Rankings" },
  { href: "/matches", desktopLabel: "Matches", mobileLabel: "Recomendaciones" },
  { href: "/market-insights", desktopLabel: "Insights", mobileLabel: "Insights" }
];

export function SiteHeader() {
  const [session, setSession] = useState<SessionState>({
    role: null,
    appRole: null,
    email: null,
    schoolSlug: null,
    dashboardPath: null,
    authenticated: false
  });

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/session/me", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as SessionState;
        if (!mounted) {
          return;
        }

        setSession({
          role: data.role,
          appRole: data.appRole,
          email: data.email,
          schoolSlug: data.schoolSlug,
          dashboardPath: data.dashboardPath,
          authenticated: Boolean(data.authenticated)
        });
      } catch {
        // Keep logged-out UI when session endpoint is unavailable.
      }
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  const dashboardLabel = session.role === "PARENT" ? "Panel familia" : "Panel colegio";
  const mobileNavItems = navItems.filter((item) => item.href !== "/market-insights");

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-ink">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
            EDUADVISOR
          </Link>
          <nav className="hidden flex-1 justify-center gap-4 text-sm text-ink md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  trackEvent("nav_click", {
                    href: item.href,
                    source: "header_desktop"
                  });
                }}
                className="rounded-full px-3 py-1.5 transition hover:bg-brand-50 hover:text-brand-700"
              >
                {item.desktopLabel}
              </Link>
            ))}
          </nav>
          <div className="md:hidden">
            {session.dashboardPath ? (
              <Button
                asChild
                variant="ghost"
                className="px-3 py-1.5 text-xs"
                onClick={() => {
                  trackEvent("nav_click", {
                    href: session.dashboardPath,
                    source: "header_mobile_primary"
                  });
                }}
              >
                <Link href={session.dashboardPath}>Panel</Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                className="px-3 py-1.5 text-xs"
                onClick={() => {
                  trackEvent("nav_click", {
                    href: "/ingresar",
                    source: "header_mobile_primary"
                  });
                }}
              >
                <Link href="/ingresar">Ingresar</Link>
              </Button>
            )}
          </div>
          <div className="hidden items-center gap-2 md:flex">
            {session.dashboardPath ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  onClick={() => {
                    trackEvent("nav_click", {
                      href: session.dashboardPath,
                      source: "header_desktop_dashboard"
                    });
                  }}
                >
                  <Link href={session.dashboardPath}>{dashboardLabel}</Link>
                </Button>
                <form
                  action="/api/session/logout"
                  method="post"
                  onSubmit={() => {
                    trackEvent("session_logout", { source: "header_desktop" });
                  }}
                >
                  <Button variant="ghost" type="submit">
                    Salir
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  onClick={() => {
                    trackEvent("nav_click", {
                      href: "/ingresar",
                      source: "header_desktop"
                    });
                  }}
                >
                  <Link href="/ingresar">Ingresar</Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  onClick={() => {
                    trackEvent("nav_click", {
                      href: "/para-colegios",
                      source: "header_desktop"
                    });
                  }}
                >
                  <Link href="/para-colegios">Publicar Colegio</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 md:hidden">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                trackEvent("nav_click", {
                  href: item.href,
                  source: "header_mobile_links"
                });
              }}
              className="whitespace-nowrap rounded-full border border-brand-100 bg-white px-3 py-1.5 text-xs text-ink transition hover:bg-brand-50 hover:text-brand-700"
            >
              {item.mobileLabel}
            </Link>
          ))}
          {session.dashboardPath ? (
            <form
              action="/api/session/logout"
              method="post"
              onSubmit={() => {
                trackEvent("session_logout", { source: "header_mobile" });
              }}
            >
              <Button variant="ghost" className="px-3 py-1.5 text-xs" type="submit">
                Salir
              </Button>
            </form>
          ) : (
            <Button
              asChild
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              onClick={() => {
                trackEvent("nav_click", {
                  href: "/para-colegios",
                  source: "header_mobile_links"
                });
              }}
            >
              <Link href="/para-colegios">Publicar Colegio</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
