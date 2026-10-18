"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { COACH_JIM_FACE, COACH_JIM_SVG } from "./art";
import { visemesFor } from "./lipsync";

export type Expression = "neutral" | "happy" | "hype" | "serious" | "thinking";

export type CoachJimHandle = {
  /** Say `text` with the browser voice and lip-sync. Resolves when he stops talking. */
  speak: (text: string) => Promise<void>;
  stop: () => void;
  setExpression: (e: Expression) => void;
};

const MOUTHS = ["X", "A", "B", "C", "D", "E", "F", "G", "H", "smile", "grin", "frown"] as const;
type Mouth = (typeof MOUTHS)[number];
type Lids = "open" | "half" | "closed";
type Step = [Mouth, number];

// Brow offsets are tuned to the artwork's scale (head ≈ 390 px tall in a 1000 px canvas).
const EXPRESSIONS: Record<Expression, { L: string; R: string; mouth: Mouth; lids: Lids }> = {
  neutral: { L: "none", R: "none", mouth: "X", lids: "open" },
  happy: { L: "translateY(-4px)", R: "translateY(-4px)", mouth: "smile", lids: "open" },
  hype: { L: "translateY(-9px) rotate(-5deg)", R: "translateY(-9px) rotate(5deg)", mouth: "grin", lids: "open" },
  serious: { L: "translateY(5px) rotate(8deg)", R: "translateY(5px) rotate(-8deg)", mouth: "frown", lids: "half" },
  thinking: { L: "translateY(-8px) rotate(-3deg)", R: "translateY(3px) rotate(-4deg)", mouth: "A", lids: "open" },
};

/** Head + shoulders, for voice mode. */
export const BUST_VIEWBOX = "200 30 600 600";

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => /en-GB/i.test(v.lang) && /male|daniel|george|ryan|thomas|arthur/i.test(v.name)) ??
    voices.find((v) => /en-GB/i.test(v.lang)) ??
    voices.find((v) => /^en/i.test(v.lang))
  );
}

export const CoachJim = forwardRef<CoachJimHandle, { viewBox?: string; className?: string }>(function CoachJim(
  { viewBox = BUST_VIEWBOX, className = "" },
  ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ expression: "neutral" as Expression, talking: false, lids: "open" as Lids });
  const talkTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const finish = useRef<(() => void) | null>(null);

  const part = (id: string) => host.current?.querySelector<SVGGElement>(`[id="${id}"]`) ?? null;

  const showMouth = (m: Mouth) => {
    for (const k of MOUTHS) {
      const g = part(`mouth-${k}`);
      if (g) g.style.display = k === m ? "" : "none";
    }
  };

  // The lid layers are complete eyes (with their own pupils), so the normal eyes hide while one shows.
  const setLids = (lids: Lids) => {
    state.current.lids = lids;
    const half = part("lids-half"), closed = part("lids-closed");
    if (half) half.style.display = lids === "half" ? "" : "none";
    if (closed) closed.style.display = lids === "closed" ? "" : "none";
    for (const id of ["eye-whites", "pupils"]) {
      const g = part(id);
      if (g) g.style.display = lids === "open" ? "" : "none";
    }
  };

  const rest = () => showMouth(EXPRESSIONS[state.current.expression].mouth);

  const setExpression = (e: Expression) => {
    state.current.expression = e;
    const x = EXPRESSIONS[e];
    const l = part("brow-L"), r = part("brow-R");
    if (l) l.style.transform = x.L;
    if (r) r.style.transform = x.R;
    setLids(x.lids);
    if (!state.current.talking) rest();
  };

  /** Plays [shape, ms] steps; the last shape stays on screen afterwards. */
  const play = (steps: Step[], done?: () => void) => {
    clearTimeout(talkTimer.current);
    let k = 0;
    const step = () => {
      if (k >= steps.length) return done?.();
      const [shape, ms] = steps[k++];
      showMouth(shape);
      talkTimer.current = setTimeout(step, ms);
    };
    step();
  };

  // The shapes for one word fill ~75% of its time, then the mouth rests (closed) until the next word.
  const MIN_SHAPE_MS = 95; // slower = calmer mouth; long words keep only a few evenly spaced shapes
  const wordSteps = (word: string, totalMs: number): Step[] => {
    const all = visemesFor(word);
    if (!all.length) return [];
    const room = Math.max(1, Math.floor((totalMs * 0.75) / MIN_SHAPE_MS));
    const shapes = all.length <= room ? all : Array.from({ length: room }, (_, i) => all[Math.floor((i * all.length) / room)]);
    const per = Math.max(MIN_SHAPE_MS, (totalMs * 0.75) / shapes.length);
    const pause = /[.!?]$/.test(word) ? 380 : /[,;:]$/.test(word) ? 220 : Math.max(90, totalMs * 0.25);
    return [...shapes.map((v): Step => [v, per]), ["X", pause]];
  };
  const wordMs = (word: string) => Math.min(800, Math.max(260, word.replace(/[^a-z]/gi, "").length * 80));

  const timedSequence = (text: string) => text.split(/\s+/).filter(Boolean).flatMap((w) => wordSteps(w, wordMs(w)));

  const stop = () => {
    clearTimeout(talkTimer.current);
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    state.current.talking = false;
    rest();
    finish.current?.();
    finish.current = null;
  };

  const speak = (text: string) =>
    new Promise<void>((resolve) => {
      stop();
      state.current.talking = true;
      finish.current = resolve;
      const end = () => {
        if (!state.current.talking) return;
        state.current.talking = false;
        clearTimeout(talkTimer.current);
        rest();
        finish.current = null;
        resolve();
      };

      if (!("speechSynthesis" in window)) {
        play(timedSequence(text), end);
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) u.voice = voice;
      u.pitch = 0.8;
      let gotBoundary = false;
      u.onboundary = (ev) => {
        if (ev.name && ev.name !== "word") return;
        gotBoundary = true;
        const word = text.slice(ev.charIndex).split(/\s+/)[0] ?? "";
        // if the voice moved on before the last word's rest, close the mouth briefly first
        const mid = part("mouth-X")?.style.display === "none";
        play([...(mid ? ([["X", 70]] as Step[]) : []), ...wordSteps(word, wordMs(word))]);
      };
      u.onend = end;
      u.onerror = end;
      window.speechSynthesis.speak(u);
      // Some voices never fire word events: animate on a timer instead.
      setTimeout(() => {
        if (state.current.talking && !gotBoundary) play(timedSequence(text));
      }, 700);
    });

  useImperativeHandle(ref, () => ({ speak, stop, setExpression }));

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    el.innerHTML = COACH_JIM_SVG;
    const svg = el.querySelector("svg")!;
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    const head = part("head");
    const base = part("head-base") ?? head;
    if (head && base) {
      const b = base.getBBox();
      head.style.transformBox = "view-box";
      head.style.transformOrigin = `${b.x + b.width / 2}px ${b.y + b.height}px`; // pivot at the chin
    }
    for (const id of ["brow-L", "brow-R", "pupils"]) {
      const g = part(id);
      if (g) Object.assign(g.style, { transformBox: "fill-box", transformOrigin: "center", transition: "transform .25s" });
    }
    const pupilBox = part("pupils")?.getBBox();
    const gaze = Math.max(1.5, (pupilBox?.height ?? 20) * 0.25);
    setExpression(state.current.expression);

    let blinkT: ReturnType<typeof setTimeout>, gazeT: ReturnType<typeof setTimeout>, headT: ReturnType<typeof setTimeout>;
    const blink = () => {
      blinkT = setTimeout(() => {
        const base = EXPRESSIONS[state.current.expression].lids;
        setLids("half");
        setTimeout(() => setLids("closed"), 50);
        setTimeout(() => setLids("half"), 130);
        setTimeout(() => { setLids(base); blink(); }, 180);
      }, 2200 + Math.random() * 3000);
    };
    const look = () => {
      gazeT = setTimeout(() => {
        const centre = Math.random() < 0.5;
        const x = centre ? 0 : (Math.random() * 2 - 1) * gaze, y = centre ? 0 : (Math.random() * 2 - 1) * gaze * 0.5;
        const p = part("pupils");
        if (p) p.style.transform = `translate(${x}px, ${y}px)`;
        look();
      }, 1200 + Math.random() * 2500);
    };
    // The head holds still, then eases to a new small pose now and then (more often while talking).
    if (head) head.style.transition = "transform 900ms cubic-bezier(.45,0,.25,1)";
    const moveHead = () => {
      const talking = state.current.talking;
      headT = setTimeout(() => {
        const settle = !talking && Math.random() < 0.4;
        const rot = settle ? 0 : (Math.random() * 2 - 1) * (talking ? 1.8 : 1.2);
        const y = settle ? 0 : talking ? Math.random() * 2.5 : 0;
        if (head) head.style.transform = `translateY(${y}px) rotate(${rot}deg)`;
        moveHead();
      }, talking ? 1100 + Math.random() * 1600 : 3500 + Math.random() * 4500);
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    blink();
    if (!reduced) { look(); moveHead(); }
    return () => {
      clearTimeout(blinkT);
      clearTimeout(gazeT);
      clearTimeout(headT);
      stop();
    };
    // mount once per viewBox; the handle functions only touch the DOM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewBox]);

  return <div ref={host} className={className} role="img" aria-label="Coach Jim" />;
});

/** Static idle face for small avatars (an <img>, so many can sit on one page). */
export function CoachJimFace({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={COACH_JIM_FACE} alt="Coach Jim" className={className} draggable={false} />;
}
