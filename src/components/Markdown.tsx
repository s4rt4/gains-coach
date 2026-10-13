import { Fragment, type ReactNode } from "react";

// Minimal markdown renderer for coach output: headings, paragraphs, bold,
// bullet / numbered / checkbox lists. Tolerates partial (streaming) input.

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-text">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

type Block =
  | { kind: "h2" | "h3" | "p"; text: string }
  | { kind: "ul" | "ol" | "check"; items: string[] };

function parse(src: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of src.split("\n")) {
    const line = raw.trimEnd();
    const last = blocks[blocks.length - 1];
    if (!line.trim()) {
      blocks.push({ kind: "p", text: "" });
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^## (.*)/))) blocks.push({ kind: "h2", text: m[1] });
    else if ((m = line.match(/^### (.*)/))) blocks.push({ kind: "h3", text: m[1] });
    else if ((m = line.match(/^- \[ \] (.*)/))) {
      if (last?.kind === "check") last.items.push(m[1]);
      else blocks.push({ kind: "check", items: [m[1]] });
    } else if ((m = line.match(/^- (.*)/))) {
      if (last?.kind === "ul") last.items.push(m[1]);
      else blocks.push({ kind: "ul", items: [m[1]] });
    } else if ((m = line.match(/^\d+\. (.*)/))) {
      if (last?.kind === "ol") last.items.push(m[1]);
      else blocks.push({ kind: "ol", items: [m[1]] });
    } else if (last?.kind === "p" && last.text) last.text += " " + line;
    else blocks.push({ kind: "p", text: line });
  }
  return blocks.filter((b) => !(b.kind === "p" && !b.text));
}

export function Markdown({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`space-y-3 text-[15px] leading-relaxed text-text/85 ${className}`}>
      {parse(text).map((b, i) => {
        switch (b.kind) {
          case "h2":
            return (
              <h2 key={i} className="font-display text-2xl font-bold uppercase text-text">
                {inline(b.text)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-2 text-xs font-semibold uppercase tracking-widest text-accent">
                {inline(b.text)}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-1.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2.5">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" />
                    <span>{inline(it)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-1.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2.5">
                    <span className="num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-2 text-xs font-semibold text-accent">
                      {j + 1}
                    </span>
                    <span>{inline(it)}</span>
                  </li>
                ))}
              </ol>
            );
          case "check":
            return (
              <ul key={i} className="space-y-2">
                {b.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-2.5 rounded-lg border border-line bg-surface-2/60 px-3 py-2">
                    <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]" aria-label="Mark goal done" />
                    <span>{inline(it)}</span>
                  </li>
                ))}
              </ul>
            );
          default:
            return <p key={i}>{inline(b.text)}</p>;
        }
      })}
    </div>
  );
}
