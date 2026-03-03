import { redirect } from "next/navigation";
import Link from "next/link";
import { Droplets, UtensilsCrossed, Scale, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MorningCheckin } from "@/components/checkin/MorningCheckin";
import { CheckinSummary } from "@/components/checkin/CheckinSummary";
import { PostMealTimer } from "@/components/glucose/PostMealTimer";
import type { DailyCheckin, GlucoseEntry, GlucoseMealType, Meal, WeightEntry } from "@/types";

const MEAL_LABELS: Record<GlucoseMealType, string> = {
  fasting: "Jejum",
  post_breakfast: "Pós-café",
  post_lunch: "Pós-almoço",
  post_dinner: "Pós-jantar",
};

const MEAL_PERIOD_LABELS: Record<string, string> = {
  breakfast: "Café da manhã",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Lanche",
};

const GLUCOSE_TYPES: GlucoseMealType[] = [
  "fasting",
  "post_breakfast",
  "post_lunch",
  "post_dinner",
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const todayDate = new Date().toISOString().split("T")[0];
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [checkinRes, glucoseRes, mealsRes, weightRes] = await Promise.all([
    supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayDate)
      .maybeSingle(),
    supabase
      .from("glucose_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("measured_at", todayStart.toISOString())
      .order("measured_at"),
    supabase
      .from("meals")
      .select("*")
      .eq("user_id", user.id)
      .gte("eaten_at", todayStart.toISOString())
      .order("eaten_at"),
    supabase
      .from("weight_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("measured_at", { ascending: false })
      .limit(1),
  ]);

  const checkin = checkinRes.data as DailyCheckin | null;
  const glucoseEntries = (glucoseRes.data ?? []) as GlucoseEntry[];
  const meals = (mealsRes.data ?? []) as Meal[];
  const latestWeight = (weightRes.data ?? [])[0] as WeightEntry | undefined;

  if (!checkin) {
    return <MorningCheckin />;
  }

  const glucoseByType: Partial<Record<GlucoseMealType, GlucoseEntry>> = {};
  for (const entry of glucoseEntries) {
    glucoseByType[entry.meal_type] = entry;
  }

  const hasAlerts = glucoseEntries.some((e) => e.is_above_limit);
  const totalCalories = meals.reduce((s, m) => s + (m.total_calories ?? 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + (m.total_carbs_grams ?? 0), 0);

  return (
    <div className="px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Bom dia!</h1>
        <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <PostMealTimer />

      {hasAlerts && (
        <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          Glicemia acima do limite registrada hoje
        </div>
      )}

      <CheckinSummary checkin={checkin} />

      {/* Glicemia hoje */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Glicemia hoje
          </h2>
          <Link href="/registrar/glicemia" className="text-xs font-medium text-[var(--primary)]">
            + Registrar
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {GLUCOSE_TYPES.map((type) => {
            const entry = glucoseByType[type];
            return (
              <div
                key={type}
                className={`rounded-xl border p-3 ${
                  entry
                    ? entry.is_above_limit
                      ? "border-red-200 bg-red-50"
                      : "border-green-200 bg-green-50"
                    : "border-[var(--border)] bg-[var(--card)]"
                }`}
              >
                <p className="text-xs text-[var(--muted-foreground)]">
                  {MEAL_LABELS[type]}
                </p>
                {entry ? (
                  <>
                    <p className={`text-2xl font-bold tabular-nums ${entry.is_above_limit ? "text-red-700" : "text-green-700"}`}>
                      {entry.value}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {entry.is_above_limit ? "Acima" : "Normal"}
                      {entry.minutes_after_meal ? ` · ${entry.minutes_after_meal}min` : ""}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-xl font-bold text-[var(--muted-foreground)]/40">—</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Refeições hoje */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Refeições hoje
          </h2>
          <Link href="/registrar/refeicao" className="text-xs font-medium text-[var(--primary)]">
            + Registrar
          </Link>
        </div>
        {meals.length > 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)]">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between px-4 py-3">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {MEAL_PERIOD_LABELS[meal.period] ?? meal.period}
                </p>
                <div className="text-right">
                  {meal.total_calories ? (
                    <p className="text-sm font-semibold text-[var(--foreground)]">{meal.total_calories} kcal</p>
                  ) : null}
                  {meal.total_carbs_grams ? (
                    <p className="text-xs text-[var(--muted-foreground)]">{meal.total_carbs_grams}g carb</p>
                  ) : null}
                </div>
              </div>
            ))}
            {(totalCalories > 0 || totalCarbs > 0) && meals.length > 1 && (
              <div className="flex items-center justify-between bg-[var(--muted)]/20 px-4 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Total do dia</p>
                <div className="text-right">
                  {totalCalories > 0 && (
                    <p className="text-sm font-bold text-[var(--foreground)]">{totalCalories} kcal</p>
                  )}
                  {totalCarbs > 0 && (
                    <p className="text-xs text-[var(--muted-foreground)]">{totalCarbs}g carb</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-4 py-6 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">Nenhuma refeição registrada hoje</p>
          </div>
        )}
      </section>

      {/* Peso */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Peso</h2>
          <Link href="/registrar/peso" className="text-xs font-medium text-[var(--primary)]">
            + Registrar
          </Link>
        </div>
        {latestWeight ? (
          <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
            <Scale className="h-5 w-5 text-[var(--muted-foreground)]" />
            <div>
              <p className="text-lg font-bold text-[var(--foreground)]">{latestWeight.value_kg} kg</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {new Date(latestWeight.measured_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] px-4 py-5 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">Nenhum registro de peso ainda</p>
          </div>
        )}
      </section>

      {/* Ações rápidas */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Registrar agora
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <QuickActionCard icon={<Droplets className="h-5 w-5 text-violet-600" />} title="Glicemia" href="/registrar/glicemia" />
          <QuickActionCard icon={<UtensilsCrossed className="h-5 w-5 text-emerald-600" />} title="Refeição" href="/registrar/refeicao" />
          <QuickActionCard icon={<Scale className="h-5 w-5 text-blue-600" />} title="Peso" href="/registrar/peso" />
        </div>
      </section>
    </div>
  );
}

function QuickActionCard({ icon, title, href }: { icon: React.ReactNode; title: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] py-4 transition-colors hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5"
    >
      {icon}
      <p className="text-xs font-semibold text-[var(--foreground)]">{title}</p>
    </Link>
  );
}
