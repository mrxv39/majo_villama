import { createClient } from "@supabase/supabase-js";

// Cliente server-side (bypasses RLS — NUNCA exponer al browser)
// Solo se usa en API routes, se evalúa en runtime (no en build)
export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
