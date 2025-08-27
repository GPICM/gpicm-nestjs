import { z } from "zod";

export const CivilDefenseAlertDtoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  start_at: z.string().datetime({ offset: true }).or(z.string()), // validate date string
  valid_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().optional(),
  gravity_level: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH", "EXTREME"]),
});

export type CivilDefenseAlertDto = z.infer<typeof CivilDefenseAlertDtoSchema>;
