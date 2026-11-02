import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  "https://uxmgrquqeigmosgdrjti.supabase.co";

const supabaseAnonKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bWdycXVxZWlnbW9zZ2RyanRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MzA2NTEsImV4cCI6MjEwOTAwNjY1MX0._kJK5eLdHeMVilqTCmzgIZdiXTBHfwW_Qg2gVimWv9s";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
