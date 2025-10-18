import { cookies } from "next/headers";
import { createServerComponentClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// Server Components (files under /app without "use client")
export async function supabaseServer() {
  const cookieStore = await cookies(); // Next.js App Router: cookies() is async
  return createServerComponentClient({
    cookies: () => cookieStore,
  });
}

// Route Handlers (files under /app/api/<any>/route.ts)
export async function supabaseRoute() {
  const cookieStore = await cookies();
  return createRouteHandlerClient({
    cookies: () => cookieStore,
  });
}

// Optional canary export to confirm the module is compiled
export const __module_ok = true;
