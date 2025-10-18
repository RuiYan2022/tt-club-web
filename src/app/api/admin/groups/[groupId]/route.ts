import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseService";
import { UpdateGroupSchema } from "@/lib/validation/adminGroups";

// GET /api/admin/groups/:groupId
export async function GET(_req: Request, ctx: any) {
  // context.params could be a plain object or a Promise
  const params = ctx?.params && typeof ctx.params.then === "function" ? await ctx.params : ctx.params;
  const groupId: string = params.groupId;

  const sb = supabaseService();
  const { data: group, error: gErr } = await sb
    .from("group_lessons")
    .select("id, name, description, start_date, end_date, location, capacity, rate_per_session_cents, active")
    .eq("id", groupId)
    .single();
  if (gErr || !group) return NextResponse.json({ error: gErr?.message || "Not found" }, { status: 404 });

  const { data: schedule, error: sErr } = await sb
    .from("group_lesson_schedule")
    .select("id, day_of_week, start_time, end_time, location")
    .eq("group_id", groupId)
    .order("day_of_week");
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 400 });

  return NextResponse.json({ group, schedule: schedule ?? [] });
}

// PUT /api/admin/groups/:groupId
export async function PUT(req: Request, ctx: any) {
  const params = ctx?.params && typeof ctx.params.then === "function" ? await ctx.params : ctx.params;
  const groupId: string = params.groupId;

  const body = await req.json().catch(() => ({}));
  const parsed = UpdateGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;
  const sb = supabaseService();

  // 1) Update group core fields
  const { error: uErr } = await sb
    .from("group_lessons")
    .update({
      name: input.name,
      description: input.description ?? null,
      start_date: input.start_date,
      end_date: input.end_date,
      location: input.location ?? null,
      capacity: input.capacity ?? null,
      rate_per_session_cents: input.rate_per_session_cents ?? null,
      active: input.active,
    })
    .eq("id", groupId);
  if (uErr) return NextResponse.json({ error: uErr.message }, { status: 400 });

  // 2) Replace schedule
  const { error: delErr } = await sb.from("group_lesson_schedule").delete().eq("group_id", groupId);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });

  const scheduleRows = input.schedule.map((s) => ({
    group_id: groupId,
    day_of_week: s.day_of_week,
    start_time: s.start_time,
    end_time: s.end_time,
    location: s.location ?? null,
  }));
  if (scheduleRows.length > 0) {
    const { error: insErr } = await sb.from("group_lesson_schedule").insert(scheduleRows);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });
  }

  // 3) Optional: Save & Sync
  if (input.changeFrom && input.changeTo) {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(new URL("/api/groups/sync", base), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId,
        changeFrom: input.changeFrom,
        changeTo: input.changeTo,
      }),
    });
    const json = await res.json();
    if (!res.ok) return NextResponse.json({ updated: true, sync: json }, { status: 207 });
    return NextResponse.json({ updated: true, sync: json });
  }

  return NextResponse.json({ updated: true });
}
