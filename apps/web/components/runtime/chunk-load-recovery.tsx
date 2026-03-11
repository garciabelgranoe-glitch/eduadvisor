"use client";

import { useEffect } from "react";

const RECOVERY_KEY = "ea_chunk_recovery_ts";
const RECOVERY_COOLDOWN_MS = 10_000;

function extractMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "";
}

function isChunkLoadError(message: string) {
  const value = message.toLowerCase();
  return (
    value.includes("chunkloaderror") ||
    value.includes("loading chunk") ||
    value.includes("dynamically imported module") ||
    value.includes("/_next/static/chunks/") ||
    value.includes("hydration failed") ||
    value.includes("does not match server-rendered html")
  );
}

function isStylesheetAssetError(message: string) {
  const value = message.toLowerCase();
  return (
    value.includes("/_next/static/css/") ||
    value.includes("stylesheet") ||
    value.includes("css chunk") ||
    value.includes("failed to fetch dynamically imported module")
  );
}

function hasDesignTokensLoaded() {
  if (typeof window === "undefined") {
    return true;
  }

  const accent = window.getComputedStyle(document.documentElement).getPropertyValue("--ea-accent").trim();
  return accent.length > 0;
}

function reloadOnce() {
  if (typeof window === "undefined") {
    return;
  }

  const now = Date.now();
  const previous = Number(window.sessionStorage.getItem(RECOVERY_KEY) ?? "0");
  if (!Number.isNaN(previous) && now - previous < RECOVERY_COOLDOWN_MS) {
    return;
  }

  window.sessionStorage.setItem(RECOVERY_KEY, String(now));
  window.location.reload();
}

export function ChunkLoadRecovery() {
  useEffect(() => {
    const verifyCriticalStyles = () => {
      if (hasDesignTokensLoaded()) {
        return;
      }

      reloadOnce();
    };

    const onError = (event: ErrorEvent) => {
      const message = event.message || extractMessage(event.error);
      if (isChunkLoadError(message) || isStylesheetAssetError(message)) {
        reloadOnce();
        return;
      }

      const target = event.target;
      if (target instanceof HTMLLinkElement && target.rel === "stylesheet") {
        reloadOnce();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = extractMessage(event.reason);
      if (isChunkLoadError(message) || isStylesheetAssetError(message)) {
        reloadOnce();
      }
    };

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    const verifyTimer = window.setTimeout(verifyCriticalStyles, 1200);
    return () => {
      window.clearTimeout(verifyTimer);
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
