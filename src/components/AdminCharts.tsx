"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthly, type Influencer } from "@/data/admin";

const C = { accent: "#d4ff3a", muted: "#8a9099", line: "#262a31", surface: "#1a1d23", info: "#5aa9ff" };

const axis = { stroke: C.muted, fontSize: 11, tickLine: false, axisLine: false };
const tooltipStyle = {
  contentStyle: { background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12, fontSize: 12 },
  labelStyle: { color: C.muted },
  itemStyle: { color: "#f2f3f5" },
};
const gbp = (v: number) => `£${v.toLocaleString("en-GB")}`;

export function RevenueChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={monthly} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
          <defs>
            <linearGradient id="mrrfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.accent} stopOpacity={0.25} />
              <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={C.line} vertical={false} />
          <XAxis dataKey="month" {...axis} />
          <YAxis {...axis} tickFormatter={(v) => `£${v / 1000}k`} />
          <Tooltip {...tooltipStyle} formatter={(v, n) => [gbp(Number(v)), n === "mrr" ? "MRR" : "AI cost"]} />
          <Area type="monotone" dataKey="mrr" stroke={C.accent} strokeWidth={2.5} fill="url(#mrrfill)" />
          <Area type="monotone" dataKey="aiCost" stroke={C.info} strokeWidth={2} fill="transparent" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SignupsChart() {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={monthly} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={C.line} vertical={false} />
          <XAxis dataKey="month" {...axis} />
          <YAxis {...axis} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} formatter={(v) => [v, "Sign-ups"]} />
          <Bar dataKey="signups" radius={[6, 6, 0, 0]} fill="#3a3f48" activeBar={{ fill: C.accent }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InfluencerChart({ data, className = "h-64" }: { data: Influencer[]; className?: string }) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={C.line} horizontal={false} />
          <XAxis type="number" {...axis} />
          <YAxis type="category" dataKey="code" {...axis} width={70} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="signups" name="Sign-ups" fill="#3a3f48" radius={[0, 6, 6, 0]} barSize={14} />
          <Bar dataKey="active" name="Paying" fill={C.accent} radius={[0, 6, 6, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
