"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeightEntry } from "@/types";

interface Props {
  entries: WeightEntry[];
}

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${DAY_NAMES[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function WeightChart({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[var(--muted-foreground)]">
        Nenhum registro de peso no período.
      </p>
    );
  }

  const sorted = [...entries].sort(
    (a, b) =>
      new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  );

  const chartData = sorted.map((e) => ({
    date: fmtDate(e.measured_at),
    Peso: Number(e.value_kg),
  }));

  const values = chartData.map((d) => d.Peso);
  const minVal = Math.floor(Math.min(...values) - 0.5);
  const maxVal = Math.ceil(Math.max(...values) + 0.5);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        data={chartData}
        margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          domain={[minVal, maxVal]}
          unit=" kg"
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value) => [value != null ? `${value} kg` : "—", "Peso"]}
        />
        <Line
          type="monotone"
          dataKey="Peso"
          stroke="#7c3aed"
          strokeWidth={2}
          dot={{ r: 4, fill: "#7c3aed" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
