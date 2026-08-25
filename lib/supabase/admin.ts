import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con service_role key. Sin sesión de usuario, bypassa RLS.
 * Uso exclusivo en server: webhook de WhatsApp y crons.
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
