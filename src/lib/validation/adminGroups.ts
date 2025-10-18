import { z } from "zod";

export const ScheduleRowSchema = z.object({
  id: z.string().uuid().optional(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().nullable().optional(),
});

export const UpdateGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string().nullable().optional(),
  capacity: z.number().int().nullable().optional(),
  rate_per_session_cents: z.number().int().nullable().optional(),
  active: z.boolean(),
  schedule: z.array(ScheduleRowSchema),
  changeFrom: z.string().datetime().optional(),
  changeTo: z.string().datetime().optional(),
});

export type UpdateGroupInput = z.infer<typeof UpdateGroupSchema>;
