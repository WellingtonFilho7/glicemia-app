import { z } from "zod";

const scoreSchema = z
  .number()
  .int()
  .min(0, "Mínimo é 0")
  .max(10, "Máximo é 10")
  .nullable()
  .optional();

export const CreateDailyCheckinSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use YYYY-MM-DD)"),
  /** Rigidez matinal: 0 = nenhuma, 10 = muito intensa */
  stiffness_score: scoreSchema,
  /** Dor no quadril: 0 = sem dor, 10 = dor intensa */
  pain_score: scoreSchema,
  /** Energia: 0 = sem energia, 10 = muita energia */
  energy_score: scoreSchema,
  nausea: z.boolean().optional().default(false),
  notes: z.string().max(1000).nullable().optional(),
});

export type CreateDailyCheckinInput = z.infer<typeof CreateDailyCheckinSchema>;
