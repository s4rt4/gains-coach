"use client";

import { useState } from "react";
import { Check, CircleCheck, FileText, KeyRound, Loader2, Lock, Server, ShieldCheck, Upload } from "lucide-react";
import { Card, CardTitle, PageHeader, Pill } from "@/components/ui";
import { knowledgeBase } from "@/data/admin";

const secrets: { name: string; where: string; status: string; tone: "ok" | "watch" | "neutral" }[] = [
  { name: "Claude API (Anthropic)", where: "ANTHROPIC_API_KEY", status: "Not set · demo mode", tone: "watch" },
  { name: "Hevy", where: "Per-user key, encrypted in database", status: "Ready", tone: "ok" },
  { name: "Payments (Stripe)", where: "STRIPE_SECRET_KEY", status: "Not set", tone: "neutral" },
  { name: "File storage", where: "STORAGE_BUCKET", status: "Not set", tone: "neutral" },
];

const tones = {
  Supportive: "Solid week, Tom. Your average dropped 0.4 kg, right on track. Let's keep calories where they are and tighten up weekends a little.",
  Balanced: "Down 0.4 kg on the weekly average, right on target. No calorie change this week. The one thing to fix is weekend intake, which is running about 1,000 kcal over.",
  Direct: "0.4 kg down, on target. Calories stay at 2,400. Weekends are 1,000 kcal over plan. Fix that before we touch anything else.",
};

const initialGuardrails = [
  { id: "dosage", label: "Never give drug or dosage advice", detail: "Blood work answers point to a doctor instead", locked: true, on: true },
  { id: "age", label: "18+ only", detail: "Checked at sign-up", locked: true, on: true },
  { id: "floors", label: "Calorie floors and max rate of loss", detail: "Never below 1,500 kcal or 1% bodyweight per week", locked: false, on: true },
  { id: "ed", label: "Disordered eating detection", detail: "Pause deficit advice and share support resources", locked: false, on: true },
  { id: "sources", label: "Show data sources on every answer", detail: "Builds trust and makes answers checkable", locked: false, on: true },
];

type Doc = { name: string; detail: string; chunks: number; updated: string; state?: "uploading" | "indexing" };

export default function AdminCoach() {
  const [tone, setTone] = useState<keyof typeof tones>("Balanced");
  const [docs, setDocs] = useState<Doc[]>(knowledgeBase);
  const [rails, setRails] = useState(initialGuardrails);
  const [saved, setSaved] = useState(false);

  const upload = () => {
    const doc: Doc = { name: "Peak week & refeeds.pdf", detail: "Contest prep protocols", chunks: 0, updated: "Today", state: "uploading" };
    setDocs((d) => [doc, ...d]);
    setTimeout(() => setDocs((d) => d.map((x) => (x.name === doc.name ? { ...x, state: "indexing" } : x))), 1200);
    setTimeout(() => setDocs((d) => d.map((x) => (x.name === doc.name ? { ...x, state: undefined, chunks: 47 } : x))), 2800);
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <>
      <PageHeader eyebrow="Admin" title="Coach settings">
        <button
          onClick={save}
          className="flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink transition hover:brightness-110"
        >
          {saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Saved" : "Save changes"}
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle>Coach voice</CardTitle>
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-bg p-1">
            {(Object.keys(tones) as (keyof typeof tones)[]).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-lg py-2 text-sm font-semibold transition ${tone === t ? "bg-accent text-accent-ink" : "text-muted hover:text-text"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted">Preview</p>
          <p className="mt-2 rounded-xl border border-line bg-surface-2/60 p-4 text-sm leading-relaxed text-text/90">{tones[tone]}</p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Chat & voice", "Claude Sonnet 5.5"],
              ["Weekly reports & blood work", "Claude Opus 5.5"],
            ].map(([task, model]) => (
              <label key={task} className="block">
                <span className="text-xs font-medium text-muted">{task}</span>
                <select
                  defaultValue={model}
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm outline-none focus:border-accent"
                >
                  <option>Claude Haiku 5.5</option>
                  <option>Claude Sonnet 5.5</option>
                  <option>Claude Opus 5.5</option>
                </select>
              </label>
            ))}
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
            {[
              ["Language", "British English"],
              ["Units", "kg · kcal"],
              ["Memory", "Last 12 weeks"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="mt-0.5 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <CardTitle
            action={
              <button
                onClick={upload}
                className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold transition hover:border-accent hover:text-accent"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </button>
            }
          >
            Coaching knowledge base
          </CardTitle>
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d.name} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/60 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg text-accent">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{d.name}</p>
                  <p className="truncate text-xs text-muted">{d.detail}</p>
                </div>
                {d.state ? (
                  <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-accent">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {d.state === "uploading" ? "Uploading" : "Indexing"}
                  </span>
                ) : (
                  <span className="num shrink-0 text-right text-xs text-muted">
                    {d.chunks} sections
                    <br />
                    {d.updated}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Your own methods and protocols. The coach looks up the relevant sections before answering, so advice follows your
            approach, not generic internet advice.
          </p>
        </Card>

        <Card>
          <CardTitle>Guardrails</CardTitle>
          <ul className="divide-y divide-line">
            {rails.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <ShieldCheck className={`h-4 w-4 shrink-0 ${r.on ? "text-ok" : "text-muted"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{r.label}</p>
                  <p className="text-xs text-muted">{r.detail}</p>
                </div>
                {r.locked ? (
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Lock className="h-3.5 w-3.5" />
                    Always on
                  </span>
                ) : (
                  <button
                    role="switch"
                    aria-checked={r.on}
                    aria-label={r.label}
                    onClick={() => setRails((rs) => rs.map((x) => (x.id === r.id ? { ...x, on: !x.on } : x)))}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${r.on ? "bg-ok" : "bg-line"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${r.on ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle action={<KeyRound className="h-4 w-4 text-muted" />}>API keys & integrations</CardTitle>
          <ul className="divide-y divide-line">
            {secrets.map((s) => (
              <li key={s.name} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className={`truncate text-xs text-muted ${s.where.includes(" ") ? "" : "font-mono"}`}>{s.where}</p>
                </div>
                <Pill tone={s.tone}>
                  {s.tone === "ok" && <CircleCheck className="h-3 w-3" />}
                  {s.status}
                </Pill>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-3 rounded-xl border border-line bg-bg p-4">
            <Server className="mt-0.5 h-4 w-4 shrink-0 text-info" />
            <p className="text-xs leading-relaxed text-muted">
              Keys live as encrypted secrets on the server and are never sent to the browser or shown here. This panel only
              shows whether each one is configured. Adding the Claude key switches the coach from demo to live.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
