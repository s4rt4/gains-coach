// Demo persona. In production this comes from the user's profile + synced sources
// (Hevy API, nutrition import, weekly check-ins, uploaded lab reports).

export const profile = {
  name: "Tom Walker",
  firstName: "Tom",
  age: 28,
  heightCm: 183,
  phase: "Cut",
  goalWeightKg: 85,
  goalDate: "2026-12-20",
  startDate: "2026-07-20",
  targets: { kcal: 2400, proteinG: 210, carbsG: 230, fatG: 65, steps: 10000 },
  training: "5-day Push / Pull / Legs / Upper / Lower",
  enhanced: true, // declared during onboarding, used only for blood work context
};

export const connections = [
  { id: "hevy", name: "Hevy", detail: "60 workouts synced", status: "connected" as const, lastSync: "Today, 07:42" },
  { id: "nutrition", name: "Nutrition log", detail: "84 days imported (CSV)", status: "connected" as const, lastSync: "Today, 07:42" },
  { id: "health", name: "Apple Health / Health Connect", detail: "Steps, sleep, bodyweight", status: "available" as const, lastSync: null },
];

export type WeekData = {
  week: number;
  start: string; // Monday
  avgWeightKg: number;
  waistCm: number;
  kcal: number;
  proteinG: number;
  steps: number;
  sleepH: number;
  sessions: number;
  hardSets: number;
  e1rm: { bench: number; squat: number; deadlift: number; ohp: number };
  checkin: { energy: number; hunger: number; recovery: number; stress: number };
};

const mondays = [
  "2026-07-20", "2026-07-27", "2026-08-03", "2026-08-10", "2026-08-17", "2026-08-24",
  "2026-08-31", "2026-09-07", "2026-09-14", "2026-09-21", "2026-09-28", "2026-10-05",
];

const avgWeight = [92.1, 91.5, 91.0, 90.6, 90.0, 89.6, 89.1, 88.8, 88.5, 88.3, 88.2, 88.1];
const waist = [92.0, 91.4, 90.8, 90.3, 89.6, 89.1, 88.6, 88.2, 87.9, 87.5, 87.0, 86.5];
const kcal = [2390, 2410, 2370, 2405, 2420, 2395, 2440, 2480, 2530, 2560, 2590, 2610];
const protein = [205, 212, 208, 210, 206, 211, 204, 198, 195, 192, 190, 188];
const steps = [10400, 10150, 10300, 9900, 9800, 9600, 9100, 8700, 8300, 8000, 7900, 7700];
const sleep = [7.4, 7.3, 7.5, 7.2, 7.1, 7.0, 6.9, 6.8, 6.6, 6.5, 6.4, 6.4];
const sessions = [5, 5, 6, 5, 5, 6, 5, 5, 4, 5, 4, 5];
const hardSets = [98, 102, 108, 100, 104, 110, 102, 100, 84, 98, 82, 96];
const bench = [120, 120, 119.6, 123, 123, 122.5, 123, 119.6, 120, 116.7, 116.7, 117];
const squat = [163, 163, 165, 166, 168, 168, 169, 169, 168, 169, 170, 170];
const deadlift = [210, 210, 212, 214, 214, 215, 215, 213, 212, 210, 210, 210];
const ohp = [76, 76, 77, 78, 78, 78, 77, 77, 76, 75, 75, 75];
const energy = [8, 8, 8, 7, 7, 7, 7, 6, 6, 6, 5, 5];
const hunger = [4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8];
const recovery = [8, 8, 7, 7, 8, 7, 7, 7, 6, 6, 6, 6];
const stress = [4, 4, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7];

export const weeks: WeekData[] = mondays.map((start, i) => ({
  week: i + 1,
  start,
  avgWeightKg: avgWeight[i],
  waistCm: waist[i],
  kcal: kcal[i],
  proteinG: protein[i],
  steps: steps[i],
  sleepH: sleep[i],
  sessions: sessions[i],
  hardSets: hardSets[i],
  e1rm: { bench: bench[i], squat: squat[i], deadlift: deadlift[i], ohp: ohp[i] },
  checkin: { energy: energy[i], hunger: hunger[i], recovery: recovery[i], stress: stress[i] },
}));

// Daily scale weights: weekly average + a fixed Mon–Sun water pattern (sums to 0,
// so each week still averages exactly to the weekly figure above).
const dayPattern = [0.5, 0.2, -0.1, -0.3, -0.4, -0.2, 0.3];

export const dailyWeights = weeks.flatMap((w) =>
  dayPattern.map((d, i) => {
    const date = new Date(w.start + "T00:00:00Z");
    date.setUTCDate(date.getUTCDate() + i);
    return { date: date.toISOString().slice(0, 10), kg: Math.round((w.avgWeightKg + d) * 10) / 10 };
  }),
);

// Last 4 weeks: weekday vs weekend calories (from the nutrition import)
export const weekendSplit = { weekdayKcal: 2310, weekendKcal: 3360 };

export type Workout = {
  date: string;
  title: string;
  durationMin: number;
  volumeKg: number;
  exercises: { name: string; sets: string }[];
};

// Most recent Hevy workouts (shape mirrors the Hevy API workout object, simplified)
export const recentWorkouts: Workout[] = [
  {
    date: "2026-10-11",
    title: "Lower B",
    durationMin: 68,
    volumeKg: 11840,
    exercises: [
      { name: "Romanian Deadlift", sets: "3 × 8 @ 140 kg" },
      { name: "Hack Squat", sets: "3 × 10 @ 120 kg" },
      { name: "Lying Leg Curl", sets: "3 × 12 @ 50 kg" },
      { name: "Standing Calf Raise", sets: "4 × 12 @ 90 kg" },
    ],
  },
  {
    date: "2026-10-10",
    title: "Upper B",
    durationMin: 64,
    volumeKg: 9120,
    exercises: [
      { name: "Incline Bench Press", sets: "3 × 8 @ 80 kg" },
      { name: "Chest-Supported Row", sets: "3 × 10 @ 70 kg" },
      { name: "Seated DB Press", sets: "3 × 10 @ 30 kg" },
      { name: "Lat Pulldown", sets: "3 × 12 @ 75 kg" },
    ],
  },
  {
    date: "2026-10-08",
    title: "Legs A",
    durationMin: 74,
    volumeKg: 13460,
    exercises: [
      { name: "Back Squat", sets: "145 × 5, 3 × 8 @ 125 kg" },
      { name: "Leg Press", sets: "3 × 12 @ 220 kg" },
      { name: "Leg Extension", sets: "3 × 15 @ 65 kg" },
      { name: "Seated Leg Curl", sets: "3 × 12 @ 55 kg" },
    ],
  },
  {
    date: "2026-10-07",
    title: "Pull A",
    durationMin: 66,
    volumeKg: 10230,
    exercises: [
      { name: "Deadlift", sets: "180 × 5" },
      { name: "Weighted Pull-up", sets: "3 × 6 @ +15 kg" },
      { name: "Barbell Row", sets: "3 × 8 @ 90 kg" },
      { name: "EZ-Bar Curl", sets: "3 × 10 @ 35 kg" },
    ],
  },
  {
    date: "2026-10-06",
    title: "Push A",
    durationMin: 62,
    volumeKg: 8640,
    exercises: [
      { name: "Bench Press", sets: "97.5 × 6, 2 × 8 @ 87.5 kg" },
      { name: "Incline DB Press", sets: "3 × 10 @ 36 kg" },
      { name: "Cable Lateral Raise", sets: "4 × 15 @ 10 kg" },
      { name: "Triceps Pushdown", sets: "3 × 12 @ 35 kg" },
    ],
  },
];

// ---------- Blood work ----------

export type MarkerStatus = "ok" | "watch" | "flag" | "expected";

export type Marker = {
  name: string;
  value: number;
  unit: string;
  low?: number;
  high?: number;
  previous?: number;
  status: MarkerStatus;
  note: string;
};

export type MarkerGroup = { group: string; markers: Marker[] };

export const bloodTest = {
  date: "2026-10-09",
  lab: "Private lab panel (venous, fasted)",
  previousDate: "2026-05-14",
};

export const bloodWork: MarkerGroup[] = [
  {
    group: "Full blood count",
    markers: [
      { name: "Haematocrit", value: 0.53, unit: "L/L", low: 0.4, high: 0.5, previous: 0.49, status: "flag", note: "Above range and rising since May" },
      { name: "Haemoglobin", value: 178, unit: "g/L", low: 130, high: 170, previous: 166, status: "flag", note: "Above range, tracks with haematocrit" },
      { name: "Ferritin", value: 85, unit: "µg/L", low: 30, high: 400, previous: 92, status: "ok", note: "Normal" },
    ],
  },
  {
    group: "Lipids",
    markers: [
      { name: "HDL cholesterol", value: 0.82, unit: "mmol/L", low: 1.0, previous: 0.95, status: "flag", note: "Below recommended level" },
      { name: "LDL cholesterol", value: 3.9, unit: "mmol/L", high: 3.0, previous: 3.4, status: "watch", note: "Above target" },
      { name: "Triglycerides", value: 1.4, unit: "mmol/L", high: 1.7, previous: 1.3, status: "ok", note: "Normal" },
    ],
  },
  {
    group: "Liver & muscle",
    markers: [
      { name: "ALT", value: 58, unit: "U/L", high: 50, previous: 44, status: "watch", note: "Mildly raised" },
      { name: "AST", value: 52, unit: "U/L", high: 40, previous: 38, status: "watch", note: "Mildly raised" },
      { name: "Creatine kinase (CK)", value: 1450, unit: "U/L", high: 190, status: "watch", note: "High — consistent with hard training" },
    ],
  },
  {
    group: "Kidney",
    markers: [
      { name: "Creatinine", value: 128, unit: "µmol/L", low: 59, high: 104, previous: 121, status: "watch", note: "Raised — muscle mass & creatine can inflate this" },
      { name: "eGFR", value: 68, unit: "mL/min/1.73m²", low: 90, previous: 72, status: "watch", note: "Calculated from creatinine" },
    ],
  },
  {
    group: "Hormones",
    markers: [
      { name: "Total testosterone", value: 38.5, unit: "nmol/L", low: 8.6, high: 29, previous: 36.2, status: "expected", note: "Above range — expected with declared use" },
      { name: "Oestradiol (E2)", value: 245, unit: "pmol/L", low: 41, high: 159, previous: 198, status: "watch", note: "Above range and rising" },
      { name: "LH", value: 0.3, unit: "IU/L", low: 1.7, high: 8.6, status: "expected", note: "Suppressed — expected with exogenous testosterone" },
      { name: "Prolactin", value: 210, unit: "mIU/L", low: 86, high: 324, status: "ok", note: "Normal" },
      { name: "PSA", value: 0.9, unit: "µg/L", high: 2.5, previous: 0.8, status: "ok", note: "Normal" },
    ],
  },
  {
    group: "Metabolic",
    markers: [
      { name: "Fasting glucose", value: 5.1, unit: "mmol/L", low: 3.9, high: 5.5, status: "ok", note: "Normal" },
      { name: "HbA1c", value: 34, unit: "mmol/mol", high: 42, status: "ok", note: "Normal" },
      { name: "Vitamin D", value: 48, unit: "nmol/L", low: 50, high: 125, status: "watch", note: "Slightly low" },
    ],
  },
];
