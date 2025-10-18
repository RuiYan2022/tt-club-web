import { supabaseServer } from "@/lib/supabaseServer";

export default async function GroupLessonsPage() {
  const supabase = await supabaseServer(); // 👈 await
  const { data: lessons, error } = await supabase
    .from("group_lessons")
    .select("id, name, start_date, end_date, capacity, active")
    .order("start_date");

  if (error) return <main className="p-6">Error: {error.message}</main>;

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Group Lessons</h1>
      <div className="grid gap-3">
        {lessons?.map((g) => (
          <div key={g.id} className="border rounded-xl p-4">
            <div className="font-medium">{g.name}</div>
            <div className="text-sm text-neutral-500">
              {g.start_date} → {g.end_date} • capacity {g.capacity ?? "—"} • {g.active ? "Active" : "Inactive"}
            </div>
          </div>
        )) ?? <div>No groups yet.</div>}
      </div>
    </main>
  );
}
