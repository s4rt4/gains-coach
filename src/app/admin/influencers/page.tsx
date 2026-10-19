"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link2, Plus, X } from "lucide-react";
import { Card, CardTitle, PageHeader, Pill, Stat } from "@/components/ui";
import { InfluencerChart } from "@/components/AdminCharts";
import { ARPU, COMMISSION, current, influencers as seed, type Influencer } from "@/data/admin";

const gbp = (v: number) => `£${Math.round(v).toLocaleString("en-GB")}`;
const link = (code: string) => `gainscoach.app/r/${code.toLowerCase()}`;

export default function AdminInfluencers() {
  const [list, setList] = useState<Influencer[]>(seed);
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const active = list.reduce((s, i) => s + i.active, 0);
  const signups = list.reduce((s, i) => s + i.signups, 0);
  const revenue = active * ARPU;

  const copy = (code: string) => {
    navigator.clipboard?.writeText("https://" + link(code)).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <>
      <PageHeader eyebrow="Admin" title="Influencer partners">
        <button
          onClick={() => setAdding(true)}
          className="flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Add partner
        </button>
      </PageHeader>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Revenue from partners" value={gbp(revenue)} unit="/mo" delta={`${Math.round((active / current.subscribers) * 100)}% of all subscribers`} deltaTone="good" />
        <Stat label="Paying via partners" value={active.toLocaleString("en-GB")} delta={`${signups.toLocaleString("en-GB")} sign-ups all time`} />
        <Stat label="Payouts due 1 Nov" value={gbp(revenue * COMMISSION)} delta={`${COMMISSION * 100}% commission`} />
        <Stat label="Trial to paid" value={Math.round((active / signups) * 100).toString()} unit="%" delta="Organic: 61%" deltaTone="good" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3 overflow-hidden p-0">
          <div className="p-5 pb-0">
            <CardTitle>Partners</CardTitle>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-y border-line text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Partner</th>
                  <th className="px-3 py-3 font-semibold">Code</th>
                  <th className="px-3 py-3 text-right font-semibold">Paying</th>
                  <th className="px-3 py-3 text-right font-semibold">MRR</th>
                  <th className="px-3 py-3 text-right font-semibold">Payout</th>
                  <th className="px-5 py-3 font-semibold">Link</th>
                </tr>
              </thead>
              <tbody>
                {list.map((inf) => (
                  <tr key={inf.code} className="border-b border-line/70 last:border-0">
                    <td className="px-5 py-3">
                      <p className="flex items-center gap-2 font-semibold">
                        {inf.name}
                        {inf.status === "new" && <Pill tone="accent">New</Pill>}
                      </p>
                      <p className="text-xs text-muted">
                        {inf.handle} · {inf.audience} subs
                      </p>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-accent">{inf.code}</td>
                    <td className="num px-3 py-3 text-right">{inf.active}</td>
                    <td className="num px-3 py-3 text-right font-semibold">{gbp(inf.active * ARPU)}</td>
                    <td className="num px-3 py-3 text-right text-muted">{gbp(inf.active * ARPU * COMMISSION)}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => copy(inf.code)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-muted transition hover:text-text"
                      >
                        {copied === inf.code ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied === inf.code ? "Copied" : "Copy"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="flex flex-col lg:col-span-2">
          <CardTitle
            action={
              <span className="flex items-center gap-3 text-xs text-muted">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#3a3f48]" />Sign-ups</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" />Paying</span>
              </span>
            }
          >
            Conversion by partner
          </CardTitle>
          <InfluencerChart data={list} className="h-64 lg:h-auto lg:min-h-64 lg:flex-1" />
        </Card>
      </div>

      {adding && (
        <AddPartner
          onClose={() => setAdding(false)}
          taken={list.map((i) => i.code)}
          onAdd={(inf) => {
            setList((l) => [...l, inf]);
            setAdding(false);
          }}
        />
      )}
    </>
  );
}

function AddPartner({ onClose, onAdd, taken }: { onClose: () => void; onAdd: (i: Influencer) => void; taken: string[] }) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const base = (name.trim().split(/\s+/).at(-1) || "").replace(/[^a-z]/gi, "").toUpperCase().slice(0, 10);
  // Codes are the partner's key: suffix a number if this one is already used
  let code = base;
  for (let n = 2; code && taken.includes(code); n++) code = base.slice(0, 10 - String(n).length) + n;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/55 backdrop-blur-[2px] sm:items-center" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (!code) return;
          onAdd({ name: name.trim(), handle: handle || "@" + code.toLowerCase(), audience: "—", code, signups: 0, active: 0, status: "new" });
        }}
        role="dialog"
        aria-modal="true"
        aria-label="New partner"
        className="w-full rounded-t-2xl border border-line bg-surface p-6 sm:max-w-md sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl font-bold uppercase leading-none">New partner</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {[
            ["Name", name, setName, "e.g. Alex Carter"],
            ["Channel handle", handle, setHandle, "@channel"],
          ].map(([label, value, set, ph]) => (
            <label key={label as string} className="block">
              <span className="text-xs font-medium text-muted">{label as string}</span>
              <input
                value={value as string}
                onChange={(e) => (set as (v: string) => void)(e.target.value)}
                placeholder={ph as string}
                className="mt-1.5 h-11 w-full rounded-xl border border-line bg-bg px-3.5 text-sm outline-none placeholder:text-muted/60 focus:border-accent"
              />
            </label>
          ))}
          <div className="rounded-xl border border-dashed border-line bg-bg p-4">
            <p className="text-xs font-medium text-muted">Generated referral</p>
            <p className="mt-1.5 font-mono text-lg font-semibold text-accent">{code || "CODE"}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <Link2 className="h-3.5 w-3.5" />
              {link(code || "code")}
            </p>
          </div>
          <p className="text-xs text-muted">
            Followers get a 14-day free trial. The partner earns {COMMISSION * 100}% of what their referrals pay, every month.
          </p>
        </div>
        <button
          type="submit"
          disabled={!code}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          Create partner
        </button>
      </form>
    </div>
  );
}
