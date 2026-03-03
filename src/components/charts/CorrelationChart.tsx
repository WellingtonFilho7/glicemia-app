"use client";

import type { Meal, DailyCheckin } from "@/types";

interface Props {
  meals: Meal[];
  checkins: DailyCheckin[];
}

interface CorrelationPoint {
  date: string;
  dinnerCalories: number;
  nextStiffness: number | null;
}

export function CorrelationChart({ meals, checkins }: Props) {
  // Build dinner calories by date
  const dinnerByDate = new Map<string, number>();
  for (const m of meals) {
    if (m.period === "dinner" && m.total_calories) {
      const date = m.eaten_at.split("T")[0];
      dinnerByDate.set(date, m.total_calories);
    }
  }

  // Build stiffness by date
  const stiffnessByDate = new Map<string, number>();
  for (const c of checkins) {
    if (c.stiffness_score != null) {
      stiffnessByDate.set(c.date, c.stiffness_score);
    }
  }

  // Build correlation points: dinner date → next morning stiffness
  const points: CorrelationPoint[] = [];
  for (const [date, cals] of dinnerByDate.entries()) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextStr = nextDate.toISOString().split("T")[0];
    const stiffness = stiffnessByDate.get(nextStr) ?? null;
    if (stiffness !== null) {
      points.push({ date, dinnerCalories: cals, nextStiffness: stiffness });
    }
  }

  if (points.length < 2) {
    return (
      <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">
        Dados insuficientes para correlação (precisa de pelo menos 2 dias com
        jantar + check-in no dia seguinte).
      </p>
    );
  }

  const heavy = points.filter((p) => p.dinnerCalories >= 500);
  const light = points.filter((p) => p.dinnerCalories < 500);

  const avg = (arr: number[]) =>
    arr.length > 0
      ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
      : null;

  const avgHeavy = avg(heavy.map((p) => p.nextStiffness as number));
  const avgLight = avg(light.map((p) => p.nextStiffness as number));

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--muted-foreground)]">
        Correlação: calorias do jantar → rigidez matinal do dia seguinte
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <p className="text-xs text-[var(--muted-foreground)]">
            Jantar pesado (≥500 kcal)
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-500">
            {avgHeavy ?? "—"}
            <span className="text-sm font-normal">/10</span>
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            rigidez média ({heavy.length} dia{heavy.length !== 1 ? "s" : ""})
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
          <p className="text-xs text-[var(--muted-foreground)]">
            Jantar leve (&lt;500 kcal)
          </p>
          <p className="mt-1 text-2xl font-bold text-green-500">
            {avgLight ?? "—"}
            <span className="text-sm font-normal">/10</span>
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            rigidez média ({light.length} dia{light.length !== 1 ? "s" : ""})
          </p>
        </div>
      </div>

      {/* Detail table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]/20">
              <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">
                Data
              </th>
              <th className="px-3 py-2 text-right font-medium text-[var(--muted-foreground)]">
                Jantar
              </th>
              <th className="px-3 py-2 text-right font-medium text-[var(--muted-foreground)]">
                Rigidez +1d
              </th>
            </tr>
          </thead>
          <tbody>
            {points
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((p) => (
                <tr
                  key={p.date}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <td className="px-3 py-2 text-[var(--foreground)]">
                    {p.date}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-medium ${
                      p.dinnerCalories >= 500
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  >
                    {p.dinnerCalories} kcal
                  </td>
                  <td className="px-3 py-2 text-right text-[var(--foreground)]">
                    {p.nextStiffness}/10
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
