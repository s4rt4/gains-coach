// Deterministic analytics. Numbers are computed in code and handed to Claude as
// context, so the model interprets trends instead of doing arithmetic.
import { profile, weeks } from "@/data/persona";

const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

export function getStats() {
  const first = weeks[0];
  const last = weeks[weeks.length - 1];
  const prev = weeks[weeks.length - 2];
  const threeAgo = weeks[weeks.length - 4];

  const totalLossKg = round(first.avgWeightKg - last.avgWeightKg);
  const recentRateKg = round((threeAgo.avgWeightKg - last.avgWeightKg) / 3, 2);
  const earlyRateKg = round((first.avgWeightKg - weeks[7].avgWeightKg) / 7, 2);

  const toGoKg = round(last.avgWeightKg - profile.goalWeightKg);
  const weeksLeft = Math.round(
    (Date.parse(profile.goalDate) - Date.parse(last.start)) / (7 * 864e5) - 1,
  );
  const neededRateKg = round(toGoKg / weeksLeft, 2);

  const peakBench = Math.max(...weeks.map((w) => w.e1rm.bench));
  const benchChangePct = round(((last.e1rm.bench - peakBench) / peakBench) * 100);
  const squatChangePct = round(((last.e1rm.squat - first.e1rm.squat) / first.e1rm.squat) * 100);

  return {
    current: last,
    previous: prev,
    totalLossKg,
    weekChangeKg: round(last.avgWeightKg - prev.avgWeightKg),
    recentRateKg,
    earlyRateKg,
    toGoKg,
    weeksLeft,
    neededRateKg,
    waistLossCm: round(first.waistCm - last.waistCm),
    peakBench,
    benchChangePct,
    squatChangePct,
    kcalVsTarget: last.kcal - profile.targets.kcal,
    workoutsTotal: weeks.reduce((s, w) => s + w.sessions, 0),
  };
}

export type Stats = ReturnType<typeof getStats>;
