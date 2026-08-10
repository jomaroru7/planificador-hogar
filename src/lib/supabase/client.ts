import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Surfaced early so a missing .env.local doesn't fail silently at query time.
  console.warn(
    "Faltan las variables NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Copia .env.example a .env.local y rellena tus credenciales de Supabase.",
  );
}

export const supabase = createClient<Database>(
  // Fall back to a placeholder so `createClient` doesn't throw during the
  // static export build when env vars aren't configured yet; real requests
  // will simply fail until `.env.local` is filled in.
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
