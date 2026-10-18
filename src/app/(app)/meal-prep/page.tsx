"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Brain, Check, ChevronDown, Clock, MessageCircle, ShoppingCart, Snowflake } from "lucide-react";
import { Card, CardTitle, PageHeader, Pill } from "@/components/ui";
import { kcal, mealPlans, type Aisle, type Ingredient, type MealPlan, type Recipe } from "@/data/meals";

const aisles: Aisle[] = ["Meat & dairy", "Fruit & veg", "Grains & tins", "Other"];

function fmtQty({ qty, unit }: Pick<Ingredient, "qty" | "unit">) {
  if (!unit) return `× ${Math.ceil(qty)}`;
  if (qty >= 1000) return `${Math.round(qty / 100) / 10} ${unit === "g" ? "kg" : "L"}`;
  return `${Math.round(qty / 10) * 10} ${unit}`;
}

/** Shopping list for `days` days: each batch scaled from its portion count, merged by item + unit. */
function shoppingList(plan: MealPlan, days: number) {
  const map = new Map<string, Ingredient>();
  for (const r of plan.recipes) {
    for (const i of r.batch) {
      const key = `${i.item}|${i.unit}`;
      const qty = (i.qty * days) / r.portions;
      const prev = map.get(key);
      map.set(key, prev ? { ...prev, qty: prev.qty + qty } : { ...i, qty });
    }
  }
  return aisles
    .map((a) => ({ aisle: a, items: [...map.values()].filter((i) => i.aisle === a).sort((x, y) => x.item.localeCompare(y.item)) }))
    .filter((g) => g.items.length);
}

function MacroBar({ label, value, target, unit }: { label: string; value: number; target: number; unit: string }) {
  const pct = Math.round((value / target) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="num">
          <span className="font-semibold">{value.toLocaleString("en-GB")}</span>
          <span className="text-muted">
            {" "}
            / {target.toLocaleString("en-GB")} {unit}
          </span>
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}

function RecipeCard({ r }: { r: Recipe }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-xl border border-line">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-start gap-3 p-4 text-left">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">{r.slot}</p>
          <p className="mt-0.5 font-semibold">{r.name}</p>
          <p className="num mt-1.5 text-sm text-muted">
            <span className="font-semibold text-text">{kcal(r)} kcal</span> · {r.p} g P · {r.c} g C · {r.f} g F
          </p>
        </div>
        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-line px-4 pb-4 pt-3 text-sm">
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {r.prepMin ? `${r.prepMin} min` : "No cooking"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Snowflake className="h-3.5 w-3.5" /> Keeps {r.keepsDays} days in the fridge
            </span>
            <span>Batch makes {r.portions}</span>
          </p>
          <ul className="mt-3 space-y-1">
            {r.batch.map((i) => (
              <li key={i.item} className="flex justify-between gap-3">
                <span>{i.item}</span>
                <span className="num text-muted">{fmtQty(i)}</span>
              </li>
            ))}
          </ul>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-text/80">
            {r.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      )}
    </li>
  );
}

export default function MealPrepPage() {
  const [planId, setPlanId] = useState<MealPlan["id"]>("cut");
  const [days, setDays] = useState(5);
  const [got, setGot] = useState<Set<string>>(new Set());
  const plan = mealPlans.find((p) => p.id === planId)!;

  const day = useMemo(() => {
    const t = plan.recipes.reduce((s, r) => ({ p: s.p + r.p, c: s.c + r.c, f: s.f + r.f }), { p: 0, c: 0, f: 0 });
    return { ...t, kcal: kcal(t) };
  }, [plan]);
  const list = useMemo(() => shoppingList(plan, days), [plan, days]);
  const totalItems = list.reduce((s, g) => s + g.items.length, 0);
  const cookMin = plan.timeline[plan.timeline.length - 1].at + 10;

  const toggle = (key: string) =>
    setGot((g) => {
      const n = new Set(g);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  return (
    <>
      <PageHeader eyebrow="Nutrition" title="Meal prep">
        <div className="flex rounded-xl border border-line bg-surface p-1 text-sm" role="tablist" aria-label="Plan">
          {mealPlans.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={planId === p.id}
              onClick={() => {
                setPlanId(p.id);
                setGot(new Set());
              }}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                planId === p.id ? "bg-accent text-accent-ink" : "text-muted hover:text-text"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardTitle
              action={
                <Pill>
                  <Clock className="h-3 w-3" /> ~{cookMin} min on Sunday
                </Pill>
              }
            >
              One prep day
            </CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <MacroBar label="Calories" value={day.kcal} target={plan.targets.kcal} unit="kcal" />
              <MacroBar label="Protein" value={day.p} target={plan.targets.p} unit="g" />
              <MacroBar label="Carbs" value={day.c} target={plan.targets.c} unit="g" />
              <MacroBar label="Fat" value={day.f} target={plan.targets.f} unit="g" />
            </div>
            <p className="mt-4 text-sm text-muted">{plan.note}</p>
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-xs text-muted">
              <Brain className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                Built around what your coach remembers: <strong className="text-text">no fish</strong>, a light breakfast you can
                eat at 06:00, and a planned Saturday meal.{" "}
                <Link href="/memory/" className="font-medium text-accent hover:underline">
                  See memory
                </Link>
              </span>
            </p>
          </Card>

          <Card>
            <CardTitle>Recipes · per portion</CardTitle>
            <ul className="space-y-3">
              {plan.recipes.map((r) => (
                <RecipeCard key={r.id} r={r} />
              ))}
            </ul>
            <Link
              href="/coach/"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-medium text-muted transition hover:border-accent hover:text-accent"
            >
              <MessageCircle className="h-4 w-4" /> Ask the coach to swap a meal
            </Link>
          </Card>

          <Card>
            <CardTitle>Sunday cook, in order</CardTitle>
            <ol className="relative space-y-4 border-l border-line pl-5">
              {plan.timeline.map((t) => (
                <li key={t.at} className="relative">
                  <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                  <p className="num text-xs font-semibold text-accent">{t.at === 0 ? "Start" : `+${t.at} min`}</p>
                  <p className="text-sm">{t.task}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-10">
          <CardTitle
            action={
              <span className="num text-xs text-muted">
                {got.size}/{totalItems}
              </span>
            }
          >
            <span className="inline-flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-accent" /> Shopping list
            </span>
          </CardTitle>
          <div className="mb-4 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted">Prep for</span>
            <div className="flex rounded-lg border border-line p-0.5 text-xs">
              {[5, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  aria-pressed={days === d}
                  className={`rounded-md px-2.5 py-1 transition ${days === d ? "bg-accent font-semibold text-accent-ink" : "text-muted hover:text-text"}`}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {list.map((g) => (
              <div key={g.aisle}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted">{g.aisle}</p>
                <ul>
                  {g.items.map((i) => {
                    const key = `${i.item}|${i.unit}`;
                    const done = got.has(key);
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => toggle(key)}
                          aria-pressed={done}
                          className="flex w-full items-center gap-3 py-1.5 text-left text-sm"
                        >
                          <span
                            className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border ${
                              done ? "border-accent bg-accent text-accent-ink" : "border-line"
                            }`}
                          >
                            {done && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                          <span className={`flex-1 ${done ? "text-muted line-through" : ""}`}>{i.item}</span>
                          <span className="num text-muted">{fmtQty(i)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
