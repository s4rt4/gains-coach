import {
  BookOpen,
  Brain,
  Calculator,
  ChevronRight,
  ClipboardCheck,
  Droplet,
  Dumbbell,
  FileText,
  HeartPulse,
  Layers,
  MessageCircle,
  ShieldCheck,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardTitle, PageHeader, Pill } from "@/components/ui";
import { COACH_MODE } from "@/lib/config";

type Node = { icon: LucideIcon; title: string; detail: string };

const stages: { label: string; nodes: Node[]; highlight?: boolean }[] = [
  {
    label: "1 · Data sources",
    nodes: [
      { icon: Dumbbell, title: "Hevy", detail: "Workouts, sets, PRs" },
      { icon: Utensils, title: "Nutrition", detail: "Calories & macros" },
      { icon: ClipboardCheck, title: "Check-ins", detail: "Scores, notes, photos" },
      { icon: Droplet, title: "Lab reports", detail: "Blood markers" },
    ],
  },
  {
    label: "2 · Analytics",
    nodes: [
      { icon: Calculator, title: "Computed in code", detail: "Trends, rates, e1RM, adherence" },
      { icon: Layers, title: "Long-term memory", detail: "Past reports & conversations" },
      { icon: BookOpen, title: "Coaching knowledge base", detail: "Your methods & protocols" },
    ],
  },
  {
    label: "3 · Coaching engine",
    highlight: true,
    nodes: [{ icon: Brain, title: "Claude", detail: "Reasons over the full context and writes like a coach" }],
  },
  {
    label: "4 · What the user gets",
    nodes: [
      { icon: MessageCircle, title: "Chat & voice", detail: "24/7 answers" },
      { icon: FileText, title: "Weekly report", detail: "Adjustments & goals" },
      { icon: HeartPulse, title: "Blood work review", detail: "Prioritised summary" },
      { icon: Utensils, title: "Meal prep", detail: "Plans that hit targets" },
    ],
  },
];

const integrations: { name: string; how: string; status: string; tone: "ok" | "watch" | "neutral" }[] = [
  { name: "Claude API", how: "Server-side, streaming responses", status: COACH_MODE === "demo" ? "Demo mode" : "Live", tone: "watch" },
  { name: "Hevy", how: "Official Hevy API (user's API key)", status: "Ready", tone: "ok" },
  { name: "Nutrition apps", how: "CSV export import; direct sync via partner APIs where available", status: "Ready (CSV)", tone: "ok" },
  { name: "Apple Health / Health Connect", how: "Health data aggregator or companion mobile app", status: "Phase 2", tone: "neutral" },
  { name: "Lab reports", how: "PDF / photo upload, markers extracted by Claude", status: "Ready", tone: "ok" },
];

const guardrails = [
  "Blood work: explains and prioritises markers and prepares questions for a doctor. Never prescribes or gives dosages.",
  "Calorie advice has minimum floors and maximum rates of loss, and flags signs of disordered eating.",
  "18+ only. Photos and lab data are encrypted and private to the user.",
  "Every answer is grounded in the user's data and shows which sources it used.",
];

const systemPrompt = `You are Gains Coach, an experienced bodybuilding and
physique coach. You coach {user.name} ({user.phase} phase).

Use ONLY the data in <context> for numbers. Never invent stats.
Lead with a clear recommendation, then the evidence.
Prefer adherence fixes before changing targets.

<knowledge_base> ...coaching methods... </knowledge_base>
<context>
  profile, targets, computed_trends, last_12_weeks,
  recent_workouts, check_ins, lab_results, memory
</context>`;

export default function EnginePage() {
  return (
    <>
      <PageHeader eyebrow="Under the hood" title="How the coach works" />

      <Card className="mb-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr_auto_0.9fr_auto_1fr] lg:items-stretch">
          {stages.map((stage, i) => (
            <div key={stage.label} className="contents">
              <div className="flex flex-col">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted">{stage.label}</p>
                <div className={`flex flex-1 flex-col gap-2 ${stage.highlight ? "justify-center" : ""}`}>
                  {stage.nodes.map(({ icon: Icon, title, detail }) => (
                    <div
                      key={title}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${
                        stage.highlight ? "border-accent bg-accent text-accent-ink lg:flex-col lg:py-8 lg:text-center" : "border-line bg-surface-2/60"
                      }`}
                    >
                      <Icon className={`shrink-0 ${stage.highlight ? "h-7 w-7" : "h-5 w-5 text-accent"}`} />
                      <div className="min-w-0">
                        <p className={`font-semibold ${stage.highlight ? "font-display text-2xl uppercase" : "text-sm"}`}>{title}</p>
                        <p className={`text-xs ${stage.highlight ? "text-accent-ink/75" : "text-muted"}`}>{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {i < stages.length - 1 && (
                <div className="flex items-center justify-center text-muted">
                  <ChevronRight className="h-5 w-5 rotate-90 lg:rotate-0" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardTitle>Integrations</CardTitle>
          <ul>
            {integrations.map((it) => (
              <li key={it.name} className="flex items-start justify-between gap-3 border-b border-line py-3 first:pt-0 last:border-0">
                <div>
                  <p className="text-sm font-semibold">{it.name}</p>
                  <p className="text-xs text-muted">{it.how}</p>
                </div>
                <Pill tone={it.tone}>{it.status}</Pill>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>Guardrails</CardTitle>
          <ul className="space-y-3">
            {guardrails.map((g) => (
              <li key={g} className="flex gap-3 text-sm text-text/85">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                {g}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle action={<Pill tone="accent">Excerpt</Pill>}>Coach system prompt</CardTitle>
          <pre className="overflow-x-auto rounded-xl bg-bg p-4 font-mono text-[13px] leading-relaxed text-text/80">{systemPrompt}</pre>
          <p className="mt-3 text-xs text-muted">
            Responses in this prototype were generated by Claude from Tom&apos;s data using this structure and are replayed
            without an API key. Switching to live mode means one server route, and the UI stays the same.
          </p>
        </Card>
      </div>
    </>
  );
}
