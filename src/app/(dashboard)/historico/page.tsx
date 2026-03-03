"use client";

import { useState, useEffect, useCallback } from "react";
import { Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlucoseTrendChart } from "@/components/charts/GlucoseTrendChart";
import { SymptomTrendChart } from "@/components/charts/SymptomTrendChart";
import { WeightChart } from "@/components/charts/WeightChart";
import { CorrelationChart } from "@/components/charts/CorrelationChart";
import type { GlucoseEntry, Meal, WeightEntry, DailyCheckin, GlucoseMealType, MealPeriod } from "@/types";

const RANGES = [
  { label: "7 dias", value: 7 },
  { label: "14 dias", value: 14 },
  { label: "30 dias", value: 30 },
];

const GLUCOSE_LABEL: Record<GlucoseMealType, string> = {
  fasting: "Jejum",
  post_breakfast: "Pós-café",
  post_lunch: "Pós-almoço",
  post_dinner: "Pós-jantar",
};

const MEAL_LABEL: Record<MealPeriod, string> = {
  breakfast: "Café da manhã",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Lanche",
};

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function fmtDateLabel(iso: string) {
  const d = new Date(iso);
  return `${DAY_NAMES[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function groupByDate<T>(items: T[], getDate: (i: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const date = getDate(item).split("T")[0];
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(item);
  }
  return map;
}

export default function HistoricoPage() {
  const [days, setDays] = useState(7);
  const [glucose, setGlucose] = useState<GlucoseEntry[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weight, setWeight] = useState<WeightEntry[]>([]);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  // Profile limits for glucose chart
  const [limits, setLimits] = useState({ fasting: 95, postprandial: 140 });

  const load = useCallback(async (d: number) => {
    setLoading(true);
    const [gRes, mRes, wRes, cRes, pRes] = await Promise.all([
      fetch(`/api/glucose-entries?days=${d}`),
      fetch(`/api/meals?days=${d}`),
      fetch(`/api/weight-entries?days=${d}`),
      fetch(`/api/checkin?days=${d}`),
      fetch("/api/profile"),
    ]);

    const [gData, mData, wData, cData, pData] = await Promise.all([
      gRes.json(),
      mRes.json(),
      wRes.json(),
      cRes.json(),
      pRes.json(),
    ]);

    setGlucose(gData.entries ?? []);
    setMeals(mData.meals ?? []);
    setWeight(wData.entries ?? []);
    setCheckins(cData.checkins ?? []);
    if (pData.profile) {
      setLimits({
        fasting: pData.profile.glucose_limit_fasting ?? 95,
        postprandial: pData.profile.glucose_limit_postprandial ?? 140,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(days);
  }, [days, load]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/export/csv?days=${days}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `glicemia-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  // Group data by date for history lists
  const glucoseByDate = groupByDate(glucose, (e) => e.measured_at);
  const mealsByDate = groupByDate(meals, (m) => m.eaten_at);

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Histórico
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Gráficos e registros anteriores
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          {exporting ? "Exportando..." : "CSV"}
        </button>
      </div>

      {/* Range selector */}
      <div className="flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setDays(r.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              days === r.value
                ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                : "border-[var(--border)] text-[var(--muted-foreground)]"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-[var(--muted-foreground)]">
          Carregando...
        </p>
      ) : (
        <Tabs defaultValue="glicemia">
          <TabsList className="w-full">
            <TabsTrigger value="glicemia" className="flex-1 text-xs">
              Glicemia
            </TabsTrigger>
            <TabsTrigger value="sintomas" className="flex-1 text-xs">
              Sintomas
            </TabsTrigger>
            <TabsTrigger value="refeicoes" className="flex-1 text-xs">
              Refeições
            </TabsTrigger>
            <TabsTrigger value="peso" className="flex-1 text-xs">
              Peso
            </TabsTrigger>
          </TabsList>

          {/* ── GLICEMIA ── */}
          <TabsContent value="glicemia" className="space-y-4 pt-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                Tendência
              </p>
              <GlucoseTrendChart
                entries={glucose}
                limitFasting={limits.fasting}
                limitPostprandial={limits.postprandial}
              />
            </div>

            {/* Stats summary */}
            {glucose.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Total",
                    value: glucose.length,
                    unit: "medições",
                  },
                  {
                    label: "Acima",
                    value: glucose.filter((e) => e.is_above_limit).length,
                    unit: "alertas",
                    red: glucose.some((e) => e.is_above_limit),
                  },
                  {
                    label: "Média",
                    value: Math.round(
                      glucose.reduce((s, e) => s + e.value, 0) / glucose.length
                    ),
                    unit: "mg/dL",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center"
                  >
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {s.label}
                    </p>
                    <p
                      className={`text-xl font-bold ${s.red ? "text-red-500" : "text-[var(--foreground)]"}`}
                    >
                      {s.value}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {s.unit}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Daily list */}
            <div className="space-y-3">
              {[...glucoseByDate.entries()]
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([date, entries]) => (
                  <div
                    key={date}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
                  >
                    <div className="border-b border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2">
                      <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                        {fmtDateLabel(entries[0].measured_at)}
                      </p>
                    </div>
                    {entries.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border)] last:border-0"
                      >
                        <span className="text-sm text-[var(--muted-foreground)]">
                          {GLUCOSE_LABEL[e.meal_type]}
                          {e.minutes_after_meal
                            ? ` (${e.minutes_after_meal}min)`
                            : ""}
                        </span>
                        <span
                          className={`text-sm font-semibold ${
                            e.is_above_limit
                              ? "text-red-500"
                              : "text-green-600"
                          }`}
                        >
                          {e.value} mg/dL
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </TabsContent>

          {/* ── SINTOMAS ── */}
          <TabsContent value="sintomas" className="space-y-4 pt-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                Rigidez · Dor · Energia
              </p>
              <SymptomTrendChart checkins={checkins} />
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                Jantar → rigidez do dia seguinte
              </p>
              <CorrelationChart meals={meals} checkins={checkins} />
            </div>
          </TabsContent>

          {/* ── REFEIÇÕES ── */}
          <TabsContent value="refeicoes" className="space-y-3 pt-2">
            {meals.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                Nenhuma refeição no período.
              </p>
            ) : (
              [...mealsByDate.entries()]
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([date, dayMeals]) => (
                  <div
                    key={date}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
                  >
                    <div className="border-b border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2">
                      <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                        {fmtDateLabel(dayMeals[0].eaten_at)}
                      </p>
                    </div>
                    {dayMeals.map((m) => (
                      <div
                        key={m.id}
                        className="border-b border-[var(--border)] last:border-0 px-3 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[var(--foreground)]">
                            {MEAL_LABEL[m.period] ?? m.period}
                          </p>
                          {(m.total_calories || m.total_carbs_grams) && (
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {m.total_calories
                                ? `${m.total_calories} kcal`
                                : ""}
                              {m.total_calories && m.total_carbs_grams
                                ? " · "
                                : ""}
                              {m.total_carbs_grams
                                ? `${m.total_carbs_grams}g carb`
                                : ""}
                            </p>
                          )}
                        </div>
                        {m.description && (
                          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                            {m.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))
            )}
          </TabsContent>

          {/* ── PESO ── */}
          <TabsContent value="peso" className="space-y-4 pt-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                Evolução do peso
              </p>
              <WeightChart entries={weight} />
            </div>

            {weight.length > 0 && (
              <div className="space-y-2">
                {[...weight]
                  .sort(
                    (a, b) =>
                      new Date(b.measured_at).getTime() -
                      new Date(a.measured_at).getTime()
                  )
                  .map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
                    >
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {fmtDateLabel(w.measured_at)}
                      </span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {w.value_kg} kg
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
