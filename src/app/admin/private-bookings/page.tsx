// src/app/admin/private-bookings/page.tsx
import { supabaseService } from "@/lib/supabaseService";

export default async function AdminBookings() {
  const sb = supabaseService(); // uses service role key (server only)
  const { data, error } = await sb
    .from("private_bookings")
    .select("id, starts_at, ends_at, session_type, total_cost_cents, status")
    .order("starts_at");

  if (error) return <pre className="p-4 text-red-600">{error.message}</pre>;
  return <pre className="p-4 bg-neutral-100 text-sm rounded">{JSON.stringify(data, null, 2)}</pre>;
}
