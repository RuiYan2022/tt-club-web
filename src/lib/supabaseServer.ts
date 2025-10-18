import { cookies } from "next/headers";
import {
  createServerComponentClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";

/** Server Components (App Router) */
export function supabaseServer() {
  return createServerComponentClient({ cookies });
}

/** Route Handlers (/app/api/**/route.ts) */
export function supabaseRoute() {
  return createRouteHandlerClient({ cookies });
}

// Optional canary
export const __module_ok = true;
