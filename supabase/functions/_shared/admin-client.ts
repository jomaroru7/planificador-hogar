import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Service-role client for Edge Functions. `SUPABASE_URL` and
 * `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by Supabase for
 * every Edge Function — no need to set them as custom secrets.
 */
export function createAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Faltan las variables SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceKey);
}
