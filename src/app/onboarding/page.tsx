"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity, ArrowLeft, ArrowRight, Brain, Check, Dumbbell, HeartPulse, Loader2, ShieldCheck, Target, TrendingDown, TrendingUp, Utensils,
} from "lucide-react";
import { startingTargets, type Answers, type Phase } from "@/lib/targets";

const steps = ["Account", "Body", "Goal", "Training", "Food", "Health", "Connect", "Plan"] as const;

const phases: { id: Phase; label: string; detail: string; icon: typeof TrendingDown }[] = [
  { id: "cut", label: "Cut", detail: "Lose fat, keep muscle", icon: TrendingDown },
  { id: "bulk", label: "Lean bulk", detail: "Build muscle, minimal fat", icon: TrendingUp },
  { id: "recomp", label: "Recomp", detail: "Slowly swap fat for muscle", icon: Activity },
  { id: "maintain", label: "Maintain", detail: "Hold and get stronger", icon: Target },
];

const splits = ["Push / Pull / Legs", "Upper / Lower", "PPL + Upper / Lower", "Full body", "Bro split"];
const dislikes = ["Fish", "Pork", "Red meat", "Eggs", "Dairy", "Spicy food", "Mushrooms"];
const diets = ["No restrictions", "Halal", "Vegetarian", "Vegan"];

type Connector = { id: string; name: string; detail: string; how: string; icon: typeof Dumbbell; result: string };
const connectors: Connector[] = [
  { id: "hevy", name: "Hevy", detail: "Workouts, sets and PRs", how: "Uses your Hevy Pro API key (Settings → Developer)", icon: Dumbbell, result: "60 workouts found" },
  { id: "nutrition", name: "MyFitnessPal / Cronometer", detail: "Calories and macros", how: "Import your food diary export (CSV)", icon: Utensils, result: "84 days imported" },
  { id: "health", name: "Apple Health / Health Connect", detail: "Steps, sleep and bodyweight", how: "Connects from the mobile app", icon: HeartPulse, result: "Steps, sleep and weight linked" },
];

const field = "h-12 w-full rounded-xl border border-line bg-surface px-4 text-[15px] outline-none focus:border-accent";
const chip = (on: boolean) =>
  `rounded-xl border px-3.5 py-2 text-sm font-medium transition ${on ? "border-accent bg-accent text-accent-ink" : "border-line text-muted hover:text-text"}`;

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-3 text-xs font-medium text-muted">
      {children}
      {hint && <span className="font-normal">{hint}</span>}
    </span>
  );
}

function NumberField({ label, unit, value, onChange, step = 1 }: { label: string; unit: string; value: number; onChange: (n: number) => void; step?: number }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <span className="flex h-12 items-center rounded-xl border border-line bg-surface px-4 focus-within:border-accent">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={Number.isNaN(value) ? "" : value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="num h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none"
        />
        <span className="text-sm text-muted">{unit}</span>
      </span>
    </label>
  );
}

const building = [
  "Calculating your starting targets",
  "Reading 60 workouts from Hevy",
  "Analysing 84 days of nutrition",
  "Saving what your coach should remember",
  "Writing your first week",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("Tom Walker");
  const [email, setEmail] = useState("tom.walker@example.com");
  const [a, setA] = useState<Answers>({
    sex: "male", age: 28, heightCm: 183, weightKg: 88, phase: "cut", goalWeightKg: 85, goalDate: "2026-12-20", days: 5,
  });
  const [split, setSplit] = useState(splits[2]);
  const [sessionMin, setSessionMin] = useState(75);
  const [injuries, setInjuries] = useState("Left shoulder flares up with upright rows.");
  const [avoid, setAvoid] = useState<string[]>(["Fish"]);
  const [diet, setDiet] = useState(diets[0]);
  const [enhanced, setEnhanced] = useState<"no" | "yes" | "skip" | null>(null);
  const [links, setLinks] = useState<Record<string, "idle" | "linking" | "done">>({});
  const [built, setBuilt] = useState(0);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((x) => ({ ...x, [k]: v }));
  const t = startingTargets(a);
  const pctPerWeek = Math.abs(t.ratePerWeek / a.weightKg) * 100;
  const tooFast = (a.phase === "cut" && pctPerWeek > 1) || (a.phase === "bulk" && pctPerWeek > 0.5);
  const goalWrongWay = (a.phase === "cut" && a.goalWeightKg >= a.weightKg) || (a.phase === "bulk" && a.goalWeightKg <= a.weightKg);
  const remembered = [injuries.trim(), avoid.length ? `Avoids ${avoid.join(", ").toLowerCase()}` : "", diet !== diets[0] ? diet : "", `${a.days} days a week, ${sessionMin} min sessions`].filter(Boolean);

  const canContinue = [
    name.trim() && /\S+@\S+\.\S+/.test(email),
    a.age > 15 && a.heightCm > 120 && a.weightKg > 35,
    a.goalWeightKg > 35 && !!a.goalDate && !goalWrongWay,
    true,
    true,
    enhanced !== null,
    true,
    true,
  ][step];

  const connect = (id: string) => {
    setLinks((l) => ({ ...l, [id]: "linking" }));
    setTimeout(() => setLinks((l) => ({ ...l, [id]: "done" })), 1300);
  };

  // last step: tick through the "building your plan" lines
  useEffect(() => {
    if (step !== steps.length - 1 || built >= building.length) return;
    const id = setTimeout(() => setBuilt((b) => b + 1), 650);
    return () => clearTimeout(id);
  }, [step, built]);

  const next = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (canContinue && step < steps.length - 1) setStep(step + 1);
  };

  return (
    <div className="min-h-dvh px-5 pb-16 pt-6 sm:pt-10">
      <div className="mx-auto w-full max-w-lg">
        <div className="flex items-center justify-between">
          <Link href="/login/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink">
              <Activity className="h-5 w-5" strokeWidth={2.75} />
            </span>
            <span className="font-display text-xl font-bold uppercase leading-none">
              Gains<span className="text-accent">Coach</span>
            </span>
          </Link>
          <span className="num text-xs text-muted">
            {step + 1} / {steps.length}
          </span>
        </div>

        <div className="mt-6 flex gap-1.5" aria-hidden>
          {steps.map((s, i) => (
            <span key={s} className={`h-1 flex-1 rounded-full transition ${i <= step ? "bg-accent" : "bg-line"}`} />
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-accent">{steps[step]}</p>

        <form onSubmit={next} className="mt-2">
          {step === 0 && (
            <>
              <h1 className="font-display text-4xl font-bold uppercase leading-none">Start your free week</h1>
              <p className="mt-2 text-sm text-muted">7 days free. Cancel any time.</p>
              <div className="mt-6 space-y-4">
                <label className="block">
                  <Label>Name</Label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={field} autoComplete="off" />
                </label>
                <label className="block">
                  <Label>Email</Label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} autoComplete="off" />
                </label>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="font-display text-4xl font-bold uppercase leading-none">About you</h1>
              <p className="mt-2 text-sm text-muted">Used to set your starting calories. You can change it later.</p>
              <div className="mt-6 space-y-4">
                <div>
                  <Label>Sex</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["male", "female"] as const).map((s) => (
                      <button key={s} type="button" onClick={() => set("sex", s)} aria-pressed={a.sex === s} className={`${chip(a.sex === s)} capitalize`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <NumberField label="Age" unit="yrs" value={a.age} onChange={(n) => set("age", n)} />
                  <NumberField label="Height" unit="cm" value={a.heightCm} onChange={(n) => set("heightCm", n)} />
                  <NumberField label="Weight" unit="kg" value={a.weightKg} step={0.1} onChange={(n) => set("weightKg", n)} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-4xl font-bold uppercase leading-none">Your goal</h1>
              <div className="mt-6 grid grid-cols-2 gap-2">
                {phases.map(({ id, label, detail, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => set("phase", id)}
                    aria-pressed={a.phase === id}
                    className={`rounded-xl border p-3.5 text-left transition ${a.phase === id ? "border-accent bg-accent/12" : "border-line hover:border-muted"}`}
                  >
                    <Icon className={`h-5 w-5 ${a.phase === id ? "text-accent" : "text-muted"}`} />
                    <p className="mt-2 font-semibold">{label}</p>
                    <p className="text-xs text-muted">{detail}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <NumberField label="Goal weight" unit="kg" value={a.goalWeightKg} step={0.5} onChange={(n) => set("goalWeightKg", n)} />
                <label className="block">
                  <Label>By</Label>
                  <input type="date" value={a.goalDate} onChange={(e) => set("goalDate", e.target.value)} className={`${field} num`} />
                </label>
              </div>

              <div className="mt-5 rounded-2xl border border-line bg-surface p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">Starting targets</p>
                <p className="num mt-2 font-display text-4xl font-bold leading-none">
                  {t.kcal.toLocaleString("en-GB")} <span className="text-lg text-muted">kcal / day</span>
                </p>
                <p className="num mt-2 text-sm text-muted">
                  <span className="font-semibold text-text">{t.proteinG} g</span> protein · {t.carbsG} g carbs · {t.fatG} g fat
                </p>
                <p className="num mt-3 text-xs text-muted">
                  Maintenance ≈ {t.maintenance.toLocaleString("en-GB")} kcal ·{" "}
                  {goalWrongWay
                    ? "goal weight doesn't match the phase"
                    : `${t.ratePerWeek > 0 ? "+" : ""}${t.ratePerWeek} kg / week over ${t.weeks} weeks`}
                </p>
                {tooFast && !goalWrongWay && (
                  <p className="mt-3 rounded-lg bg-warn/12 px-3 py-2 text-xs text-warn">
                    That&apos;s faster than {a.phase === "cut" ? "1%" : "0.5%"} of bodyweight a week. Your coach will suggest a later date so
                    you {a.phase === "cut" ? "keep your muscle" : "gain mostly muscle"}.
                  </p>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="font-display text-4xl font-bold uppercase leading-none">Training</h1>
              <div className="mt-6 space-y-5">
                <div>
                  <Label>Days a week</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 4, 5, 6].map((d) => (
                      <button key={d} type="button" onClick={() => set("days", d)} aria-pressed={a.days === d} className={chip(a.days === d)}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <Label>Split</Label>
                  <select value={split} onChange={(e) => setSplit(e.target.value)} className={field}>
                    {splits.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <div>
                  <Label>Time per session</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[45, 60, 75, 90].map((m) => (
                      <button key={m} type="button" onClick={() => setSessionMin(m)} aria-pressed={sessionMin === m} className={chip(sessionMin === m)}>
                        {m} min
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <Label hint="Your coach will remember this">Injuries or exercises to avoid</Label>
                  <textarea
                    value={injuries}
                    onChange={(e) => setInjuries(e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-accent"
                  />
                </label>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="font-display text-4xl font-bold uppercase leading-none">Food</h1>
              <p className="mt-2 text-sm text-muted">Meal plans and swaps will work around these.</p>
              <div className="mt-6 space-y-5">
                <div>
                  <Label>Don&apos;t eat</Label>
                  <div className="flex flex-wrap gap-2">
                    {dislikes.map((d) => {
                      const on = avoid.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setAvoid((xs) => (on ? xs.filter((x) => x !== d) : [...xs, d]))}
                          className={chip(on)}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label>Diet</Label>
                  <div className="flex flex-wrap gap-2">
                    {diets.map((d) => (
                      <button key={d} type="button" aria-pressed={diet === d} onClick={() => setDiet(d)} className={chip(diet === d)}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h1 className="font-display text-4xl font-bold uppercase leading-none">Health</h1>
              <p className="mt-2 text-sm text-muted">
                Do you use testosterone or other performance-enhancing compounds? It changes what “normal” looks like on your blood work.
              </p>
              <div className="mt-6 space-y-2">
                {(
                  [
                    ["no", "No"],
                    ["yes", "Yes"],
                    ["skip", "Prefer not to say"],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={enhanced === v}
                    onClick={() => setEnhanced(v)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition ${
                      enhanced === v ? "border-accent bg-accent/12" : "border-line hover:border-muted"
                    }`}
                  >
                    {l}
                    {enhanced === v && <Check className="h-4 w-4 text-accent" />}
                  </button>
                ))}
              </div>
              <p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted">
                <ShieldCheck className="h-4 w-4 shrink-0 text-ok" />
                Private to you and your coach. Only used to read your blood work; you can add your protocol details when you upload a lab report.
              </p>
            </>
          )}

          {step === 6 && (
            <>
              <h1 className="font-display text-4xl font-bold uppercase leading-none">Connect your apps</h1>
              <p className="mt-2 text-sm text-muted">Your coach works from real data, so you don&apos;t have to log things twice.</p>
              <ul className="mt-6 space-y-3">
                {connectors.map(({ id, name: n, detail, how, icon: Icon, result }) => {
                  const s = links[id] ?? "idle";
                  return (
                    <li key={id} className={`flex items-center gap-3 rounded-2xl border p-4 ${s === "done" ? "border-ok/30 bg-ok/[0.05]" : "border-line bg-surface"}`}>
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s === "done" ? "bg-ok/12 text-ok" : "bg-surface-2 text-accent"}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{n}</p>
                        <p className="text-xs text-muted">{s === "done" ? result : `${detail} · ${how}`}</p>
                      </div>
                      {s === "done" ? (
                        <Check className="h-5 w-5 text-ok" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => connect(id)}
                          disabled={s === "linking"}
                          className="flex h-9 items-center gap-1.5 rounded-lg bg-surface-2 px-3 text-sm font-medium transition hover:bg-line disabled:opacity-70"
                        >
                          {s === "linking" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-muted">Demo: connections are simulated. You can skip this and connect later.</p>
            </>
          )}

          {step === 7 && (
            <>
              <h1 className="font-display text-4xl font-bold uppercase leading-none">
                {built < building.length ? "Building your plan" : `You're set, ${name.split(" ")[0]}`}
              </h1>
              <ul className="mt-6 space-y-2.5">
                {building.map((b, i) => (
                  <li key={b} className={`flex items-center gap-3 text-sm transition ${i <= built ? "opacity-100" : "opacity-30"}`}>
                    {i < built ? <Check className="h-4 w-4 text-ok" /> : i === built ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <span className="h-4 w-4" />}
                    {b}
                  </li>
                ))}
              </ul>
              {built >= building.length && (
                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl border border-accent/30 bg-surface p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted">Week 1 targets</p>
                    <p className="num mt-2 font-display text-3xl font-bold leading-none">
                      {t.kcal.toLocaleString("en-GB")} kcal · {t.proteinG} g protein
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      {phases.find((p) => p.id === a.phase)!.label} to {a.goalWeightKg} kg · {a.days} days of {split}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-line bg-surface p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted">
                      <Brain className="h-4 w-4 text-accent" /> Your coach will remember
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {remembered.map((r) => (
                        <li key={r} className="flex gap-2">
                          <span className="text-accent">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="mt-8 flex gap-3">
            {step > 0 && step < steps.length - 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                aria-label="Back"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-line text-muted transition hover:text-text"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                type="submit"
                disabled={!canContinue}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-40"
              >
                {step === 6 && !Object.values(links).includes("done") ? "Skip for now" : "Continue"} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={built < building.length}
                onClick={() => router.push("/")}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-40"
              >
                Go to my dashboard <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
          {step === 0 && (
            <p className="mt-6 text-center text-sm text-muted">
              Already a member?{" "}
              <Link href="/login/" className="font-semibold text-accent hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
