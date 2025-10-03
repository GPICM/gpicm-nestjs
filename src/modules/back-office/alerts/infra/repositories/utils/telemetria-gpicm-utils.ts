import { z } from "zod";

export const CivilDefenseAlertDtoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  start_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "start_at must be a valid date string",
  }),
  valid_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "valid_at must be a valid date string",
  }),
  updated_at: z.string().optional(),
  gravity_level: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH", "EXTREME"]),
});

export type CivilDefenseAlertDto = z.infer<typeof CivilDefenseAlertDtoSchema>;
