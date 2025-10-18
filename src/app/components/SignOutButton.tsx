"use client";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.refresh();
  }
  return (
    <button onClick={signOut} className="text-sm underline">Sign out</button>
  );
}
