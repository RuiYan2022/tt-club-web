import { z } from "zod";

export const CreatePrivateBookingSchema = z.object({
  coachId: z.string().uuid(),
  tableId: z.number().int().positive(),
  startsAt: z.string().datetime(),  // ISO
  endsAt: z.string().datetime(),
  sessionType: z.enum(["1on1","2on1"]),
  memberIds: z.array(z.string().uuid()).min(1).max(2),
});

export type CreatePrivateBookingInput = z.infer<typeof CreatePrivateBookingSchema>;

export const JoinTwoOnOneSchema = z.object({
  bookingId: z.string().uuid(),
  userId: z.string().uuid(),
});
export type JoinTwoOnOneInput = z.infer<typeof JoinTwoOnOneSchema>;
