"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { PhotoCompare } from "@/components/PhotoCompare";
import { Card, CardTitle, PageHeader, Pill, Stat } from "@/components/ui";
import { weeks } from "@/data/persona";
import { photoWeeks, progressPhotos } from "@/data/progress-photos";
import { getBodyComposition } from "@/lib/analytics";

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

// front view only, newest first
const shots: number[] = [...photoWeeks].reverse();

function Lightbox({ index, onClose, onMove }: { index: number; onClose: () => void; onMove: (i: number) => void }) {
  const week = shots[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  // move focus into the dialog on open, and give it back to the opener on close
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => opener?.focus?.();
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onMove((index + 1) % shots.length);
      if (e.key === "ArrowLeft") onMove((index - 1 + shots.length) % shots.length);
    };
    window.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = prev;
    };
  }, [index, onClose, onMove]);

  const nav = "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20";
  return (
    <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="font-semibold">Week {week} · Front</span>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-white/80 hover:bg-white/10">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={progressPhotos[week]!.front} alt={`Week ${week} front`} className="max-h-full max-w-full rounded-xl object-contain" />
        <button type="button" aria-label="Previous photo" onClick={() => onMove((index - 1 + shots.length) % shots.length)} className={`${nav} left-3`}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Next photo" onClick={() => onMove((index + 1) % shots.length)} className={`${nav} right-3`}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const bc = getBodyComposition();
  const first = weeks[0], last = weeks[weeks.length - 1];
  const [open, setOpen] = useState<number | null>(null);
  const checkIns = [...bc.rows].reverse();

  return (
    <>
      <PageHeader eyebrow="Body composition" title="Progress photos">
        <Link
          href="/check-in/"
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110"
        >
          <Camera className="h-4 w-4" /> Add this week&apos;s photo
        </Link>
      </PageHeader>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Bodyweight" value={String(last.avgWeightKg)} unit="kg" delta={`−${(first.avgWeightKg - last.avgWeightKg).toFixed(1)} kg since week 1`} deltaTone="good" />
        <Stat label="Waist" value={String(last.waistCm)} unit="cm" delta={`−${(first.waistCm - last.waistCm).toFixed(1)} cm since week 1`} deltaTone="good" />
        <Stat label="Body fat (photo)" value={`${bc.latest.lowPct}–${bc.latest.highPct}`} unit="%" delta={`from ${bc.rows[0].lowPct}–${bc.rows[0].highPct}%`} deltaTone="good" />
        <Stat label="Lean mass" value={`≈ ${bc.latest.leanKg}`} unit="kg" delta={`held (${bc.leanChangeKg >= 0 ? "+" : "−"}${Math.abs(bc.leanChangeKg)} kg)`} deltaTone="good" />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardTitle>Compare</CardTitle>
          <PhotoCompare allowSideBySide size="max-w-sm" />
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle action={<Pill>{bc.rows.length} check-ins</Pill>}>Timeline</CardTitle>
          <ol className="space-y-5">
            {checkIns.map((r) => {
              const set = progressPhotos[r.week];
              const w = weeks[r.week - 1];
              return (
                <li key={r.week} className="border-b border-line pb-5 last:border-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-semibold">
                      Week {r.week} <span className="font-normal text-muted">· {fmtDate(w.start)}</span>
                    </p>
                    <p className="num text-sm font-semibold">
                      {r.lowPct}–{r.highPct}%
                    </p>
                  </div>
                  <p className="num mt-0.5 text-xs text-muted">
                    {w.avgWeightKg} kg · waist {w.waistCm} cm · lean ≈ {r.leanKg} kg
                  </p>
                  {set ? (
                    <button
                      type="button"
                      onClick={() => {
                        const i = shots.indexOf(r.week);
                        if (i >= 0) setOpen(i);
                      }}
                      className="group relative mt-3 block aspect-[3/5] w-24 overflow-hidden rounded-lg sm:w-28"
                      aria-label={`Open week ${r.week} front photo`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={set.front} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-3 text-left text-[10px] font-semibold uppercase tracking-wider">
                        Front
                      </span>
                    </button>
                  ) : (
                    <p className="mt-2 text-xs text-muted">Estimate from photo (not included in the demo set).</p>
                  )}
                </li>
              );
            })}
          </ol>
        </Card>
      </div>

      <p className="mt-4 text-xs text-muted">
        Photos stay private to you and your coach. For a fair comparison take them in the same spot, light and time of day, ideally
        Monday morning before food.
      </p>

      {open !== null && <Lightbox index={open} onClose={() => setOpen(null)} onMove={setOpen} />}
    </>
  );
}
