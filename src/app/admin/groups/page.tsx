import Link from "next/link";
import { supabaseService } from "@/lib/supabaseService";

export default async function AdminGroupsPage() {
  const sb = supabaseService();
  const { data, error } = await sb
    .from("group_lessons")
    .select("id, name, start_date, end_date, active, location, capacity")
    .order("start_date");
  if (error) return <main className="p-6 text-red-600">{error.message}</main>;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Admin · Groups</h1>
      <div className="grid gap-2">
        {data?.map((g) => (
          <div key={g.id} className="border rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{g.name}</div>
              <div className="text-sm text-neutral-500">{g.start_date} → {g.end_date} · {g.active ? "Active" : "Inactive"}</div>
            </div>
            <Link className="underline" href={`/admin/groups/${g.id}`}>Edit</Link>
          </div>
        )) ?? <div>No groups</div>}
      </div>
    </main>
  );
}
