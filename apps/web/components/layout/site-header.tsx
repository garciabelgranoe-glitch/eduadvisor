"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";
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

const navItems: Array<{ href: Route; label: string; icon: string }> = [
  { href: "/search",         label: "Buscar colegios",   icon: "🔍" },
  { href: "/compare",        label: "Comparar",          icon: "⚖️" },
  { href: "/rankings",       label: "Rankings",          icon: "🏆" },
  { href: "/matches",        label: "Recomendaciones",   icon: "✨" },
  { href: "/market-insights",label: "Insights",          icon: "📊" }
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
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/session/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SessionState | null) => {
        if (mounted && data) setSession({ ...data, authenticated: Boolean(data.authenticated) });
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Close drawer on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const dashboardLabel = session.role === "PARENT" ? "Mi panel" : "Panel colegio";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brand-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">

          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2"
            onClick={() => trackEvent("nav_click", { href: "/", source: "header_logo" })}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-700 shadow-[0_2px_10px_rgba(31,92,77,0.28)]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1L10 7L7 6L4 7Z" fill="#fbbf24"/>
                <path d="M7 13L4 7L7 8L10 7Z" fill="white" fillOpacity="0.4"/>
                <circle cx="7" cy="7" r="1" fill="white" fillOpacity="0.7"/>
              </svg>
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              <span className="text-brand-500">Radar</span><span className="text-ink"> Educativo</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden flex-1 justify-center gap-1 text-sm text-ink md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => trackEvent("nav_click", { href: item.href, source: "header_desktop" })}
                className="rounded-full px-3 py-1.5 font-medium transition hover:bg-brand-50 hover:text-brand-700"
              >
                {item.label.split(" ")[0]}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden items-center gap-2 md:flex">
            {session.dashboardPath ? (
              <>
                <Button asChild variant="ghost" size="sm"
                  onClick={() => trackEvent("nav_click", { href: session.dashboardPath, source: "header_desktop_dashboard" })}>
                  <Link href={session.dashboardPath}>{dashboardLabel}</Link>
                </Button>
                <form action="/api/session/logout" method="post"
                  onSubmit={() => trackEvent("session_logout", { source: "header_desktop" })}>
                  <Button variant="ghost" size="sm" type="submit">Salir</Button>
                </form>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"
                  onClick={() => trackEvent("nav_click", { href: "/ingresar", source: "header_desktop" })}>
                  <Link href="/ingresar">Ingresar</Link>
                </Button>
                <Button asChild variant="secondary" size="sm"
                  onClick={() => trackEvent("nav_click", { href: "/para-colegios", source: "header_desktop" })}>
                  <Link href="/para-colegios">Para colegios</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile: CTA + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {session.dashboardPath ? (
              <Button asChild variant="ghost" size="sm"
                onClick={() => trackEvent("nav_click", { href: session.dashboardPath, source: "header_mobile_primary" })}>
                <Link href={session.dashboardPath}>Panel</Link>
              </Button>
            ) : (
              <Button asChild size="sm"
                onClick={() => trackEvent("nav_click", { href: "/para-colegios", source: "header_mobile_cta" })}>
                <Link href="/para-colegios">Para colegios</Link>
              </Button>
            )}

            <button
              aria-label="Menú"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-100 bg-white text-ink transition hover:bg-brand-50"
            >
              {menuOpen ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm md:hidden"
          aria-hidden="true" />
      )}

      {/* Mobile drawer */}
      <div
        ref={drawerRef}
        className={`fixed inset-x-0 top-0 z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="m-3 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-[0_20px_60px_rgba(13,27,31,0.2)]">

          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
            <Link href="/" onClick={() => { setMenuOpen(false); trackEvent("nav_click", { href: "/", source: "drawer_logo" }); }}
              className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-700 shadow-[0_2px_10px_rgba(31,92,77,0.28)]">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1L10 7L7 6L4 7Z" fill="#fbbf24"/>
                  <path d="M7 13L4 7L7 8L10 7Z" fill="white" fillOpacity="0.4"/>
                  <circle cx="7" cy="7" r="1" fill="white" fillOpacity="0.7"/>
                </svg>
              </span>
              <span className="font-display text-lg font-bold tracking-tight">
                <span className="text-brand-500">Radar</span><span className="text-ink"> Educativo</span>
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar menú"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="px-3 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { setMenuOpen(false); trackEvent("nav_click", { href: item.href, source: "drawer_nav" }); }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink transition hover:bg-brand-50 hover:text-brand-700"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-base">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth section */}
          <div className="border-t border-brand-100 px-4 py-4">
            {session.dashboardPath ? (
              <div className="flex items-center gap-2">
                <Button asChild className="flex-1"
                  onClick={() => { setMenuOpen(false); trackEvent("nav_click", { href: session.dashboardPath, source: "drawer_dashboard" }); }}>
                  <Link href={session.dashboardPath}>{dashboardLabel}</Link>
                </Button>
                <form action="/api/session/logout" method="post"
                  onSubmit={() => { setMenuOpen(false); trackEvent("session_logout", { source: "drawer" }); }}>
                  <Button variant="ghost" size="sm" type="submit">Salir</Button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="ghost"
                  onClick={() => { setMenuOpen(false); trackEvent("nav_click", { href: "/ingresar", source: "drawer_auth" }); }}>
                  <Link href="/ingresar">Ingresar</Link>
                </Button>
                <Button asChild variant="secondary"
                  onClick={() => { setMenuOpen(false); trackEvent("nav_click", { href: "/para-colegios", source: "drawer_auth" }); }}>
                  <Link href="/para-colegios">Para colegios</Link>
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
