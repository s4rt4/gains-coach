// Session notes for the Coach Jim chat: saved "key takeaways" plus the member's own notes.
// Prototype only: kept in this browser's localStorage. In production these live on the member's account.

export type SavedTakeaway = {
  /** Question id (or "fallback"); one saved entry per question. */
  id: string;
  question: string;
  points: string[];
  /** ISO timestamp */
  savedAt: string;
};

export type NotesState = { saved: SavedTakeaway[]; notes: string };

export type EarlierSession = { id: string; date: string; title: string; items: { question: string; points: string[] }[] };

const KEY = "gains-coach.coach-notes.v1";

/** Read persisted notes. Call from effects or event handlers only (never during render). */
export function loadNotes(): NotesState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { saved: [], notes: "" };
    const v = (JSON.parse(raw) ?? {}) as Partial<NotesState>;
    const saved = Array.isArray(v.saved)
      ? v.saved.filter(
          (s): s is SavedTakeaway =>
            !!s && typeof s.id === "string" && typeof s.question === "string" && Array.isArray(s.points) && s.points.every((x) => typeof x === "string") && typeof s.savedAt === "string",
        )
      : [];
    return { saved, notes: typeof v.notes === "string" ? v.notes : "" };
  } catch {
    return { saved: [], notes: "" };
  }
}

/** Another tab changed the notes: call back so this tab can reload them (no event fires in the writing tab). */
export function onNotesChangedElsewhere(cb: () => void): () => void {
  const h = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) cb();
  };
  window.addEventListener("storage", h);
  return () => window.removeEventListener("storage", h);
}

export function storeNotes(state: NotesState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private mode / storage full: notes still work for this visit.
  }
}

/** A pre-seeded earlier conversation so the notes panel isn't empty in the demo. */
export const earlierSessions: EarlierSession[] = [
  {
    id: "2026-10-15",
    date: "Thu 15 Oct",
    title: "Weekend eating",
    items: [
      {
        question: "Why do I always overeat at the weekend?",
        points: [
          "Weekdays average about 2,310 kcal but weekends about 3,360 kcal, so two days undo most of the week.",
          "Most of the extra comes from drinks and sides on Saturday night, not the main meal.",
          "Plan Saturday's evening meal by Friday so it isn't decided when you're hungry.",
        ],
      },
      {
        question: "Can I still have a Sunday roast?",
        points: [
          "Yes: chicken or lean beef, potatoes roasted with 1 tsp of oil, and plenty of veg is about 750 kcal.",
          "Go easy on the Yorkshire puddings and gravy, which add around 300 kcal.",
          "Take a 30-minute walk after lunch to keep Sunday steps above 8,000.",
        ],
      },
    ],
  },
];

/** Plain-text export of everything, for copying into another notes app. */
export function notesAsText(
  groups: { heading: string; items: { question: string; points: string[] }[] }[],
  notes: string,
): string {
  const out: string[] = ["Coach Jim · key takeaways", ""];
  for (const g of groups) {
    if (!g.items.length) continue;
    out.push(g.heading.toUpperCase());
    for (const it of g.items) {
      out.push(`Q: ${it.question}`);
      for (const p of it.points) out.push(`  - ${p}`);
      out.push("");
    }
  }
  if (notes.trim()) out.push("MY NOTES", notes.trim(), "");
  return out.join("\n").trim();
}

/** "Today", "Yesterday" or e.g. "Thu 15 Oct". */
export function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Earlier";
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
