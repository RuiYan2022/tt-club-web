import { supabaseServer } from '@/lib/supabaseServer';

export default async function PrivateBookingsPage() {
  const supabase =await  supabaseServer();
  const { data: bookings, error } = await supabase
    .from('private_bookings')
    .select('id, starts_at, ends_at, session_type, total_cost_cents, status')
    .order('starts_at', { ascending: true });

  if (error) return <main className="p-6">Error: {error.message}</main>;

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">My Private Bookings</h1>
      <div className="grid gap-3">
        {bookings?.map((b) => (
          <div key={b.id} className="border rounded-xl p-4">
            <div className="font-medium">
              {b.session_type} • {new Date(b.starts_at).toLocaleString()} → {new Date(b.ends_at).toLocaleTimeString()}
            </div>
            <div className="text-sm text-neutral-500">
              ${(b.total_cost_cents/100).toFixed(2)} • {b.status}
            </div>
          </div>
        )) ?? <div>No bookings yet.</div>}
      </div>
    </main>
  );
}
