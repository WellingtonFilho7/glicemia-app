import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Profile,
  GlucoseEntry,
  Meal,
  MealItem,
  WeightEntry,
  DailyCheckin,
} from "@/types";

export interface AnalysisContext {
  profile: Profile | null;
  glucoseEntries: GlucoseEntry[];
  meals: Array<Meal & { items: MealItem[] }>;
  weightEntries: WeightEntry[];
  checkins: DailyCheckin[];
}

export async function fetchAnalysisContext(
  supabase: SupabaseClient,
  userId: string,
  days = 7
): Promise<AnalysisContext> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceIso = since.toISOString();
  const sinceDate = sinceIso.split("T")[0];

  const [profileRes, glucoseRes, mealsRes, weightRes, checkinsRes] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase
        .from("glucose_entries")
        .select("*")
        .eq("user_id", userId)
        .gte("measured_at", sinceIso)
        .order("measured_at"),
      supabase
        .from("meals")
        .select("*, items:meal_items(*)")
        .eq("user_id", userId)
        .gte("eaten_at", sinceIso)
        .order("eaten_at"),
      supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", userId)
        .order("measured_at", { ascending: false })
        .limit(5),
      supabase
        .from("daily_checkins")
        .select("*")
        .eq("user_id", userId)
        .gte("date", sinceDate)
        .order("date"),
    ]);

  return {
    profile: profileRes.data,
    glucoseEntries: (glucoseRes.data ?? []) as GlucoseEntry[],
    meals: (mealsRes.data ?? []) as Array<Meal & { items: MealItem[] }>,
    weightEntries: (weightRes.data ?? []) as WeightEntry[],
    checkins: (checkinsRes.data ?? []) as DailyCheckin[],
  };
}
