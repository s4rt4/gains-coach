"use client";

import { useState } from "react";
import { Share, Smartphone } from "lucide-react";
import { useInstall } from "@/lib/pwa";

/** "Install app" for the sidebar and the mobile More sheet. Renders nothing once installed. */
export function InstallApp({ className = "" }: { className?: string }) {
  const { state, install } = useInstall();
  const [hint, setHint] = useState(false);
  if (state === "installed" || state === "unsupported") return null;
  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => (state === "prompt" ? install() : setHint((h) => !h))}
        className="flex w-full items-center gap-3 rounded-xl border border-accent/30 bg-accent/[0.07] px-3 py-2.5 text-sm font-medium text-accent transition hover:bg-accent/12"
      >
        <Smartphone className="h-[18px] w-[18px]" />
        Install app
      </button>
      {hint && (
        <p className="mt-2 px-1 text-xs leading-relaxed text-muted">
          In Safari, tap <Share className="inline h-3.5 w-3.5 align-[-2px]" /> <strong className="text-text">Share</strong>, then{" "}
          <strong className="text-text">Add to Home Screen</strong>.
        </p>
      )}
    </div>
  );
}
