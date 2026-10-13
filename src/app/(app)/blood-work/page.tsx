"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, FileText, Loader2, ShieldAlert, Sparkles, Upload } from "lucide-react";
import { Markdown } from "@/components/Markdown";
import { Card, CardTitle, PageHeader, Pill } from "@/components/ui";
import { bloodWorkAnalysis } from "@/data/coach-responses";
import { bloodTest, bloodWork, type Marker, type MarkerStatus } from "@/data/persona";
import { useStreamedText } from "@/lib/coach";

const statusLabel: Record<MarkerStatus, string> = { ok: "Normal", watch: "Watch", flag: "Discuss", expected: "Expected" };
const dotColor: Record<MarkerStatus, string> = { ok: "bg-ok", watch: "bg-warn", flag: "bg-danger", expected: "bg-info" };

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function RangeBar({ m }: { m: Marker }) {
  const lo = m.low ?? 0;
  const hi = m.high ?? lo * 2;
  const pad = (hi - lo) * 0.5;
  const dMin = m.low === undefined ? 0 : lo - pad;
  const dMax = hi + pad;
  const pct = (v: number) => Math.min(97, Math.max(3, ((v - dMin) / (dMax - dMin)) * 100));
  return (
    <div className="relative h-2 w-full rounded-full bg-surface-2">
      <div className="absolute inset-y-0 rounded-full bg-ok/20" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
      {m.previous !== undefined && (
        <span className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-muted bg-bg" style={{ left: `${pct(m.previous)}%` }} />
      )}
      <span
        className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg ${dotColor[m.status]}`}
        style={{ left: `${pct(m.value)}%` }}
      />
    </div>
  );
}

function rangeText(m: Marker) {
  if (m.low !== undefined && m.high !== undefined) return `${m.low}–${m.high}`;
  if (m.high !== undefined) return `< ${m.high}`;
  return `> ${m.low}`;
}

function MarkerRow({ m }: { m: Marker }) {
  const delta = m.previous !== undefined ? m.value - m.previous : 0;
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-line py-3 last:border-0 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto]">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{m.name}</p>
        <p className="truncate text-xs text-muted">{m.note}</p>
      </div>
      <div className="num text-right sm:text-left">
        <span className="font-display text-xl font-bold">{m.value}</span>
        <span className="ml-1 text-xs text-muted">{m.unit}</span>
        {m.previous !== undefined && delta !== 0 && (
          <span className="ml-2 inline-flex items-center text-xs text-muted">
            {delta > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {m.previous}
          </span>
        )}
      </div>
      <div className="col-span-2 sm:col-span-1">
        <RangeBar m={m} />
        <p className="num mt-1 text-[11px] text-muted">Range {rangeText(m)}</p>
      </div>
      <div className="hidden sm:block">
        <Pill tone={m.status}>{statusLabel[m.status]}</Pill>
      </div>
    </li>
  );
}

function Analysis() {
  const { shown, done } = useStreamedText(bloodWorkAnalysis, 4, 30);
  return (
    <div className={done ? "" : "caret"}>
      <Markdown text={shown} />
    </div>
  );
}

export default function BloodWorkPage() {
  const [phase, setPhase] = useState<"upload" | "parsing" | "results">("upload");
  const [analyse, setAnalyse] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);
  const all = bloodWork.flatMap((g) => g.markers);
  const count = (s: MarkerStatus) => all.filter((m) => m.status === s).length;

  useEffect(() => {
    if (phase !== "parsing") return;
    const t = setTimeout(() => setPhase("results"), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (analyse) analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [analyse]);

  return (
    <>
      <PageHeader eyebrow="Health monitoring" title="Blood work">
        {phase === "results" && <Pill>Test date {fmtDate(bloodTest.date)}</Pill>}
      </PageHeader>

      <div className="mb-5 flex gap-3 rounded-2xl border border-info/25 bg-info/[0.07] p-4 text-sm text-text/80">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-info" />
        <p>
          Gains Coach helps you <strong className="text-text">understand your results and prepare for your doctor</strong>. It
          doesn&apos;t diagnose, prescribe or replace medical advice.
        </p>
      </div>

      {phase !== "results" ? (
        <Card className="flex flex-col items-center py-14 text-center">
          {phase === "upload" ? (
            <>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                <Upload className="h-6 w-6" />
              </span>
              <h2 className="font-display mt-4 text-2xl font-bold uppercase">Upload your lab report</h2>
              <p className="mt-1 max-w-sm text-sm text-muted">
                PDF or photo from any UK lab (Medichecks, Randox, NHS, private clinics). Markers are extracted automatically.
              </p>
              <button
                onClick={() => setPhase("parsing")}
                className="mt-6 flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition hover:brightness-110"
              >
                <FileText className="h-4 w-4" /> Use sample lab report
              </button>
            </>
          ) : (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-accent" />
              <h2 className="font-display mt-4 text-2xl font-bold uppercase">Reading your report</h2>
              <p className="mt-1 text-sm text-muted">Extracting markers, units and reference ranges…</p>
            </>
          )}
        </Card>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["flag", "watch", "expected", "ok"] as const).map((s) => (
              <div key={s} className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className={`h-2 w-2 rounded-full ${dotColor[s]}`} />
                  {statusLabel[s]}
                </div>
                <p className="num font-display mt-2 text-3xl font-bold leading-none">{count(s)}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {bloodWork.map((g) => (
              <Card key={g.group}>
                <CardTitle>{g.group}</CardTitle>
                <ul>
                  {g.markers.map((m) => (
                    <MarkerRow key={m.name} m={m} />
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <p className="mt-3 flex items-center gap-2 text-xs text-muted">
            <span className="h-2 w-2 rounded-full border border-muted" /> Hollow dot = previous test ({fmtDate(bloodTest.previousDate)})
          </p>

          {!analyse && (
            <button
              onClick={() => setAnalyse(true)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-accent-ink transition hover:brightness-110"
            >
              <Sparkles className="h-4 w-4" /> Review with my coach
            </button>
          )}

          <div ref={analysisRef} className="scroll-mt-20">
            {analyse && (
              <Card className="mt-6 border-accent/30">
                <Analysis />
              </Card>
            )}
          </div>
        </>
      )}
    </>
  );
}
