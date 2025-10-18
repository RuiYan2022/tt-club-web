import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseService";
import { GenerateSessionsSchema } from "../../../../lib/validation/groups";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = GenerateSessionsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { groupId, windowStart, windowEnd, replaceExisting } = parsed.data;

  const start = windowStart ? new Date(windowStart) : new Date();
  const end = windowEnd ? new Date(windowEnd) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 * 8);

  if (end <= start) return NextResponse.json({ error: "windowEnd must be after windowStart" }, { status: 400 });

  const sb = supabaseService();

  const groupsQ = sb.from("group_lessons").select("id, name, start_date, end_date, active");
  const { data: groups, error: gErr } = groupId ? await groupsQ.eq("id", groupId) : await groupsQ.eq("active", true);
  if (gErr) return NextResponse.json({ error: gErr.message }, { status: 400 });
  if (!groups || groups.length === 0) return NextResponse.json({ ok: true, created: 0, info: "No groups found" });

  const groupIds = groups.map(g => g.id);
  const { data: schedules, error: sErr } = await sb
    .from("group_lesson_schedule")
    .select("group_id, day_of_week, start_time, end_time, location")
    .in("group_id", groupIds);
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 400 });

  const perGroup: Record<string, any[]> = {};
  for (const s of schedules || []) {
    perGroup[s.group_id] ||= [];
    perGroup[s.group_id].push(s);
  }

  if (replaceExisting) {
    const { error: delErr } = await sb.rpc("delete_safe_group_sessions", {
      p_group_ids: groupIds,
      p_from: start.toISOString(),
      p_to: end.toISOString(),
    });
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });
  }

  let created = 0;
  for (const g of groups) {
    const gStart = new Date(Math.max(new Date(g.start_date).getTime(), start.getTime()));
    const gEnd = new Date(Math.min(new Date(g.end_date).getTime(), end.getTime()));
    const sched = perGroup[g.id] || [];
    if (sched.length === 0) continue;

    const rows: any[] = [];
    for (let d = new Date(Date.UTC(gStart.getUTCFullYear(), gStart.getUTCMonth(), gStart.getUTCDate())); d <= gEnd; d.setUTCDate(d.getUTCDate() + 1)) {
      const dow = d.getUTCDay();
      for (const s of sched) {
        if (s.day_of_week === dow) {
          const [sh, sm] = String(s.start_time).split(":").map((x: string) => parseInt(x, 10));
          const [eh, em] = String(s.end_time).split(":").map((x: string) => parseInt(x, 10));
          const starts = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), sh, sm || 0));
          const ends = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), eh, em || 0));
          if (ends > starts) rows.push({ group_id: g.id, starts_at: starts.toISOString(), ends_at: ends.toISOString() });
        }
      }
    }

    const chunkSize = 200;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error: insErr, count } = await sb
        .from("group_sessions")
        .insert(chunk, { count: "exact", returning: "minimal", upsert: false });
      if (insErr) {
        const msg = (insErr.message || "").toLowerCase();
        if (!msg.includes("duplicate key value")) return NextResponse.json({ error: insErr.message }, { status: 400 });
      } else {
        created += count || 0;
      }
    }
  }

  return NextResponse.json({ ok: true, created, windowStart: start.toISOString(), windowEnd: end.toISOString() });
}
