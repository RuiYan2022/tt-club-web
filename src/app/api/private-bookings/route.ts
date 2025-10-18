import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseService";
import { CreatePrivateBookingSchema } from "@/lib/validation/privateBooking";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = CreatePrivateBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;
  const sb = supabaseService();

  // 1) Fetch coach rates
  const { data: coach, error: coachErr } = await sb
    .from("coaches")
    .select("rate_1on1_cents, rate_2on1_per_person_cents")
    .eq("id", input.coachId)
    .single();
  if (coachErr || !coach) {
    return NextResponse.json({ error: "Coach not found" }, { status: 404 });
  }

  const perPerson = input.sessionType === "1on1"
    ? coach.rate_1on1_cents
    : coach.rate_2on1_per_person_cents;

  const total = perPerson * input.memberIds.length;

  // 2) Insert booking
  const { data: booking, error: bookingErr } = await sb
    .from("private_bookings")
    .insert([{
      coach_id: input.coachId,
      table_id: input.tableId,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      session_type: input.sessionType,
      rate_per_person_cents: perPerson,
      total_cost_cents: total,
      status: "pending",
    }])
    .select()
    .single();

  if (bookingErr) {
    const msg = (bookingErr.message || "").toLowerCase();
    if (msg.includes("no_overlap_coach")) {
      return NextResponse.json({ error: "Coach is already booked in this time range." }, { status: 409 });
    }
    if (msg.includes("no_overlap_table")) {
      return NextResponse.json({ error: "Table is already booked in this time range." }, { status: 409 });
    }
    return NextResponse.json({ error: bookingErr.message }, { status: 400 });
  }

  // 3) Attach members
  const memberRows = input.memberIds.map((uid) => ({
    booking_id: booking.id,
    user_id: uid,
    amount_due_cents: perPerson,
    payment_status: "pending",
  }));
  const { error: membersErr } = await sb.from("private_booking_members").insert(memberRows);
  if (membersErr) {
    await sb.from("private_bookings").delete().eq("id", booking.id);
    return NextResponse.json({ error: membersErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, bookingId: booking.id, perPerson, total });
}
