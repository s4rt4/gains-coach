import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CaloriesChart, StrengthChart, WeightChart } from "@/components/Charts";
import { SyncCard } from "@/components/SyncCard";
import { Card, CardTitle, PageHeader, Pill, Stat } from "@/components/ui";
import { profile, recentWorkouts, weeks } from "@/data/persona";
import { getStats } from "@/lib/analytics";

const fmt = (n: number) => n.toLocaleString("en-GB");
const fmtDate = (d: string) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

export default function Dashboard() {
  const s = getStats();
  const cur = s.current;
  const startW = weeks[0].avgWeightKg;
  const goalPct = Math.round(((startW - cur.avgWeightKg) / (startW - profile.goalWeightKg)) * 100);

  return (
    <>
      <PageHeader eyebrow="Tuesday 13 October · Week 12 of cut" title={`Morning, ${profile.firstName}`} />

      {/* Coach insight */}
      <Card className="relative mb-5 overflow-hidden border-accent/30 bg-gradient-to-br from-accent/[0.09] via-surface to-surface">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <Pill tone="accent">
              <Sparkles className="h-3 w-3" /> Coach insight
            </Pill>
            <h2 className="font-display mt-3 text-2xl font-bold uppercase leading-tight sm:text-3xl">
              Fix your weekends before you cut calories
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Fat loss slowed to <span className="num text-text">{s.recentRateKg} kg/wk</span> over the last 3 weeks.
              Weekdays average <span className="num text-text">2,310 kcal</span>, but weekends average{" "}
              <span className="num text-text">3,360</span>, and your steps are down to{" "}
              <span className="num text-text">{fmt(cur.steps)}</span>. Your waist is still dropping, so the plan is working.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/check-in/"
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition hover:brightness-110"
            >
              Weekly check-in <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/coach/"
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold transition hover:border-accent hover:text-accent"
            >
              Ask coach
            </Link>
          </div>
        </div>
      </Card>

      {/* Key stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Weight (7-day avg)" value={cur.avgWeightKg.toFixed(1)} unit="kg" delta={`${s.weekChangeKg} kg this week · −${s.totalLossKg.toFixed(1)} total`} deltaTone="good" />
        <Stat label="Waist" value={cur.waistCm.toFixed(1)} unit="cm" delta={`−${s.waistLossCm} cm since start`} deltaTone="good" />
        <Stat label="Calories (avg)" value={fmt(cur.kcal)} unit="kcal" delta={`+${s.kcalVsTarget} vs target`} deltaTone="bad" />
        <Stat label="Steps (avg)" value={fmt(cur.steps)} delta={`${fmt(cur.steps - profile.targets.steps)} vs target`} deltaTone="bad" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle action={<Pill>84 days</Pill>}>Bodyweight</CardTitle>
          <WeightChart />
        </Card>

        <Card>
          <CardTitle>Goal progress</CardTitle>
          <div className="flex items-end justify-between">
            <p className="num font-display text-5xl font-bold leading-none">
              {goalPct}
              <span className="text-2xl text-muted">%</span>
            </p>
            <p className="text-right text-xs text-muted">
              {startW} → <span className="text-ok">{profile.goalWeightKg} kg</span>
              <br />
              by 20 Dec
            </p>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-gradient-to-r from-accent to-ok" style={{ width: `${Math.min(100, Math.max(0, goalPct))}%` }} />
          </div>
          <dl className="mt-5 space-y-2.5 text-sm">
            {[
              ["To go", `${s.toGoKg} kg`],
              ["Weeks left", `${s.weeksLeft}`],
              ["Needed pace", `${s.neededRateKg} kg/wk`],
              ["Current pace", `${s.recentRateKg} kg/wk`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-line pb-2.5 last:border-0">
                <dt className="text-muted">{k}</dt>
                <dd className={`num font-semibold ${k === "Current pace" ? "text-warn" : ""}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle action={<Pill tone="watch">Bench {s.benchChangePct}% from peak</Pill>}>Strength · estimated 1RM</CardTitle>
          <StrengthChart />
        </Card>

        <SyncCard />

        <Card className="flex flex-col lg:col-span-2">
          <CardTitle action={<Pill>Target 2,400 kcal</Pill>}>Calories · weekly average</CardTitle>
          <CaloriesChart className="h-56 lg:h-auto lg:min-h-56 lg:flex-1" />
        </Card>

        <Card>
          <CardTitle action={<Pill tone="accent">Hevy</Pill>}>Recent workouts</CardTitle>
          <ul className="space-y-3">
            {recentWorkouts.map((w) => (
              <li key={w.date} className="rounded-xl bg-surface-2/70 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">{w.title}</p>
                  <p className="text-xs text-muted">{fmtDate(w.date)}</p>
                </div>
                <p className="num mt-0.5 text-xs text-muted">
                  {w.durationMin} min · {fmt(w.volumeKg)} kg volume
                </p>
                <p className="mt-1.5 truncate text-xs text-text/70">
                  {w.exercises[0].name}: {w.exercises[0].sets}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
