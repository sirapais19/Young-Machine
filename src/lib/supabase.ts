import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseEnv && import.meta.env.DEV) {
  console.warn("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Falling back to local demo data.");
}

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://missing-supabase-url.supabase.co", "missing-anon-key");
