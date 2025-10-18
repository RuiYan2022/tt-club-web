import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseService";
import { SyncGroupSchema } from "@/lib/validation/groups";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = SyncGroupSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { groupId, changeFrom, changeTo } = parsed.data;

  const sb = supabaseService();
  const { error: delErr } = await sb.rpc("delete_safe_group_sessions", {
    p_group_ids: [groupId],
    p_from: changeFrom,
    p_to: changeTo,
  });
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });

  // Re-generate for this window & group by calling the same API locally
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(new URL("/api/groups/generate-sessions", base), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ groupId, windowStart: changeFrom, windowEnd: changeTo, replaceExisting: false }),
  });
  const json = await res.json();
  if (!res.ok) return NextResponse.json(json, { status: res.status });

  return NextResponse.json({ ok: true, ...json });
}
