import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  gestational_week_start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .nullable()
    .optional(),
  gestational_week_number: z
    .number()
    .int()
    .min(1, "Semana mínima é 1")
    .max(42, "Semana máxima é 42")
    .nullable()
    .optional(),
  has_spondylitis: z.boolean().optional(),
  glucose_limit_fasting: z
    .number()
    .int()
    .min(60)
    .max(200)
    .optional(),
  glucose_limit_postprandial: z
    .number()
    .int()
    .min(80)
    .max(300)
    .optional(),
  medications: z.string().max(1000).nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
