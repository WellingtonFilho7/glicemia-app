import type { GlucoseEntry, GlucoseMealType } from "@/types";

const MEAL_LABELS: Record<GlucoseMealType, string> = {
  fasting: "Jejum",
  post_breakfast: "Pós-café",
  post_lunch: "Pós-almoço",
  post_dinner: "Pós-jantar",
};

interface GlucoseCardProps {
  entry: GlucoseEntry;
}

export function GlucoseCard({ entry }: GlucoseCardProps) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        entry.is_above_limit
          ? "border-red-200 bg-red-50"
          : "border-green-200 bg-green-50"
      }`}
    >
      <p className="text-xs text-[var(--muted-foreground)]">
        {MEAL_LABELS[entry.meal_type]}
      </p>
      <p
        className={`text-2xl font-bold tabular-nums ${
          entry.is_above_limit ? "text-red-700" : "text-green-700"
        }`}
      >
        {entry.value}
      </p>
      <p className="text-xs text-[var(--muted-foreground)]">
        {entry.is_above_limit ? "Acima" : "Normal"}
        {entry.minutes_after_meal ? ` • ${entry.minutes_after_meal}min` : ""}
      </p>
    </div>
  );
}
