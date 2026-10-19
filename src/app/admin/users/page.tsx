"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Smartphone, TriangleAlert, X } from "lucide-react";
import { Card, PageHeader, Pill } from "@/components/ui";
import { users, type AdminUser, type UserStatus } from "@/data/admin";

const statusPill: Record<UserStatus, { tone: "ok" | "accent" | "watch" | "neutral"; label: string }> = {
  active: { tone: "ok", label: "Active" },
  trial: { tone: "accent", label: "Trial" },
  past_due: { tone: "watch", label: "Past due" },
  churned: { tone: "neutral", label: "Churned" },
};

const filters: { id: "all" | UserStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "trial", label: "Trial" },
  { id: "past_due", label: "Past due" },
  { id: "churned", label: "Churned" },
];

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const initials = (name: string) => name.split(" ").map((p) => p[0]).join("");

export default function AdminUsers() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | UserStatus>("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const q = query.trim().toLowerCase();
  const rows = users.filter(
    (u) =>
      (filter === "all" || u.status === filter) &&
      (!q || u.name.toLowerCase().includes(q) || u.email.includes(q) || u.source.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHeader eyebrow="Admin" title="Users">
        <p className="text-sm text-muted">2,452 members · showing latest activity</p>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex h-11 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 focus-within:border-accent sm:w-80">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or partner code"
            aria-label="Search members"
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>
        <div className="flex gap-1.5 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === f.id ? "border-accent bg-accent text-accent-ink" : "border-line text-muted hover:text-text"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Member</th>
                <th className="px-3 py-3 font-semibold">Plan</th>
                <th className="px-3 py-3 font-semibold">Source</th>
                <th className="px-3 py-3 font-semibold">Last active</th>
                <th className="px-3 py-3 text-right font-semibold">Messages</th>
                <th className="px-3 py-3 text-right font-semibold">AI cost</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelected(u)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(u);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`Open ${u.name}`}
                  className={`cursor-pointer border-b border-line/70 outline-none transition focus-visible:bg-surface-2 last:border-0 hover:bg-surface-2 ${selected?.id === u.id ? "bg-surface-2" : ""}`}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-muted">
                        {initials(u.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-semibold">
                          {u.name}
                          {u.flag && <TriangleAlert className="h-3.5 w-3.5 text-warn" />}
                        </p>
                        <p className="truncate text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">{u.plan}</td>
                  <td className="px-3 py-3">
                    <span className={u.source === "Organic" ? "text-muted" : "font-mono text-xs font-semibold text-accent"}>{u.source}</span>
                  </td>
                  <td className="px-3 py-3 text-muted">{u.lastActive}</td>
                  <td className="num px-3 py-3 text-right">{u.messages}</td>
                  <td className="num px-3 py-3 text-right">£{u.aiCost.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <Pill tone={statusPill[u.status].tone}>{statusPill[u.status].label}</Pill>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-muted">
                    No members match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && <UserPanel user={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function UserPanel({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const s = statusPill[user.status];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-end bg-black/50 backdrop-blur-[2px] sm:items-stretch" onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={user.name}
        className="max-h-[85dvh] w-full overflow-y-auto rounded-t-2xl border border-line bg-surface p-6 sm:max-h-none sm:w-[400px] sm:rounded-none sm:border-y-0 sm:border-r-0"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-ok font-bold text-accent-ink">
              {initials(user.name)}
            </span>
            <div>
              <p className="font-display text-2xl font-bold uppercase leading-none">{user.name}</p>
              <p className="mt-1 text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Pill tone={s.tone}>{s.label}</Pill>
          <Pill tone="neutral">{user.phase} phase</Pill>
          <Pill tone="neutral">{user.plan}</Pill>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-line bg-surface-2/60 p-4">
          {[
            ["Joined", fmtDate(user.joined)],
            ["Source", user.source],
            ["Messages (Oct)", String(user.messages)],
            ["AI cost (Oct)", `£${user.aiCost.toFixed(2)}`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="num mt-0.5 text-sm font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        {user.flag && (
          <div className="mt-4 flex gap-3 rounded-xl border border-warn/25 bg-warn/8 p-4 text-sm">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
            <p className="leading-relaxed text-text/85">
              <span className="font-semibold">{user.flag} flag</span> in the safety review queue.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Connected sources</p>
          {["Hevy", "Nutrition log", "Weekly check-ins"].map((c) => (
            <div key={c} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
              {c}
              <Pill tone="ok">Synced</Pill>
            </div>
          ))}
        </div>

        {user.id === "u1" && (
          <Link
            href="/"
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-ink transition hover:brightness-110"
          >
            <Smartphone className="h-4 w-4" />
            Open member view
          </Link>
        )}
      </aside>
    </div>
  );
}
