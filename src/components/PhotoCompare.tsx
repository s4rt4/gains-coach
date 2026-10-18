"use client";

import { useState } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { photoViews, photoWeeks, progressPhotos, type PhotoView } from "@/data/progress-photos";

/** Two check-ins, same angle: drag to wipe between them, or show them side by side. */
export function PhotoCompare({
  before = photoWeeks[0],
  after = photoWeeks[photoWeeks.length - 1],
  allowSideBySide = false,
  size = "max-w-xs",
}: {
  before?: number;
  after?: number;
  allowSideBySide?: boolean;
  size?: string;
}) {
  const [view, setView] = useState<PhotoView>("front");
  const [pos, setPos] = useState(50);
  const [mode, setMode] = useState<"wipe" | "side">("wipe");
  const a = progressPhotos[before]!, b = progressPhotos[after]!;

  const seg = <T extends string>(items: readonly T[], value: T, set: (v: T) => void, label: string, text = (v: T) => v.charAt(0).toUpperCase() + v.slice(1)) => (
    <div className="flex rounded-lg border border-line p-0.5 text-xs" role="tablist" aria-label={label}>
      {items.map((v) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={value === v}
          onClick={() => set(v)}
          className={`rounded-md px-2.5 py-1 transition ${value === v ? "bg-accent font-semibold text-accent-ink" : "text-muted hover:text-text"}`}
        >
          {text(v)}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          Week {before} vs week {after}
        </p>
        <div className="flex flex-wrap gap-2">
          {allowSideBySide && seg(["wipe", "side"] as const, mode, setMode, "Compare mode", (v) => (v === "wipe" ? "Slider" : "Side by side"))}
          {seg(photoViews, view, setView, "Photo angle")}
        </div>
      </div>

      {mode === "side" ? (
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          {[
            { w: before, set: a },
            { w: after, set: b },
          ].map(({ w, set }) => (
            <figure key={w} className="relative aspect-[3/5] overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={set[view]} alt={`Week ${w} ${view}`} className="h-full w-full object-cover" />
              <figcaption className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold">WEEK {w}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className={`relative mx-auto aspect-[3/5] ${size} select-none overflow-hidden rounded-xl`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b[view]} alt={`Week ${after} ${view}`} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a[view]}
            alt={`Week ${before} ${view}`}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            draggable={false}
          />
          <span className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90" style={{ left: `${pos}%` }}>
            <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow">
              <ChevronsLeftRight className="h-4 w-4" />
            </span>
          </span>
          <span className="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold">WEEK {before}</span>
          <span className="pointer-events-none absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold">WEEK {after}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label={`Compare week ${before} and week ${after}`}
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
      )}
    </div>
  );
}
