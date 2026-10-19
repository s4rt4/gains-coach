"use client";

import { useEffect, useState } from "react";

/** Prefix for files in /public (GitHub Pages serves the demo under /<repo>). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // show our own button instead of the browser's mini-infobar
    deferred = e as InstallEvent;
    listeners.forEach((f) => f());
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    listeners.forEach((f) => f());
  });
}

/**
 * "prompt": Chrome/Edge/Android can install with one tap.
 * "ios": Safari has no prompt; the user adds it from the Share menu.
 * "installed" / "unsupported": hide the button.
 */
export function useInstall() {
  const [state, setState] = useState<"prompt" | "ios" | "installed" | "unsupported">("unsupported");
  useEffect(() => {
    const update = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
      // iPadOS 13+ reports a Mac user agent; touch support tells it apart
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
      setState(standalone ? "installed" : deferred ? "prompt" : ios ? "ios" : "unsupported");
    };
    update();
    listeners.add(update);
    return () => void listeners.delete(update);
  }, []);
  const install = async () => {
    if (!deferred) return;
    const e = deferred;
    deferred = null; // a prompt event can only be used once
    try {
      await e.prompt();
      await e.userChoice;
    } catch {}
    listeners.forEach((f) => f());
  };
  return { state, install };
}

/** Registers the service worker in production builds (it would cache stale dev bundles). */
export function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` }).catch(() => {});
  }, []);
}
