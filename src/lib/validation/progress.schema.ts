import { z } from "zod";

export const progressQuerySchema = z.object({
  range: z.enum(["7d", "30d", "90d"]).default("30d"),
});

export type ProgressQueryInput = z.infer<typeof progressQuerySchema>;
