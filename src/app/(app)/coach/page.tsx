"use client";

import { useEffect, useRef, useState } from "react";
import { AudioLines, Database, MessageSquareText, Mic, NotebookPen, SendHorizontal, Square, X } from "lucide-react";
import { NotesPanel, TakeawaysBlock, type TakeawayItem } from "@/components/CoachTakeaways";
import { CoachJim, CoachJimFace, type CoachJimHandle, type SpeechClip } from "@/components/coach-jim/CoachJim";
import { spokenSummary } from "@/components/coach-jim/lipsync";
import { Markdown } from "@/components/Markdown";
import { suggestedQuestions, type Suggested } from "@/data/coach-responses";
import { coachVoice } from "@/data/coach-voice";
import { profile } from "@/data/persona";
import { useStreamedText } from "@/lib/coach";
import { loadNotes, onNotesChangedElsewhere, storeNotes, type SavedTakeaway } from "@/lib/coach-notes";
import { BASE_PATH } from "@/lib/pwa";

type VoiceStatus = "idle" | "listening" | "thinking" | "speaking";

type Caption = { who: "you" | "jim"; text: string };

const voiceStatusText: Record<VoiceStatus, string> = {
  idle: "Tap the mic and ask me anything",
  listening: "Listening…",
  thinking: "Checking your data…",
  speaking: "Coach Jim is talking",
};

/** Full-screen voice mode (like ChatGPT / Gemini Live). The conversation also lands in the chat behind it. */
function VoiceOverlay({
  jimRef,
  status,
  caption,
  chips,
  onAsk,
  onMic,
  micDisabled,
  onClose,
}: {
  jimRef: React.RefObject<CoachJimHandle | null>;
  status: VoiceStatus;
  caption: Caption | null;
  chips: Suggested[];
  onAsk: (s: Suggested) => void;
  onMic: () => void;
  micDisabled: boolean;
  onClose: () => void;
}) {
  const speaking = status === "speaking", listening = status === "listening";
  return (
    <div role="dialog" aria-modal="true" aria-label="Voice mode with Coach Jim" className="fixed inset-0 z-50 flex flex-col bg-bg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,color-mix(in_srgb,var(--accent)_13%,transparent),transparent_62%)]" />

      <div className="relative flex items-center justify-between px-4 pt-[calc(14px+env(safe-area-inset-top))] sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Coach Jim · Voice</p>
        <button
          onClick={onClose}
          aria-label="Exit voice mode"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-text transition hover:text-accent"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-4">
        <div className="aspect-square w-full max-w-[min(440px,46vh)]">
          <CoachJim ref={jimRef} className="h-full w-full [mask-image:linear-gradient(to_bottom,black_78%,transparent)]" />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted" aria-live="polite">
          {speaking && <AudioLines className="h-4 w-4 animate-pulse text-accent" />}
          {voiceStatusText[status]}
        </p>
        <p
          className={`mt-3 line-clamp-4 min-h-[5.5rem] max-w-xl text-center text-lg leading-snug sm:text-xl ${
            caption?.who === "you" ? "text-muted" : "text-text"
          }`}
        >
          {caption?.text}
        </p>
      </div>

      <div className="relative px-4 pb-[calc(24px+env(safe-area-inset-bottom))]">
        {chips.length > 0 && (
          <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-auto sm:max-w-3xl sm:flex-wrap sm:justify-center sm:overflow-visible">
            {chips.map((s) => (
              <button
                key={s.id}
                onClick={() => onAsk(s)}
                className="shrink-0 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-text/90 transition hover:border-accent hover:text-accent"
              >
                {s.question}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={onClose}
            aria-label="Back to chat"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-text transition hover:text-accent"
          >
            <MessageSquareText className="h-5 w-5" />
          </button>
          <button
            onClick={onMic}
            disabled={micDisabled}
            aria-label={speaking ? "Stop talking" : "Speak to Coach Jim"}
            className={`relative flex h-20 w-20 items-center justify-center rounded-full transition disabled:opacity-40 ${
              listening ? "bg-danger text-white" : "bg-accent text-accent-ink"
            }`}
          >
            {listening && <span className="absolute inset-0 animate-ping rounded-full bg-danger/40" />}
            {speaking ? <Square className="relative h-6 w-6" fill="currentColor" /> : <Mic className="relative h-8 w-8" />}
          </button>
          <span className="h-12 w-12" aria-hidden />
        </div>
      </div>
    </div>
  );
}

// Browser speech-to-text (Chrome/Edge/Safari). Not in the TS DOM lib yet.
type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  abort?: () => void;
};
function createRecognition(): Recognition | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

/** Map free speech onto the closest demo question (the prototype only has answers for these). */
function closestQuestion(text: string): Suggested | undefined {
  const words = new Set(text.toLowerCase().match(/[a-z]+/g) ?? []);
  const stop = new Set(["i", "my", "the", "a", "for", "this", "should", "me", "how", "can", "am", "to", "on", "give", "week"]);
  let best: Suggested | undefined, bestScore = 0;
  for (const s of suggestedQuestions) {
    const score = (s.question.toLowerCase().match(/[a-z]+/g) ?? []).filter((w) => !stop.has(w) && words.has(w)).length;
    if (score > bestScore) { best = s; bestScore = score; }
  }
  return best;
}

type Msg =
  | { role: "user"; text: string }
  | { role: "coach"; text: string; sources?: string[]; stream?: boolean; takeaway?: TakeawayItem };

const greeting = `Morning ${profile.firstName}. I've synced your last Hevy session (**Lower B**, Sunday) and this week's nutrition. Your check-in is due today, and we've got **10 weeks** until your holiday. Ask me anything about training, food, sleep or your blood work, and I'll answer from your actual data.`;

const fallback =
  "In this prototype I answer the suggested questions with responses pre-generated by Claude from your data. In the live version, any question goes straight to Claude with your full context.";

const fallbackTakeaways = [
  "This demo answers the suggested questions above the message box.",
  "In the live version, any question goes to Coach Jim with your full data.",
];

const defaultSteps = ["Reading your Hevy history", "Checking nutrition & bodyweight", "Reviewing check-ins"];

function CoachAvatar() {
  return (
    <span className="h-8 w-8 shrink-0 overflow-hidden rounded-xl bg-surface-2 ring-1 ring-line">
      <CoachJimFace className="h-full w-full" />
    </span>
  );
}

function Thinking({ steps = defaultSteps }: { steps?: string[] }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 450);
    return () => clearInterval(id);
  }, [steps]);
  return (
    <div className="flex gap-3">
      <CoachAvatar />
      <div className="rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3 text-sm text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </span>
          {steps[step]}…
        </span>
      </div>
    </div>
  );
}

function CoachMessage({
  msg,
  onDone,
  saved = false,
  onToggleSave,
}: {
  msg: Extract<Msg, { role: "coach" }>;
  onDone?: () => void;
  saved?: boolean;
  onToggleSave?: (item: TakeawayItem) => void;
}) {
  const { shown, done } = useStreamedText(msg.stream ? msg.text : null);
  const text = msg.stream ? shown : msg.text;
  const finished = !msg.stream || done;

  useEffect(() => {
    if (msg.stream && done) onDone?.();
  }, [done, msg.stream, onDone]);

  return (
    <div className="flex gap-3">
      <CoachAvatar />
      <div className="min-w-0 max-w-2xl rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3.5">
        <div className={finished ? "" : "caret"}>
          <Markdown text={text} />
        </div>
        {/* Written summary for later; it lives in the transcript only and is never spoken in voice mode. */}
        {finished && msg.takeaway && onToggleSave && (
          <TakeawaysBlock points={msg.takeaway.points} saved={saved} onToggleSave={() => onToggleSave(msg.takeaway!)} />
        )}
        {finished && msg.sources && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
            {msg.sources.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                <Database className="h-3 w-3" /> {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Msg[]>([{ role: "coach", text: greeting }]);
  const [thinking, setThinking] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [asked, setAsked] = useState<string[]>([]);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [caption, setCaption] = useState<Caption | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [saved, setSaved] = useState<SavedTakeaway[]>([]);
  const [notes, setNotes] = useState("");
  const [notesLoaded, setNotesLoaded] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const jim = useRef<CoachJimHandle>(null);
  const voiceOnRef = useRef(false);
  // Refs for guards read from timers/recognition callbacks (state in those closures can be stale).
  const busyRef = useRef(false);
  const listeningRef = useRef(false);
  const speechId = useRef(0);
  const recRef = useRef<Recognition | null>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
    return t;
  };

  useEffect(() => {
    voiceOnRef.current = voiceOn;
  }, [voiceOn]);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  // Unmount: drop pending timers/intervals and any open mic.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      pending.clear();
      try { recRef.current?.abort?.(); } catch {}
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  // Session notes: read localStorage only after mount (static export, so no hydration mismatch)...
  useEffect(() => {
    const s = loadNotes();
    /* eslint-disable react-hooks/set-state-in-effect -- one-off hydration from browser storage */
    setSaved(s.saved);
    setNotes(s.notes);
    setNotesLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Another tab saved/edited notes: pick that up rather than overwriting it on our next write.
  useEffect(
    () =>
      onNotesChangedElsewhere(() => {
        const s = loadNotes();
        setSaved(s.saved);
        setNotes(s.notes);
      }),
    [],
  );

  // ...and write back on every change once loaded (never before, or we'd overwrite stored notes with empties).
  useEffect(() => {
    if (notesLoaded) storeNotes({ saved, notes });
  }, [notesLoaded, saved, notes]);

  const toggleSave = (item: TakeawayItem) =>
    setSaved((list) =>
      list.some((s) => s.id === item.id)
        ? list.filter((s) => s.id !== item.id)
        : [...list, { ...item, savedAt: new Date().toISOString() }],
    );

  const coachSays = (answer: string, q?: Suggested) => {
    if (!voiceOnRef.current || !jim.current) return;
    const summary = q?.spoken ?? spokenSummary(answer);
    // Pre-rendered neural voice for the demo questions (scripts/build_coach_voice.py)
    const voice = q?.spoken ? coachVoice[q.id] : undefined;
    const clip: SpeechClip | undefined = voice && { src: `${BASE_PATH}/voice/${q!.id}.mp3`, words: voice.words };
    const id = ++speechId.current;
    setVoiceStatus("speaking");
    setCaption({ who: "jim", text: summary });
    jim.current.setExpression("neutral");
    jim.current.speak(summary, clip).then(() => {
      if (!voiceOnRef.current || id !== speechId.current) return;
      setVoiceStatus("idle");
      jim.current?.setExpression("happy");
      later(() => {
        if (id === speechId.current) jim.current?.setExpression("neutral");
      }, 2500);
    });
  };

  const ask = (text: string, match?: Suggested) => {
    if (busyRef.current || !text.trim()) return;
    const q = match ?? suggestedQuestions.find((s) => s.question.toLowerCase() === text.trim().toLowerCase());
    busyRef.current = true;
    speechId.current++; // a new question supersedes whatever Jim was finishing
    setBusy(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setThinking(q?.checking ?? defaultSteps);
    if (voiceOnRef.current) {
      setVoiceStatus("thinking");
      setCaption({ who: "you", text });
      jim.current?.setExpression("thinking");
    }
    if (q) setAsked((a) => [...a, q.id]);
    later(() => {
      setThinking(null);
      const answer = q ? q.answer : fallback;
      const takeaway: TakeawayItem = q
        ? { id: q.id, question: q.question, points: q.takeaways }
        : { id: `fallback:${text.trim().toLowerCase()}`, question: text.trim(), points: fallbackTakeaways };
      setMessages((m) => [...m, { role: "coach", text: answer, sources: q?.sources, stream: true, takeaway }]);
      coachSays(answer, q);
    }, 1600);
  };

  const openVoice = () => {
    setVoiceStatus("idle");
    setCaption(null);
    setVoiceOn(true);
  };

  const closeVoice = () => {
    voiceOnRef.current = false;
    jim.current?.stop();
    setVoiceOn(false);
    setVoiceStatus("idle");
  };

  // Full-screen voice mode: lock the page behind it and let Esc close it.
  useEffect(() => {
    if (!voiceOn) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeVoice();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [voiceOn]);

  // Voice mode in a supporting browser: real speech-to-text, mapped onto the closest demo question.
  const listen = (rec: Recognition) => {
    jim.current?.stop();
    jim.current?.setExpression("neutral");
    recRef.current = rec;
    listeningRef.current = true;
    setListening(true);
    setVoiceStatus("listening");
    let heard = "";
    rec.lang = "en-GB";
    rec.interimResults = true;
    rec.onresult = (e) => {
      heard = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      setInput(heard);
    };
    rec.onerror = () => {};
    rec.onend = () => {
      if (recRef.current === rec) recRef.current = null;
      listeningRef.current = false;
      setListening(false);
      if (heard.trim()) ask(heard, closestQuestion(heard));
      else setVoiceStatus("idle");
    };
    try {
      rec.start();
    } catch {
      // e.g. mic permission denied or already started: drop back to idle instead of hanging on "Listening…"
      rec.onend = () => {};
      recRef.current = null;
      listeningRef.current = false;
      setListening(false);
      setVoiceStatus("idle");
    }
  };

  // Mic: real speech in voice mode where the browser supports it, otherwise a typed-out demo question.
  const speak = () => {
    if (busyRef.current || listeningRef.current) return;
    let rec: Recognition | null = null;
    try {
      rec = voiceOn ? createRecognition() : null;
    } catch {}
    if (rec) return listen(rec);
    const next = suggestedQuestions.find((s) => !asked.includes(s.id)) ?? suggestedQuestions[0];
    if (voiceOn) setVoiceStatus("listening");
    listeningRef.current = true;
    setListening(true);
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setInput(next.question.slice(0, i));
      if (i >= next.question.length) {
        clearInterval(id);
        timers.current.delete(id);
        later(() => {
          listeningRef.current = false;
          setListening(false);
          ask(next.question, next);
        }, 400);
      }
    }, 40);
    timers.current.add(id);
  };

  const remaining = suggestedQuestions.filter((s) => !asked.includes(s.id));

  // Takeaways from this conversation (finished answers only, one per question) for the notes panel.
  const current: TakeawayItem[] = [];
  messages.forEach((m, i) => {
    if (m.role !== "coach" || !m.takeaway) return;
    if (busy && i === messages.length - 1) return; // still streaming
    if (!current.some((c) => c.id === m.takeaway!.id)) current.push(m.takeaway);
  });
  const savedIds = new Set(saved.map((s) => s.id));
  const noteCount = new Set([...current.map((c) => c.id), ...savedIds]).size;

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Coach Jim · <span className="whitespace-nowrap">online 24/7</span></p>
          <h1 className="font-display mt-1 text-4xl font-bold uppercase leading-none sm:text-5xl">Ask your coach</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setNotesOpen(true)}
            aria-haspopup="dialog"
            aria-label={`Session notes${noteCount ? ` (${noteCount})` : ""}`}
            className="relative inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent sm:px-3.5"
          >
            <NotebookPen className="h-4 w-4" />
            Notes
            {noteCount > 0 && (
              <span className="num -mr-0.5 rounded-full bg-accent px-1.5 text-[11px] font-bold leading-[18px] text-accent-ink">{noteCount}</span>
            )}
          </button>
          {/* Icon-only on phones (the composer has a voice button too) so the header fits at 390px. */}
          <button
            onClick={openVoice}
            aria-label="Voice mode"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-2.5 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent sm:px-3.5"
          >
            <AudioLines className="h-4 w-4" />
            <span className="hidden sm:inline">Voice mode</span>
          </button>
        </div>
      </div>

      {notesOpen && (
        <NotesPanel
          current={current}
          saved={saved}
          onToggleSave={toggleSave}
          onRemove={(id) => setSaved((list) => list.filter((s) => s.id !== id))}
          notes={notes}
          onNotesChange={setNotes}
          onClose={() => setNotesOpen(false)}
        />
      )}

      {voiceOn && (
        <VoiceOverlay
          jimRef={jim}
          status={voiceStatus}
          caption={listening ? { who: "you", text: input } : caption}
          chips={voiceStatus === "idle" ? remaining.slice(0, 6) : []}
          onAsk={(s) => ask(s.question, s)}
          onMic={() => (voiceStatus === "speaking" ? jim.current?.stop() : speak())}
          micDisabled={voiceStatus === "thinking" || (busy && voiceStatus !== "speaking")}
          onClose={closeVoice}
        />
      )}

      <div className="flex-1 space-y-5 pb-4">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] break-words rounded-2xl rounded-tr-md bg-accent px-4 py-2.5 text-[15px] font-medium text-accent-ink">{m.text}</p>
            </div>
          ) : (
            <CoachMessage
              key={i}
              msg={m}
              onDone={i === messages.length - 1 ? () => setBusy(false) : undefined}
              saved={!!m.takeaway && savedIds.has(m.takeaway.id)}
              onToggleSave={toggleSave}
            />
          ),
        )}
        {thinking && <Thinking steps={thinking} />}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-line bg-bg/95 px-4 pb-[calc(64px+env(safe-area-inset-bottom))] pt-3 lg:pb-5 backdrop-blur -mb-28 sm:mx-0 sm:rounded-t-2xl sm:border sm:border-b-0 lg:bottom-0 lg:-mb-12">
        {remaining.length > 0 && (
          <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
            {remaining.map((s) => (
              <button
                key={s.id}
                disabled={busy}
                onClick={() => ask(s.question, s)}
                className="shrink-0 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-text/90 transition hover:border-accent hover:text-accent disabled:opacity-40"
              >
                {s.question}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={speak}
            aria-label="Speak to coach"
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
              listening ? "bg-danger text-white" : "bg-surface-2 text-text hover:text-accent"
            }`}
          >
            {listening && <span className="absolute inset-0 animate-ping rounded-xl bg-danger/40" />}
            <Mic className="relative h-5 w-5" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "Listening…" : "Ask about training, food, progress…"}
            className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 text-[15px] outline-none placeholder:text-muted focus:border-accent"
          />
          {/* Empty box: the main button opens voice mode (like ChatGPT); once you type it becomes Send. */}
          {!input.trim() && !listening ? (
            <button
              type="button"
              onClick={openVoice}
              aria-label="Voice mode"
              title="Talk to Coach Jim"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink transition hover:brightness-110"
            >
              <AudioLines className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink transition disabled:opacity-40"
            >
              <SendHorizontal className="h-5 w-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
