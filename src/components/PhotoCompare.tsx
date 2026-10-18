"use client";

import { useState } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { progressPhotos, type PhotoView } from "@/data/progress-photos";

const views: PhotoView[] = ["front", "side", "back"];

/** Week 1 vs week 12, same view, with a drag handle to wipe between them. */
export function PhotoCompare() {
  const [view, setView] = useState<PhotoView>("front");
  const [pos, setPos] = useState(50);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Week 1 vs week 12</p>
        <div className="flex rounded-lg border border-line p-0.5 text-xs" role="tablist" aria-label="Photo angle">
          {views.map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`rounded-md px-2.5 py-1 capitalize transition ${view === v ? "bg-accent font-semibold text-accent-ink" : "text-muted hover:text-text"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <div className="relative mx-auto aspect-[3/5] max-w-xs select-none overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={progressPhotos[12][view]} alt={`Week 12 ${view}`} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={progressPhotos[1][view]}
          alt={`Week 1 ${view}`}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          draggable={false}
        />
        <span className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90" style={{ left: `${pos}%` }}>
          <span className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow">
            <ChevronsLeftRight className="h-4 w-4" />
          </span>
        </span>
        <span className="pointer-events-none absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold">WEEK 1</span>
        <span className="pointer-events-none absolute top-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-semibold">WEEK 12</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Compare week 1 and week 12"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
    </div>
  );
}
