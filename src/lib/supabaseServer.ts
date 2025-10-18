import { cookies } from "next/headers";
import {
  createServerComponentClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";

// Server Components (files under /app without "use client")
export function supabaseServer() {
  return createServerComponentClient({ cookies });
}

// Route Handlers (files under /app/api/[...]/route.ts)
export function supabaseRoute() {
  return createRouteHandlerClient({ cookies });
}

// Optional canary
export const __module_ok = true;
