// =============================================================================
// Glicemia App — TypeScript Types
// Baseado em docs/architecture/DATA-MODEL.md
//
// TODO: Após configurar o Supabase, gere os tipos automáticos com:
// npx supabase gen types typescript --project-id <id> > src/types/database.types.ts
// =============================================================================

// ---------------------------------------------------------------------------
// Enum types (mapeiam os PostgreSQL ENUMs)
// ---------------------------------------------------------------------------

export type GlucoseMealType =
  | "fasting"
  | "post_breakfast"
  | "post_lunch"
  | "post_dinner";

export type MealPeriod = "breakfast" | "lunch" | "dinner" | "snack";

// Status calculado no front-end para exibição
export type GlucoseStatus = "normal" | "above_limit" | "hypoglycemia";

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  name: string;
  /** Data base para calcular a semana gestacional */
  gestational_week_start: string | null;
  /** Número da semana gestacional na data gestational_week_start */
  gestational_week_number: number | null;
  has_spondylitis: boolean;
  glucose_limit_fasting: number;
  glucose_limit_postprandial: number;
  medications: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Glucose Entries
// ---------------------------------------------------------------------------

export interface GlucoseEntry {
  id: string;
  user_id: string;
  value: number;
  meal_type: GlucoseMealType;
  /** Minutos após refeição. NULL para jejum. Ela mede em tempos variáveis: 60, 75, 80min. */
  minutes_after_meal: number | null;
  measured_at: string;
  notes: string | null;
  /** Calculado automaticamente pelo banco via coluna GENERATED */
  is_above_limit: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Meals
// ---------------------------------------------------------------------------

export interface Meal {
  id: string;
  user_id: string;
  period: MealPeriod;
  description: string;
  total_calories: number | null;
  total_carbs_grams: number | null;
  total_protein_grams: number | null;
  total_fat_grams: number | null;
  eaten_at: string;
  notes: string | null;
  created_at: string;
  /** Populated via JOIN quando necessário */
  items?: MealItem[];
}

// ---------------------------------------------------------------------------
// Meal Items
// ---------------------------------------------------------------------------

export interface MealItem {
  id: string;
  meal_id: string;
  /** Referência opcional a um alimento salvo */
  saved_food_id: string | null;
  name: string;
  quantity_grams: number | null;
  /** Para quando não sabe o peso: "1 fatia", "1 xícara" */
  quantity_description: string | null;
  calories: number | null;
  carbs_grams: number | null;
  protein_grams: number | null;
  fat_grams: number | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Saved Foods
// Ela come os mesmos alimentos repetidamente (pão de inhame, queijo, leite vegetal).
// ---------------------------------------------------------------------------

export interface SavedFood {
  id: string;
  user_id: string;
  name: string;
  calories_per_100g: number | null;
  carbs_per_100g: number | null;
  protein_per_100g: number | null;
  fat_per_100g: number | null;
  /** Porção padrão em gramas para pré-preencher o formulário */
  default_portion_grams: number | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Weight Entries
// ---------------------------------------------------------------------------

export interface WeightEntry {
  id: string;
  user_id: string;
  value_kg: number;
  measured_at: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Daily Checkins
// Check-in matinal estruturado. Um registro por dia.
// Baseado no ritual natural da usuária (função #3 crítica do GPT-CHAT-INSIGHTS).
// ---------------------------------------------------------------------------

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: string; // ISO date string: "2025-01-15"
  /** Rigidez matinal — escala 0-10 */
  stiffness_score: number | null;
  /** Dor no quadril — escala 0-10 */
  pain_score: number | null;
  /** Nível de energia — escala 0-10 */
  energy_score: number | null;
  nausea: boolean;
  notes: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// AI Conversations
// ---------------------------------------------------------------------------

export interface AiConversation {
  id: string;
  user_id: string;
  user_message: string;
  ai_response: string;
  /** Resumo dos dados enviados para a IA naquele momento (para auditoria) */
  data_context_summary: string | null;
  tokens_used: number | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Helper types (para forms e API)
// ---------------------------------------------------------------------------

export type CreateGlucoseEntry = Omit<
  GlucoseEntry,
  "id" | "user_id" | "is_above_limit" | "created_at"
>;

export type CreateMeal = Omit<Meal, "id" | "user_id" | "created_at" | "items">;

export type CreateMealItem = Omit<MealItem, "id" | "created_at">;

export type CreateSavedFood = Omit<SavedFood, "id" | "user_id" | "created_at">;

export type CreateWeightEntry = Omit<WeightEntry, "id" | "user_id" | "created_at">;

export type CreateDailyCheckin = Omit<DailyCheckin, "id" | "user_id" | "created_at">;

export type UpdateProfile = Partial<
  Omit<Profile, "id" | "created_at" | "updated_at">
>;

// ---------------------------------------------------------------------------
// Semana gestacional (calculada no front-end)
// ---------------------------------------------------------------------------

export interface GestationalWeek {
  week: number;
  days: number;
  trimester: 1 | 2 | 3;
}
