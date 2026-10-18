"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, ScanLine, Sparkles } from "lucide-react";
import { BodyFatChart } from "@/components/Charts";
import { Markdown } from "@/components/Markdown";
import { PhotoCompare } from "@/components/PhotoCompare";
import { Card, CardTitle, PageHeader, Pill } from "@/components/ui";
import { weeklyReport } from "@/data/coach-responses";
import { weeks } from "@/data/persona";
import { progressPhotos } from "@/data/progress-photos";
import { getBodyComposition } from "@/lib/analytics";
import { useStreamedText } from "@/lib/coach";

const views = ["front", "side", "back"] as const;
type View = (typeof views)[number];

const scales = [
  { key: "energy", label: "Energy", low: "Drained", high: "Great" },
  { key: "hunger", label: "Hunger", low: "None", high: "Starving" },
  { key: "recovery", label: "Recovery", low: "Wrecked", high: "Fresh" },
  { key: "stress", label: "Stress", low: "Calm", high: "Maxed" },
] as const;

const analysisSteps = [
  "Pulling 5 workouts from Hevy",
  "Computing weight & waist trends",
  "Analysing 7 days of nutrition",
  "Comparing photos with week 8",
  "Estimating body fat from your photos",
  "Coach is writing your report",
];

function PhotoSlot({ view, src, sample, onFile }: { view: View; src?: string; sample: boolean; onFile: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const filled = !!src || sample;
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className={`group relative aspect-[3/5] overflow-hidden rounded-xl border-2 border-dashed transition ${
        filled ? "border-transparent" : "border-line hover:border-accent"
      }`}
    >
      {src || sample ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src ?? progressPhotos[12][view]} alt={`${view} progress`} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full flex-col items-center justify-center gap-1.5 text-muted group-hover:text-accent">
          <Camera className="h-6 w-6" />
          <span className="text-xs">Add photo</span>
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-4 text-left text-[11px] font-semibold uppercase tracking-wider">
        {view}
      </span>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(URL.createObjectURL(f));
        }}
      />
    </button>
  );
}

function BodyFatCard() {
  const bc = getBodyComposition();
  const { latest, previous } = bc;
  return (
    <Card className="mt-6">
      <CardTitle action={<Pill tone="accent">From your 3 photos</Pill>}>
        <span className="inline-flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-accent" /> Body fat estimate
        </span>
      </CardTitle>
      <div className="grid gap-5 sm:grid-cols-5">
        <div className="sm:col-span-2">
          <p className="num font-display text-5xl font-bold leading-none">
            {latest.lowPct}–{latest.highPct}
            <span className="text-2xl text-muted">%</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            <span className="font-semibold text-ok">{String(bc.changePts).replace("-", "−")} pts</span> since week {previous.week} ({previous.lowPct}–{previous.highPct}%)
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3 border-b border-line pb-2">
              <dt className="text-muted">Fat lost since week 1</dt>
              <dd className="num font-semibold">≈ {bc.fatLostKg} kg</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Lean mass</dt>
              <dd className="num font-semibold">
                ≈ {latest.leanKg} kg <span className="font-normal text-ok">held</span>
              </dd>
            </div>
          </dl>
        </div>
        <div className="sm:col-span-3">
          <BodyFatChart />
        </div>
      </div>
      <div className="mt-6 border-t border-line pt-5">
        <PhotoCompare />
      </div>
      <p className="mt-3 text-xs text-muted">
        A visual estimate is good to about ±3%, so we show a range and watch the trend. Your coach weighs it together with your waist and scale data.
      </p>
    </Card>
  );
}

function Report() {
  const { shown, done } = useStreamedText(weeklyReport, 4, 30);
  return (
    <div className={done ? "" : "caret"}>
      <Markdown text={shown} />
    </div>
  );
}

function LastBodyFat() {
  const { previous } = getBodyComposition();
  return (
    <Card>
      <CardTitle>
        <span className="inline-flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-accent" /> Last body fat estimate
        </span>
      </CardTitle>
      <p className="num font-display text-3xl font-bold leading-none">
        {previous.lowPct}–{previous.highPct}
        <span className="text-lg text-muted">%</span>
      </p>
      <p className="mt-2 text-xs text-muted">Week {previous.week}, from your photos. Add this week&apos;s photos and your coach estimates it again.</p>
    </Card>
  );
}

export default function CheckInPage() {
  const last = weeks[weeks.length - 1];
  const [weight, setWeight] = useState("87.9");
  const [waist, setWaist] = useState("86.5");
  const [sleep, setSleep] = useState("6.4");
  const [vals, setVals] = useState<Record<string, number>>({ ...last.checkin });
  const [notes, setNotes] = useState("Work deadlines all week. Weekdays were on plan but Saturday turned into a takeaway + drinks. Bench felt heavy on Monday.");
  const [photos, setPhotos] = useState<Partial<Record<View, string>>>({});
  const [sample, setSample] = useState(false);
  const [phase, setPhase] = useState<"form" | "analysing" | "report">("form");
  const [step, setStep] = useState(0);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== "analysing") return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= analysisSteps.length - 1) {
          clearInterval(id);
          setTimeout(() => setPhase("report"), 600);
          return s;
        }
        return s + 1;
      });
    }, 650);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "form") reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  const photosReady = sample || views.every((v) => photos[v]);

  return (
    <>
      <PageHeader eyebrow="Week 12 · 5 – 11 October" title="Weekly check-in">
        <Pill tone="watch">Due today</Pill>
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <form
          className="space-y-5 lg:col-span-3"
          onSubmit={(e) => {
            e.preventDefault();
            setPhase("analysing");
          }}
        >
          <Card>
            <CardTitle>Body</CardTitle>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Weight (kg)", weight, setWeight],
                ["Waist (cm)", waist, setWaist],
                ["Sleep (h/night)", sleep, setSleep],
              ].map(([label, v, set]) => (
                <label key={label as string} className="block">
                  <span className="text-xs text-muted">{label as string}</span>
                  <input
                    inputMode="decimal"
                    value={v as string}
                    onChange={(e) => (set as (s: string) => void)(e.target.value)}
                    className="num mt-1 h-12 w-full rounded-xl border border-line bg-surface-2 px-3 font-display text-2xl font-bold outline-none focus:border-accent"
                  />
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>How did the week feel?</CardTitle>
            <div className="space-y-5">
              {scales.map((s) => (
                <div key={s.key}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-sm font-medium">{s.label}</span>
                    <span className="num font-display text-xl font-bold text-accent">
                      {vals[s.key]}
                      <span className="text-sm text-muted">/10</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={vals[s.key]}
                    onChange={(e) => setVals((v) => ({ ...v, [s.key]: Number(e.target.value) }))}
                    className="w-full accent-[var(--accent)]"
                    aria-label={s.label}
                  />
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>{s.low}</span>
                    <span>{s.high}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle
              action={
                !sample && (
                  <button type="button" onClick={() => setSample(true)} className="text-xs font-medium text-accent hover:underline">
                    Use sample photos
                  </button>
                )
              }
            >
              Progress photos
            </CardTitle>
            <div className="grid grid-cols-3 gap-3">
              {views.map((v) => (
                <PhotoSlot key={v} view={v} src={photos[v]} sample={sample} onFile={(url) => setPhotos((p) => ({ ...p, [v]: url }))} />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Same lighting, same time of day. Photos stay private and are only used for your coaching.</p>
          </Card>

          <Card>
            <CardTitle>Notes for your coach</CardTitle>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-line bg-surface-2 p-3 text-[15px] leading-relaxed outline-none focus:border-accent"
            />
          </Card>

          <button
            type="submit"
            disabled={phase !== "form" || !photosReady}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" />
            {phase === "form" ? (photosReady ? "Submit check-in" : "Add 3 photos to submit") : "Check-in submitted"}
          </button>
        </form>

        <aside className="space-y-5 lg:col-span-2">
          <Card>
            <CardTitle action={<Pill tone="accent">Auto-synced</Pill>}>This week from your apps</CardTitle>
            <dl className="space-y-2.5 text-sm">
              {[
                ["Workouts (Hevy)", `${last.sessions} sessions · ${last.hardSets} hard sets`],
                ["Avg calories", `${last.kcal.toLocaleString("en-GB")} kcal`],
                ["Avg protein", `${last.proteinG} g`],
                ["Avg steps", last.steps.toLocaleString("en-GB")],
                ["Scale avg", `${last.avgWeightKg} kg`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-line pb-2.5 last:border-0">
                  <dt className="text-muted">{k}</dt>
                  <dd className="num text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted">You only fill in what apps can&apos;t measure. The rest is pulled in automatically.</p>
          </Card>
          <LastBodyFat />
        </aside>
      </div>

      <div ref={reportRef} className="scroll-mt-20">
        {phase === "analysing" && (
          <Card className="mt-6">
            <CardTitle>Analysing your week</CardTitle>
            <ul className="space-y-3">
              {analysisSteps.map((s, i) => (
                <li key={s} className={`flex items-center gap-3 text-sm ${i > step ? "text-muted/50" : ""}`}>
                  {i < step ? (
                    <Check className="h-4 w-4 text-ok" />
                  ) : i === step ? (
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-line" />
                  )}
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        )}
        {phase === "report" && (
          <>
            <BodyFatCard />
            <Card className="mt-6 border-accent/30">
              <Report />
            </Card>
          </>
        )}
      </div>
    </>
  );
}
