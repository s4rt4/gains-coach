// Starting targets from onboarding answers. Deterministic on purpose: the coach
// adjusts them later from real weekly data, but day one needs a sensible start.

export type Phase = "cut" | "bulk" | "recomp" | "maintain";
export type Sex = "male" | "female";

export type Answers = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  phase: Phase;
  goalWeightKg: number;
  goalDate: string;
  days: number;
};

const activity: Record<number, number> = { 3: 1.45, 4: 1.5, 5: 1.55, 6: 1.65 };
const kcalShift: Record<Phase, number> = { cut: -600, recomp: -250, maintain: 0, bulk: 250 };
const proteinPerKg: Record<Phase, number> = { cut: 2.3, recomp: 2.2, maintain: 2.0, bulk: 2.0 };
const fatPerKg: Record<Phase, number> = { cut: 0.7, recomp: 0.8, maintain: 0.8, bulk: 0.9 };

const to = (n: number, step: number) => Math.round(n / step) * step;

export function startingTargets(a: Answers, today = new Date()) {
  // Mifflin-St Jeor resting energy, then an activity factor from training days
  const bmr = 10 * a.weightKg + 6.25 * a.heightCm - 5 * a.age + (a.sex === "male" ? 5 : -161);
  const maintenance = to(bmr * (activity[a.days] ?? 1.5), 50);
  const kcal = to(maintenance + kcalShift[a.phase], 50);
  const proteinG = to(proteinPerKg[a.phase] * a.weightKg, 5);
  const fatG = to(fatPerKg[a.phase] * a.weightKg, 5);
  const carbsG = Math.max(0, to((kcal - proteinG * 4 - fatG * 9) / 4, 5));

  const msLeft = Date.parse(a.goalDate) - today.getTime();
  // no or unparsable goal date: fall back to 12 weeks instead of NaN
  const weeks = Number.isFinite(msLeft) ? Math.max(1, Math.round(msLeft / (7 * 864e5))) : 12;
  const ratePerWeek = Math.round(((a.goalWeightKg - a.weightKg) / weeks) * 100) / 100;
  return { maintenance, kcal, proteinG, carbsG, fatG, weeks, ratePerWeek };
}
