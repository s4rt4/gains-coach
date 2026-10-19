"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, History, ListChecks, NotebookPen, Trash2, X } from "lucide-react";
import { dayLabel, earlierSessions, notesAsText, type SavedTakeaway } from "@/lib/coach-notes";

export type TakeawayItem = { id: string; question: string; points: string[] };

function Points({ points }: { points: string[] }) {
  return (
    <ul className="space-y-1.5">
      {points.map((p) => (
        <li key={p} className="flex gap-2 text-[13.5px] leading-snug text-text/90">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

function SaveButton({ saved, onToggle, compact = false }: { saved: boolean; onToggle: () => void; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      title={saved ? "Remove from notes" : "Save to notes"}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
        saved
          ? "border-accent/30 bg-accent/12 text-accent hover:bg-accent/20"
          : "border-line bg-surface text-text hover:border-accent hover:text-accent"
      }`}
    >
      {saved ? <Check className="h-3.5 w-3.5" /> : <NotebookPen className="h-3.5 w-3.5" />}
      {saved ? "Saved" : compact ? "Save" : "Save to notes"}
    </button>
  );
}

/** Compact "Key takeaways" block shown under a finished coach answer. */
export function TakeawaysBlock({ points, saved, onToggleSave }: { points: string[]; saved: boolean; onToggleSave: () => void }) {
  return (
    <div className="mt-3 rounded-xl border border-accent/20 bg-accent/5 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-accent">
          <ListChecks className="h-3.5 w-3.5" />
          Key takeaways
        </p>
        <SaveButton saved={saved} onToggle={onToggleSave} />
      </div>
      <Points points={points} />
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Group({ question, points, action }: { question: string; points: string[]; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3.5">
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <p className="text-sm font-semibold leading-snug text-text">{question}</p>
        {action}
      </div>
      <Points points={points} />
    </div>
  );
}

/** Session notes sheet: takeaways from this chat, saved ones from earlier, and the member's own notes. */
export function NotesPanel({
  current,
  saved,
  onToggleSave,
  onRemove,
  notes,
  onNotesChange,
  onClose,
}: {
  current: TakeawayItem[];
  saved: SavedTakeaway[];
  onToggleSave: (item: TakeawayItem) => void;
  onRemove: (id: string) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Lock the page, focus the sheet, Esc closes, Tab stays inside, focus goes back to the opener.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), textarea, [href], input, [tabindex]:not([tabindex='-1'])",
      );
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      // Focus fell out of the sheet (e.g. a click on plain text sent it to <body>): pull it back in.
      if (!panelRef.current.contains(document.activeElement)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      try { opener?.focus?.(); } catch {}
    };
  }, []);

  const savedIds = new Set(saved.map((s) => s.id));
  const currentIds = new Set(current.map((c) => c.id));
  // Saved from earlier visits (anything not already shown under "This conversation"), newest first, grouped by day.
  const earlierSaved = saved.filter((s) => !currentIds.has(s.id)).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  const byDay: { day: string; items: SavedTakeaway[] }[] = [];
  for (const s of earlierSaved) {
    const day = dayLabel(s.savedAt);
    const g = byDay.find((x) => x.day === day);
    if (g) g.items.push(s);
    else byDay.push({ day, items: [s] });
  }

  const copyAll = async () => {
    const text = notesAsText(
      [
        { heading: "This conversation", items: current },
        ...byDay.map((g) => ({ heading: `Saved · ${g.day}`, items: g.items })),
        ...earlierSessions.map((s) => ({ heading: `${s.date} · ${s.title}`, items: s.items })),
      ],
      notes,
    );
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {}
    setCopied(ok ? "ok" : "fail");
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coach-notes-title"
        className="relative flex max-h-[88dvh] w-full flex-col rounded-t-2xl border border-line bg-bg shadow-2xl sm:h-full sm:max-h-none sm:max-w-md sm:rounded-none sm:border-y-0 sm:border-r-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5 sm:pt-[calc(14px+env(safe-area-inset-top))]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Coach Jim</p>
            <h2 id="coach-notes-title" className="font-display text-2xl font-bold uppercase leading-none">
              Session notes
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-text transition hover:border-accent hover:text-accent"
            >
              {copied === "ok" ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
              <span aria-live="polite">{copied === "ok" ? "Copied" : copied === "fail" ? "Couldn't copy" : "Copy all"}</span>
            </button>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close notes"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-text transition hover:text-accent"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-4 py-5 pb-[calc(20px+env(safe-area-inset-bottom))] sm:px-5">
          <Section title="This conversation" icon={<ListChecks className="h-3.5 w-3.5" />}>
            {current.length ? (
              current.map((c) => (
                <Group
                  key={c.id}
                  question={c.question}
                  points={c.points}
                  action={<SaveButton compact saved={savedIds.has(c.id)} onToggle={() => onToggleSave(c)} />}
                />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-line px-3.5 py-4 text-sm text-muted">
                Ask Coach Jim a question and the key takeaways from his answer will collect here.
              </p>
            )}
          </Section>

          {byDay.map((g) => (
            <Section key={g.day} title={`Saved · ${g.day}`} icon={<NotebookPen className="h-3.5 w-3.5" />}>
              {g.items.map((s) => (
                <Group
                  key={s.id}
                  question={s.question}
                  points={s.points}
                  action={
                    <button
                      type="button"
                      onClick={() => onRemove(s.id)}
                      aria-label={`Remove "${s.question}" from notes`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  }
                />
              ))}
            </Section>
          ))}

          {earlierSessions.map((s) => (
            <Section key={s.id} title={`${s.date} · ${s.title}`} icon={<History className="h-3.5 w-3.5" />}>
              {s.items.map((it) => (
                <Group key={it.question} question={it.question} points={it.points} />
              ))}
            </Section>
          ))}

          <section className="space-y-2">
            <label htmlFor="coach-own-notes" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted">
              <NotebookPen className="h-3.5 w-3.5" />
              Your notes
            </label>
            <textarea
              id="coach-own-notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={5}
              placeholder="Anything you want to remember: questions for your next check-in, how a change felt…"
              className="w-full resize-y rounded-xl border border-line bg-surface px-3.5 py-3 text-[15px] leading-relaxed outline-none placeholder:text-muted focus:border-accent"
            />
            <p className="text-[11px] text-muted">Saved on this device as you type.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
