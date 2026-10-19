"use client";

import { useState } from "react";
import { Brain, Check, Database, MessageCircle, Pencil, Pin, PinOff, Plus, Trash2, Undo2, X } from "lucide-react";
import { Card, CardTitle, PageHeader, Pill } from "@/components/ui";
import { memories as seed, memoryCategories, reportSummaries, type MemoryCategory, type MemoryItem } from "@/data/memory";

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function MemoryRow({
  m,
  onPin,
  onSave,
  onForget,
}: {
  m: MemoryItem;
  onPin: () => void;
  onSave: (text: string) => void;
  onForget: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(m.text);
  const icon = "rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-text";
  return (
    <li className="group border-b border-line py-3.5 last:border-0">
      {editing ? (
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            autoFocus
            aria-label="Edit memory"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setDraft(m.text);
                setEditing(false);
              }
            }}
            className="min-w-0 flex-1 resize-none rounded-lg border border-accent bg-surface-2 px-3 py-2 text-sm outline-none"
          />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              aria-label="Save"
              onClick={() => {
                onSave(draft.trim() || m.text);
                setEditing(false);
              }}
              className="rounded-lg bg-accent p-1.5 text-accent-ink"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Cancel"
              onClick={() => {
                setDraft(m.text);
                setEditing(false);
              }}
              className={icon}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed">
              {m.pinned && <Pin className="mr-1.5 inline h-3.5 w-3.5 align-[-2px] text-accent" />}
              {m.text}
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
              <Pill tone={m.source === "You told me" ? "accent" : "expected"}>{m.source}</Pill>
              <span>
                {m.where} · {fmtDate(m.date)}
              </span>
              {m.usedIn && <span className="text-muted/80">· Used in “{m.usedIn}”</span>}
            </p>
          </div>
          <div className="flex shrink-0 gap-0.5 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
            <button type="button" aria-label={m.pinned ? "Unpin" : "Pin"} onClick={onPin} className={icon}>
              {m.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label="Edit"
              onClick={() => {
                setDraft(m.text);
                setEditing(true);
              }}
              className={icon}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Forget" onClick={onForget} className={`${icon} hover:text-danger`}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function MemoryPage() {
  const [items, setItems] = useState(seed);
  const [filter, setFilter] = useState<MemoryCategory | "All">("All");
  const [enabled, setEnabled] = useState(true);
  const [forgotten, setForgotten] = useState<{ item: MemoryItem; index: number } | null>(null);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<MemoryCategory>("Training");

  const update = (id: string, patch: Partial<MemoryItem>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const forget = (id: string) => {
    const index = items.findIndex((x) => x.id === id);
    if (index < 0) return;
    setForgotten({ item: items[index], index });
    setItems((xs) => xs.filter((x) => x.id !== id));
  };
  const undo = () => {
    if (!forgotten) return;
    setItems((xs) => [...xs.slice(0, forgotten.index), forgotten.item, ...xs.slice(forgotten.index)]);
    setForgotten(null);
  };
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    setItems((xs) => [{ id: `new-${Date.now()}`, category, text: text.trim(), source: "You told me", where: "Added here", date: today }, ...xs]);
    setText("");
    setFilter("All");
  };

  const groups = memoryCategories
    .filter((c) => filter === "All" || c === filter)
    .map((c) => ({
      category: c,
      items: items.filter((x) => x.category === c).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned)),
    }))
    .filter((g) => g.items.length);

  return (
    <>
      <PageHeader eyebrow="Long-term memory" title="Coach memory">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        >
          <span className="text-muted">Memory</span>
          <span className={`relative h-6 w-11 rounded-full transition ${enabled ? "bg-accent" : "bg-line"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-bg transition-all ${enabled ? "left-[22px]" : "left-0.5"}`} />
          </span>
          <span className="w-6 font-semibold">{enabled ? "On" : "Off"}</span>
        </button>
      </PageHeader>

      {!enabled && (
        <div className="mb-5 rounded-2xl border border-warn/25 bg-warn/[0.07] p-4 text-sm text-text/80">
          Memory is off. Your coach still sees your synced data, but won&apos;t use or save anything below until you turn it back on.
        </div>
      )}

      <div className={`grid gap-5 lg:grid-cols-3 ${enabled ? "" : "opacity-50"}`}>
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="mem-text">
                Something your coach should remember
              </label>
              <input
                id="mem-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tell your coach something to remember…"
                disabled={!enabled}
                className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-4 text-sm outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                  aria-label="Category"
                  disabled={!enabled}
                  className="h-11 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-sm outline-none focus:border-accent sm:flex-none"
                >
                  {memoryCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!enabled || !text.trim()}
                  className="flex h-11 items-center gap-1.5 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink transition hover:brightness-110 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </form>
          </Card>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Category">
            {(["All", ...memoryCategories] as const).map((c) => {
              const n = c === "All" ? items.length : items.filter((x) => x.category === c).length;
              return (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={filter === c}
                  onClick={() => setFilter(c)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    filter === c ? "border-accent bg-accent text-accent-ink" : "border-line text-muted hover:text-text"
                  }`}
                >
                  {c} <span className="num opacity-70">{n}</span>
                </button>
              );
            })}
          </div>

          {groups.map((g) => (
            <Card key={g.category}>
              <CardTitle>{g.category}</CardTitle>
              <ul>
                {g.items.map((m) => (
                  <MemoryRow
                    key={m.id}
                    m={m}
                    onPin={() => update(m.id, { pinned: !m.pinned })}
                    onSave={(t) => update(m.id, { text: t })}
                    onForget={() => forget(m.id)}
                  />
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="space-y-5">
          <Card>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent" /> How memory works
              </span>
            </CardTitle>
            <ul className="space-y-3 text-sm text-text/80">
              <li className="flex gap-3">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                After each chat and check-in, your coach saves the facts that will matter later, one per line.
              </li>
              <li className="flex gap-3">
                <Database className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                Patterns in your synced data (Hevy, nutrition, check-ins) are saved too, marked “From your data”.
              </li>
              <li className="flex gap-3">
                <Pin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                Everything here goes into every answer. Pinned items are never dropped; edit or forget anything at any time.
              </li>
            </ul>
          </Card>

          <Card>
            <CardTitle>Past weekly reports</CardTitle>
            <ol className="space-y-3">
              {reportSummaries.map((r) => (
                <li key={r.week} className="text-sm">
                  <p className="text-xs font-semibold text-accent">Week {r.week}</p>
                  <p className="mt-0.5 text-text/80">{r.text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-muted">Your coach re-reads these before writing the next report.</p>
          </Card>
        </div>
      </div>

      {forgotten && (
        <div className="fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm shadow-lg lg:bottom-8">
          <span>Forgotten.</span>
          <span className="flex items-center gap-1">
            <button type="button" onClick={undo} className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-accent hover:bg-surface">
              <Undo2 className="h-4 w-4" /> Undo
            </button>
            <button type="button" aria-label="Dismiss" onClick={() => setForgotten(null)} className="rounded-lg p-1 text-muted hover:bg-surface">
              <X className="h-4 w-4" />
            </button>
          </span>
        </div>
      )}
    </>
  );
}
