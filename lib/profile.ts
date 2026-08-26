import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  email: string;
  role: "admin" | "operador";
  phone: string | null;
  dni: string | null;
  address: string | null;
  age: number | null;
  hobbies: string | null;
  avatar_url: string | null;
  theme: "light" | "dark";
  language: "es" | "en";
  password_set: boolean;
}

/**
 * Trae el perfil (rol, preferencias, datos personales) del usuario logueado.
 * Devuelve null si no hay sesión o si el perfil todavía no fue provisionado
 * (se crea automáticamente en /api/auth/callback en el primer login).
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, role, phone, dni, address, age, hobbies, avatar_url, theme, language, password_set")
    .eq("id", userData.user.id)
    .maybeSingle();

  return (data as Profile) ?? null;
}

export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === "admin";
}
