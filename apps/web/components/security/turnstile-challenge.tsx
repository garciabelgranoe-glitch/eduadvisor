"use client";

import { useEffect, useId, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove?: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID = "eduadvisor-turnstile-script";
const TURNSTILE_API_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";

interface TurnstileChallengeProps {
  token: string;
  onTokenChange: (token: string) => void;
  onError?: () => void;
  className?: string;
}

export function TurnstileChallenge({ token, onTokenChange, onError, className }: TurnstileChallengeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const uniqueId = useId();
  const fallbackId = `turnstile-${uniqueId.replace(/:/g, "-")}`;

  const disabled = TURNSTILE_SITE_KEY.length === 0;

  useEffect(() => {
    if (disabled || !scriptReady || !containerRef.current) {
      return;
    }
    if (!window.turnstile || widgetIdRef.current) {
      return;
    }

    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "light",
      size: "flexible",
      callback: (nextToken: string) => onTokenChange(nextToken),
      "expired-callback": () => onTokenChange(""),
      "error-callback": () => {
        onTokenChange("");
        onError?.();
      }
    });
    widgetIdRef.current = widgetId;

    return () => {
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [disabled, onError, onTokenChange, scriptReady]);

  useEffect(() => {
    if (!scriptReady || !window.turnstile || !widgetIdRef.current || token) {
      return;
    }
    window.turnstile.reset(widgetIdRef.current);
  }, [scriptReady, token]);

  if (disabled) {
    return (
      <div className={className}>
        <p className="text-xs text-slate-500">
          Verificación anti-bot no configurada en este entorno (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`).
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Script id={TURNSTILE_SCRIPT_ID} src={TURNSTILE_API_URL} strategy="afterInteractive" onReady={() => setScriptReady(true)} />
      <div id={fallbackId} ref={containerRef} />
    </div>
  );
}
