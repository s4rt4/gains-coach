"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ShieldCheck } from "lucide-react";
import { Card, CardTitle, PageHeader, Pill, Stat } from "@/components/ui";
import { RevenueChart, SignupsChart } from "@/components/AdminCharts";
import { AI_COST_PER_USER, ARPU, COMMISSION, current, influencers, monthly, reviews } from "@/data/admin";

const gbp = (v: number, d = 0) => `£${v.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export default function AdminOverview() {
  const [done, setDone] = useState<string[]>([]);
  const now = monthly.at(-1)!;
  const prev = monthly.at(-2)!;
  const growth = ((now.mrr - prev.mrr) / prev.mrr) * 100;
  const paymentFees = ARPU * 0.015 + 0.2;
  const hosting = 0.12;
  const margin = ARPU - AI_COST_PER_USER - paymentFees - hosting;

  return (
    <>
      <PageHeader eyebrow="Admin · October 2026" title="Business overview">
        <Pill tone="watch">Demo data</Pill>
      </PageHeader>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Monthly recurring revenue" value={gbp(now.mrr)} delta={`+${growth.toFixed(1)}% vs Sep`} deltaTone="good" />
        <Stat label="Paying subscribers" value={now.subscribers.toLocaleString("en-GB")} delta={`+${now.subscribers - prev.subscribers} this month · ${current.trials} on trial`} deltaTone="good" />
        <Stat label="AI cost per user" value={gbp(AI_COST_PER_USER, 2)} unit="/mo" delta={`${((AI_COST_PER_USER / ARPU) * 100).toFixed(1)}% of revenue`} />
        <Stat label="Monthly churn" value={current.churnRate.toFixed(1)} unit="%" delta="Down from 4.1% in Sep" deltaTone="good" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle
            action={
              <span className="flex items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" />MRR</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-info" />AI cost</span>
              </span>
            }
          >
            Revenue vs AI cost
          </CardTitle>
          <RevenueChart />
        </Card>

        <Card>
          <CardTitle>Per subscriber / month</CardTitle>
          <ul className="space-y-3 text-sm">
            {[
              ["Subscription (avg)", ARPU],
              ["Claude API", -AI_COST_PER_USER],
              ["Payment fees", -paymentFees],
              ["Hosting & storage", -hosting],
            ].map(([label, v]) => (
              <li key={label as string} className="flex justify-between">
                <span className="text-muted">{label}</span>
                <span className={`num font-medium ${(v as number) < 0 ? "text-text/80" : ""}`}>
                  {(v as number) < 0 ? "−" : ""}
                  {gbp(Math.abs(v as number), 2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
            <span className="text-sm font-semibold">Gross margin</span>
            <span className="num font-display text-3xl font-bold leading-none text-ok">
              {gbp(margin, 2)}
              <span className="ml-1.5 text-base text-muted">{Math.round((margin / ARPU) * 100)}%</span>
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Prompt caching keeps AI cost low: {current.cacheHitRate}% of coach context is reused between messages.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle action={<Pill tone="flag">{reviews.length - done.length} open</Pill>}>Safety review queue</CardTitle>
          <ul className="space-y-3">
            {reviews.map((r) => {
              const resolved = done.includes(r.user);
              return (
                <li key={r.user} className={`rounded-xl border border-line bg-surface-2/60 p-4 transition ${resolved ? "opacity-55" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{r.user}</p>
                    <Pill tone={r.tone}>{r.area}</Pill>
                    <span className="ml-auto">
                      {resolved ? <Pill tone="ok"><Check className="h-3 w-3" />Reviewed</Pill> : <Pill tone="neutral">{r.action}</Pill>}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-text/80">{r.detail}</p>
                  {!resolved && (
                    <button
                      onClick={() => setDone((d) => [...d, r.user])}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold transition hover:border-accent hover:text-accent"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Mark reviewed
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardTitle
              action={
                <Link href="/admin/influencers/" className="flex items-center gap-1 text-xs font-medium text-accent">
                  All <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              }
            >
              Top partners
            </CardTitle>
            <ul className="space-y-3">
              {influencers.slice(0, 3).map((inf, i) => (
                <li key={inf.code} className="flex items-center gap-3">
                  <span className="num w-4 text-sm font-semibold text-muted">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{inf.name}</p>
                    <p className="text-xs text-muted">{inf.active} paying · code {inf.code}</p>
                  </div>
                  <span className="num text-sm font-semibold">{gbp(inf.active * ARPU)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-line pt-3 text-xs text-muted">
              Partners earn {COMMISSION * 100}% of the revenue they bring in.
            </p>
          </Card>

          <Card>
            <CardTitle>Coach usage this month</CardTitle>
            <dl className="grid grid-cols-2 gap-4">
              {[
                ["Messages", current.messages.toLocaleString("en-GB")],
                ["Weekly reports", current.reports.toLocaleString("en-GB")],
                ["Blood reviews", current.bloodReviews.toLocaleString("en-GB")],
                ["Cache hit rate", `${current.cacheHitRate}%`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="num mt-1 font-display text-2xl font-bold leading-none">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        <Card className="lg:col-span-3">
          <CardTitle>New sign-ups per month</CardTitle>
          <SignupsChart />
        </Card>
      </div>
    </>
  );
}
