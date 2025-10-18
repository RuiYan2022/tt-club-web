import { supabaseServer } from "@/lib/supabaseServer";

export default async function WhoAmI() {
  const supabase = await supabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-3">Who am I?</h1>
      {error && <p className="text-red-600 text-sm">{error.message}</p>}
      <pre className="bg-neutral-100 p-3 rounded text-sm">
        {JSON.stringify(
          { userId: user?.id ?? null, email: user?.email ?? null },
          null,
          2
        )}
      </pre>
    </main>
  );
}
