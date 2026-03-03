"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Share2, Printer, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateGestationalWeek } from "@/lib/utils/gestational";
import type {
  Profile,
  GlucoseEntry,
  Meal,
  WeightEntry,
  DailyCheckin,
} from "@/types";

const MEAL_LABEL: Record<string, string> = {
  fasting: "Jejum",
  post_breakfast: "Pós-café",
  post_lunch: "Pós-almoço",
  post_dinner: "Pós-jantar",
};

function avg(arr: number[]): string {
  return arr.length > 0
    ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
    : "—";
}

function pct(part: number, total: number): string {
  return total > 0 ? `${Math.round((part / total) * 100)}%` : "0%";
}

export default function ConsultaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [glucose, setGlucose] = useState<GlucoseEntry[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weight, setWeight] = useState<WeightEntry[]>([]);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);

  const DAYS = 14;

  const load = useCallback(async () => {
    const [pRes, gRes, mRes, wRes, cRes] = await Promise.all([
      fetch("/api/profile"),
      fetch(`/api/glucose-entries?days=${DAYS}`),
      fetch(`/api/meals?days=${DAYS}`),
      fetch(`/api/weight-entries?days=${DAYS}`),
      fetch(`/api/checkin?days=${DAYS}`),
    ]);
    const [pData, gData, mData, wData, cData] = await Promise.all([
      pRes.json(),
      gRes.json(),
      mRes.json(),
      wRes.json(),
      cRes.json(),
    ]);
    setProfile(pData.profile ?? null);
    setGlucose(gData.entries ?? []);
    setMeals(mData.meals ?? []);
    setWeight(wData.entries ?? []);
    setCheckins(cData.checkins ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Computed stats
  const gw = profile
    ? calculateGestationalWeek(
        profile.gestational_week_start,
        profile.gestational_week_number
      )
    : null;

  const fasting = glucose.filter((e) => e.meal_type === "fasting");
  const postMeal = glucose.filter((e) => e.meal_type !== "fasting");
  const above = glucose.filter((e) => e.is_above_limit);

  const avgStiffness = avg(
    checkins
      .map((c) => c.stiffness_score)
      .filter((v): v is number => v != null)
  );
  const avgPain = avg(
    checkins.map((c) => c.pain_score).filter((v): v is number => v != null)
  );
  const avgEnergy = avg(
    checkins.map((c) => c.energy_score).filter((v): v is number => v != null)
  );

  // Dinner correlation
  const dinnerByDate = new Map<string, number>();
  for (const m of meals) {
    if (m.period === "dinner" && m.total_calories) {
      dinnerByDate.set(m.eaten_at.split("T")[0], m.total_calories);
    }
  }
  const stiffnessByDate = new Map<string, number>();
  for (const c of checkins) {
    if (c.stiffness_score != null) stiffnessByDate.set(c.date, c.stiffness_score);
  }
  const heavyStiffness: number[] = [];
  const lightStiffness: number[] = [];
  for (const [date, cals] of dinnerByDate) {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const nextStr = next.toISOString().split("T")[0];
    const s = stiffnessByDate.get(nextStr);
    if (s != null) {
      if (cals >= 500) heavyStiffness.push(s);
      else lightStiffness.push(s);
    }
  }

  // Weight
  const sortedWeight = [...weight].sort(
    (a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
  );
  const latestWeight = sortedWeight[0];
  const prevWeight = sortedWeight[sortedWeight.length - 1];

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "Resumo de Saúde — Consulta",
        text: document.getElementById("consulta-content")?.innerText ?? "",
      });
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleAiConsulta() {
    const prompt = encodeURIComponent(
      "Faça um resumo completo dos meus últimos 14 dias para eu mostrar ao meu médico na consulta. Inclua glicemia, sintomas da espondilite, alimentação e correlações encontradas."
    );
    router.push(`/analise?prompt=${prompt}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-[var(--muted-foreground)]">
          Preparando resumo...
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/perfil"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              Resumo para consulta
            </h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              Últimos {DAYS} dias · Gerado em {today}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            aria-label="Compartilhar"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={handlePrint}
            className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            aria-label="Imprimir"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div id="consulta-content" className="space-y-4">
        {/* Paciente */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Paciente
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-[var(--muted-foreground)]">Nome</span>
            <span className="font-medium text-[var(--foreground)]">
              {profile?.name ?? "—"}
            </span>
            <span className="text-[var(--muted-foreground)]">Diagnóstico</span>
            <span className="font-medium text-[var(--foreground)]">
              Diabetes gestacional
            </span>
            <span className="text-[var(--muted-foreground)]">Comorbidade</span>
            <span className="font-medium text-[var(--foreground)]">
              Espondilite anquilosante
            </span>
            <span className="text-[var(--muted-foreground)]">Semana</span>
            <span className="font-medium text-[var(--foreground)]">
              {gw ? `${gw.week}ª semana gestacional` : "Não configurada"}
            </span>
            {profile?.medications && (
              <>
                <span className="text-[var(--muted-foreground)]">
                  Medicamentos
                </span>
                <span className="font-medium text-[var(--foreground)]">
                  {profile.medications}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Glicemia */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Glicemia — últimos {DAYS} dias
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Total de medições",
                value: String(glucose.length),
              },
              {
                label: "Acima do limite",
                value: `${above.length} (${pct(above.length, glucose.length)})`,
                red: above.length > 0,
              },
              {
                label: "Média em jejum",
                value:
                  fasting.length > 0
                    ? `${avg(fasting.map((e) => e.value))} mg/dL`
                    : "—",
              },
              {
                label: "Média pós-prandial",
                value:
                  postMeal.length > 0
                    ? `${avg(postMeal.map((e) => e.value))} mg/dL`
                    : "—",
              },
              {
                label: "Limite jejum",
                value: `${profile?.glucose_limit_fasting ?? 95} mg/dL`,
              },
              {
                label: "Limite pós-prandial",
                value: `${profile?.glucose_limit_postprandial ?? 140} mg/dL`,
              },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-[var(--muted)]/20 p-3">
                <p className="text-xs text-[var(--muted-foreground)]">
                  {s.label}
                </p>
                <p
                  className={`text-sm font-semibold ${s.red ? "text-red-600" : "text-[var(--foreground)]"}`}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Breakdown by type */}
          {glucose.length > 0 && (
            <div className="rounded-lg border border-[var(--border)] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)]/20">
                    <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">
                      Tipo
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--muted-foreground)]">
                      Medições
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--muted-foreground)]">
                      Média
                    </th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--muted-foreground)]">
                      Alertas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      "fasting",
                      "post_breakfast",
                      "post_lunch",
                      "post_dinner",
                    ] as const
                  ).map((type) => {
                    const entries = glucose.filter((e) => e.meal_type === type);
                    if (entries.length === 0) return null;
                    const alerts = entries.filter((e) => e.is_above_limit).length;
                    return (
                      <tr
                        key={type}
                        className="border-b border-[var(--border)] last:border-0"
                      >
                        <td className="px-3 py-2 text-[var(--foreground)]">
                          {MEAL_LABEL[type]}
                        </td>
                        <td className="px-3 py-2 text-right text-[var(--muted-foreground)]">
                          {entries.length}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-[var(--foreground)]">
                          {avg(entries.map((e) => e.value))} mg/dL
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-medium ${alerts > 0 ? "text-red-600" : "text-green-600"}`}
                        >
                          {alerts}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Espondilite */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Espondilite anquilosante — últimos {DAYS} dias
          </p>
          {checkins.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              Nenhum check-in no período.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Rigidez matinal", value: avgStiffness, unit: "/10", color: "text-amber-600" },
                  { label: "Dor", value: avgPain, unit: "/10", color: "text-red-500" },
                  { label: "Energia", value: avgEnergy, unit: "/10", color: "text-green-600" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg bg-[var(--muted)]/20 p-3 text-center"
                  >
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {s.label}
                    </p>
                    <p className={`text-lg font-bold ${s.color}`}>
                      {s.value}
                      <span className="text-xs font-normal text-[var(--muted-foreground)]">
                        {s.value !== "—" ? s.unit : ""}
                      </span>
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      média
                    </p>
                  </div>
                ))}
              </div>

              {(heavyStiffness.length >= 2 || lightStiffness.length >= 1) && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <p className="text-xs font-semibold text-amber-800">
                    Correlação jantar → rigidez
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    {heavyStiffness.length >= 1 &&
                      `Jantar ≥500 kcal: rigidez média ${avg(heavyStiffness)}/10 (${heavyStiffness.length} dia${heavyStiffness.length !== 1 ? "s" : ""})`}
                    {heavyStiffness.length >= 1 && lightStiffness.length >= 1 && " · "}
                    {lightStiffness.length >= 1 &&
                      `Jantar <500 kcal: rigidez média ${avg(lightStiffness)}/10 (${lightStiffness.length} dia${lightStiffness.length !== 1 ? "s" : ""})`}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Peso */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Peso
          </p>
          {!latestWeight ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              Nenhum registro no período.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-[var(--muted-foreground)]">Atual</span>
              <span className="font-semibold text-[var(--foreground)]">
                {latestWeight.value_kg} kg
              </span>
              {prevWeight && prevWeight.id !== latestWeight.id && (
                <>
                  <span className="text-[var(--muted-foreground)]">
                    Variação no período
                  </span>
                  <span
                    className={`font-semibold ${
                      Number(latestWeight.value_kg) > Number(prevWeight.value_kg)
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  >
                    {(
                      Number(latestWeight.value_kg) -
                      Number(prevWeight.value_kg)
                    ).toFixed(1) > "0"
                      ? "+"
                      : ""}
                    {(
                      Number(latestWeight.value_kg) -
                      Number(prevWeight.value_kg)
                    ).toFixed(1)}{" "}
                    kg
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pedir análise da IA */}
      <button
        onClick={handleAiConsulta}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 py-3.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100"
      >
        <Sparkles className="h-4 w-4" />
        Pedir análise completa da IA
      </button>
    </div>
  );
}
