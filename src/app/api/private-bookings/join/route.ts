import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseService";
import { JoinTwoOnOneSchema } from "@/lib/validation/privateBooking";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = JoinTwoOnOneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { bookingId, userId } = parsed.data;
  const sb = supabaseService();

  const { data: booking, error } = await sb
    .from("private_bookings")
    .select("id, session_type, rate_per_person_cents")
    .eq("id", bookingId)
    .single();
  if (error || !booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.session_type !== "2on1") return NextResponse.json({ error: "This booking is not 2-on-1" }, { status: 400 });

  const { data: existing, error: cntErr } = await sb
    .from("private_booking_members")
    .select("user_id", { count: "exact", head: false })
    .eq("booking_id", bookingId);
  if (cntErr) return NextResponse.json({ error: cntErr.message }, { status: 400 });
  if ((existing?.length ?? 0) >= 2) return NextResponse.json({ error: "This session is already full." }, { status: 409 });

  const { error: insErr } = await sb.from("private_booking_members").insert({
    booking_id: bookingId,
    user_id: userId,
    amount_due_cents: booking.rate_per_person_cents,
    payment_status: "pending",
  });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
