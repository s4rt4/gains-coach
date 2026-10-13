"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dailyWeights, profile, weeks } from "@/data/persona";

const C = {
  accent: "#d4ff3a",
  muted: "#8a9099",
  line: "#262a31",
  surface: "#1a1d23",
  info: "#5aa9ff",
  ok: "#3ddc97",
  warn: "#ffb020",
};

const axis = { stroke: C.muted, fontSize: 11, tickLine: false, axisLine: false };
const tooltipStyle = {
  contentStyle: { background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, fontSize: 12 },
  labelStyle: { color: C.muted },
  itemStyle: { color: "#f2f3f5" },
};

const fmtDay = (d: string) =>
  new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export function WeightChart() {
  const data = dailyWeights.map((d, i) => {
    const wk = weeks[Math.floor(i / 7)];
    return { date: d.date, scale: d.kg, avg: i % 7 === 3 ? wk.avgWeightKg : undefined };
  });
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.accent} stopOpacity={0.18} />
              <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={C.line} vertical={false} />
          <XAxis dataKey="date" tickFormatter={fmtDay} {...axis} minTickGap={40} />
          <YAxis domain={[84, 93.5]} {...axis} tickCount={6} />
          <Tooltip {...tooltipStyle} labelFormatter={(l) => fmtDay(String(l))} formatter={(v) => [`${v} kg`]} />
          <ReferenceLine
            y={profile.goalWeightKg}
            stroke={C.ok}
            strokeDasharray="4 4"
            label={{ value: "Goal 85 kg", fill: C.ok, fontSize: 11, position: "insideBottomRight" }}
          />
          <Area type="monotone" dataKey="scale" name="Scale" stroke={C.muted} strokeWidth={1} fill="url(#wfill)" dot={false} />
          <Line type="monotone" dataKey="avg" name="Weekly avg" stroke={C.accent} strokeWidth={2.5} dot={{ r: 3, fill: C.accent }} connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StrengthChart() {
  const data = weeks.map((w) => ({ week: `W${w.week}`, Bench: w.e1rm.bench, Squat: w.e1rm.squat, Deadlift: w.e1rm.deadlift }));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={C.line} vertical={false} />
          <XAxis dataKey="week" {...axis} />
          <YAxis domain={[100, 230]} {...axis} />
          <Tooltip {...tooltipStyle} formatter={(v, n) => [`${v} kg`, n]} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: C.muted }} />
          <Line type="monotone" dataKey="Deadlift" stroke={C.ok} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Squat" stroke={C.info} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Bench" stroke={C.warn} strokeWidth={2.5} dot={{ r: 2.5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CaloriesChart({ className = "h-56" }: { className?: string }) {
  const data = weeks.map((w) => ({ week: `W${w.week}`, kcal: w.kcal, protein: w.proteinG }));
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid stroke={C.line} vertical={false} />
          <XAxis dataKey="week" {...axis} />
          <YAxis domain={[2000, 2700]} {...axis} />
          <Tooltip {...tooltipStyle} formatter={(v, n) => [n === "kcal" ? `${v} kcal` : `${v} g`, n === "kcal" ? "Calories" : "Protein"]} />
          <ReferenceLine
            y={profile.targets.kcal}
            stroke={C.accent}
            strokeDasharray="4 4"
            label={{ value: "Target 2,400", fill: C.accent, fontSize: 11, position: "insideTopLeft" }}
          />
          <Bar dataKey="kcal" radius={[6, 6, 0, 0]} fill="#3a3f48" activeBar={{ fill: C.accent }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
