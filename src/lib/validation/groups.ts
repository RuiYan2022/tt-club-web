import { z } from "zod";

export const GenerateSessionsSchema = z.object({
  groupId: z.string().uuid().optional(),
  windowStart: z.string().datetime().optional(),
  windowEnd: z.string().datetime().optional(),
  timezone: z.string().optional(),
  replaceExisting: z.boolean().optional(),
});
export type GenerateSessionsInput = z.infer<typeof GenerateSessionsSchema>;

export const SyncGroupSchema = z.object({
  groupId: z.string().uuid(),
  changeFrom: z.string().datetime(),
  changeTo: z.string().datetime(),
  timezone: z.string().optional(),
});
export type SyncGroupInput = z.infer<typeof SyncGroupSchema>;
