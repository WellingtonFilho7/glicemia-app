import { z } from "zod";

export const CreateWeightEntrySchema = z.object({
  value_kg: z
    .number()
    .min(30, "Valor muito baixo")
    .max(300, "Valor muito alto")
    .multipleOf(0.01),
  measured_at: z.string().datetime().optional(),
});

export type CreateWeightEntryInput = z.infer<typeof CreateWeightEntrySchema>;
