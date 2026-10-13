import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-surface p-5 ${className}`}>{children}</section>;
}

export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">{children}</h2>
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">{eyebrow}</p>
        <h1 className="font-display mt-1 text-4xl font-bold uppercase leading-none sm:text-5xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

const tones = {
  ok: "bg-ok/12 text-ok border-ok/25",
  watch: "bg-warn/12 text-warn border-warn/25",
  flag: "bg-danger/12 text-danger border-danger/25",
  expected: "bg-info/12 text-info border-info/25",
  neutral: "bg-surface-2 text-muted border-line",
  accent: "bg-accent/12 text-accent border-accent/25",
};

export function Pill({ tone = "neutral", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  unit,
  delta,
  deltaTone = "neutral",
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaTone?: "good" | "bad" | "neutral";
}) {
  const dt = { good: "text-ok", bad: "text-warn", neutral: "text-muted" }[deltaTone];
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="num mt-2 font-display text-3xl font-bold leading-none">
        {value}
        {unit && <span className="ml-1 text-base font-semibold text-muted">{unit}</span>}
      </p>
      {delta && <p className={`num mt-2 text-xs font-medium ${dt}`}>{delta}</p>}
    </div>
  );
}
