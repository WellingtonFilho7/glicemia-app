"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { GlucoseEntry } from "@/types";

interface Props {
  entries: GlucoseEntry[];
  limitFasting?: number;
  limitPostprandial?: number;
}

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${DAY_NAMES[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MEAL_LABEL: Record<string, string> = {
  fasting: "Jejum",
  post_breakfast: "Pós-café",
  post_lunch: "Pós-almoço",
  post_dinner: "Pós-jantar",
};

export function GlucoseTrendChart({
  entries,
  limitFasting = 95,
  limitPostprandial = 140,
}: Props) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">
        Nenhuma medição no período.
      </p>
    );
  }

  const sorted = [...entries].sort(
    (a, b) =>
      new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  );

  const chartData = sorted.map((e) => ({
    time: fmtDate(e.measured_at),
    value: e.value,
    label: MEAL_LABEL[e.meal_type] ?? e.meal_type,
    isFasting: e.meal_type === "fasting",
    isAbove: e.is_above_limit,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={chartData}
        margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          domain={["auto", "auto"]}
          unit=" mg"
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
          }}
          formatter={(value, _name, entry) => [
            value != null ? `${value} mg/dL` : "—",
            entry.payload?.label ?? "",
          ]}
        />
        <ReferenceLine
          y={limitFasting}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          label={{
            value: `≤${limitFasting}`,
            fontSize: 9,
            fill: "#f59e0b",
            position: "insideTopRight",
          }}
        />
        <ReferenceLine
          y={limitPostprandial}
          stroke="#ef4444"
          strokeDasharray="4 4"
          label={{
            value: `≤${limitPostprandial}`,
            fontSize: 9,
            fill: "#ef4444",
            position: "insideTopRight",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#7c3aed"
          strokeWidth={2}
          dot={(props) => {
            const { cx, cy, payload } = props;
            return (
              <circle
                key={`dot-${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r={4}
                fill={payload.isAbove ? "#ef4444" : "#22c55e"}
                stroke="white"
                strokeWidth={1.5}
              />
            );
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
