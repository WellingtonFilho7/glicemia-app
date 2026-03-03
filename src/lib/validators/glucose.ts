import { z } from "zod";

export const GlucoseMealTypeSchema = z.enum([
  "fasting",
  "post_breakfast",
  "post_lunch",
  "post_dinner",
]);

export const CreateGlucoseEntrySchema = z
  .object({
    value: z
      .number()
      .int("O valor deve ser um número inteiro")
      .min(40, "Valor muito baixo (mínimo 40 mg/dL)")
      .max(600, "Valor muito alto (máximo 600 mg/dL)"),
    meal_type: GlucoseMealTypeSchema,
    minutes_after_meal: z
      .number()
      .int()
      .min(0)
      .max(480)
      .nullable()
      .optional(),
    measured_at: z.string().datetime().optional(),
    notes: z.string().max(500).nullable().optional(),
  })
  .refine(
    (data) => {
      // Jejum não deve ter minutes_after_meal
      if (data.meal_type === "fasting" && data.minutes_after_meal != null) {
        return false;
      }
      return true;
    },
    {
      message: "Glicemia de jejum não deve ter tempo após refeição",
      path: ["minutes_after_meal"],
    }
  );

export type CreateGlucoseEntryInput = z.infer<typeof CreateGlucoseEntrySchema>;

export const GlucoseEntryLabels: Record<string, string> = {
  fasting: "Jejum",
  post_breakfast: "Pós-café",
  post_lunch: "Pós-almoço",
  post_dinner: "Pós-jantar",
};
