import { z } from "zod";

export const MealPeriodSchema = z.enum([
  "breakfast",
  "lunch",
  "dinner",
  "snack",
]);

export const CreateMealItemSchema = z.object({
  saved_food_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1, "Nome do alimento é obrigatório").max(200),
  quantity_grams: z.number().min(0).max(5000).nullable().optional(),
  quantity_description: z.string().max(100).nullable().optional(),
  calories: z.number().int().min(0).max(10000).nullable().optional(),
  carbs_grams: z.number().min(0).max(1000).nullable().optional(),
  protein_grams: z.number().min(0).max(1000).nullable().optional(),
  fat_grams: z.number().min(0).max(1000).nullable().optional(),
});

export const CreateMealSchema = z.object({
  period: MealPeriodSchema,
  description: z.string().min(1, "Descrição é obrigatória").max(1000),
  eaten_at: z.string().datetime().optional(),
  notes: z.string().max(500).nullable().optional(),
  items: z.array(CreateMealItemSchema).optional(),
});

export type CreateMealInput = z.infer<typeof CreateMealSchema>;
export type CreateMealItemInput = z.infer<typeof CreateMealItemSchema>;

export const MealPeriodLabels: Record<string, string> = {
  breakfast: "Café da manhã",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Lanche",
};
