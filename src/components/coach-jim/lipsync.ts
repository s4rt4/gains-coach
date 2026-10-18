// Text -> mouth shapes. Shape letters follow Rhubarb Lip Sync (X, A–H).
// In production the timing comes from Rhubarb run on the real TTS audio; in the
// prototype we approximate it from the text and the browser voice's word events.

export type Viseme = "X" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export function visemesFor(word: string): Viseme[] {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  const out: Viseme[] = [];
  let i = 0;
  while (i < w.length) {
    const two = w.slice(i, i + 2);
    const c = w[i];
    if (two === "oo" || two === "ow" || two === "ou") { out.push("F"); i += 2; continue; }
    if (two === "th") { out.push("H"); i += 2; continue; }
    if (two === "ee" || two === "ea") { out.push("B"); i += 2; continue; }
    if ("mbp".includes(c)) out.push("A");
    else if ("fv".includes(c)) out.push("G");
    else if (c === "l") out.push("H");
    else if (c === "a") out.push("D");
    else if (c === "e" || c === "i") out.push("C");
    else if (c === "o") out.push("E");
    else if (c === "u" || c === "w") out.push("F");
    else out.push("B");
    i++;
  }
  return out.filter((v, k) => k === 0 || v !== out[k - 1]);
}

/** The bit of a coach answer worth saying out loud: the opening paragraph, without markdown. */
export function spokenSummary(markdown: string): string {
  const plain = (s: string) =>
    s.replace(/\*\*|__|`|#+\s/g, "").replace(/\[(.*?)\]\(.*?\)/g, "$1").replace(/\s+/g, " ").trim();
  const paras = markdown.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p && !/^([-*]|\d+\.)\s/.test(p));
  let text = plain(paras[0] ?? "");
  if (text.split(" ").length < 20 && paras[1] && !paras[1].endsWith(":")) text += " " + plain(paras[1]);
  return `${text} I've put the full breakdown in the chat.`;
}
