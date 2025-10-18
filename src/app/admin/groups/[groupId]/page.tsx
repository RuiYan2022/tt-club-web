export const dynamic = "force-dynamic";
export const revalidate = 0;


import { supabaseService } from "@/lib/supabaseService";
import Editor from "./ui/Editor";

export default async function EditGroupPage({ params }: { params: { groupId: string } }) {
  const sb = supabaseService();
  const { data: group, error: gErr } = await sb
    .from("group_lessons")
    .select("id, name, description, start_date, end_date, location, capacity, rate_per_session_cents, active")
    .eq("id", params.groupId)
    .single();
  if (gErr || !group) return <main className="p-6 text-red-600">{gErr?.message || "Not found"}</main>;

  const { data: schedule, error: sErr } = await sb
    .from("group_lesson_schedule")
    .select("id, day_of_week, start_time, end_time, location")
    .eq("group_id", params.groupId)
    .order("day_of_week");
  if (sErr) return <main className="p-6 text-red-600">{sErr.message}</main>;

  return (
    <main className="p-6">
      <Editor groupId={params.groupId} group={group} schedule={schedule || []} />
    </main>
  );
}
