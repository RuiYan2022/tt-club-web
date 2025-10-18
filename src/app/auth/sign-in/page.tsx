"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    router.push("/"); // back home (or /private-bookings)
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="email"
          className="border rounded p-2 w-full"
          value={email} onChange={e=>setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          className="border rounded p-2 w-full"
          value={password} onChange={e=>setPassword(e.target.value)}
        />
        <button disabled={loading} className="px-3 py-2 rounded bg-black text-white w-full">
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
      <p className="text-sm text-neutral-600 mt-4">
        Don’t have an account? Create one in Supabase Auth → Users, then set a password.
      </p>
    </main>
  );
}
