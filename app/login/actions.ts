"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export interface RequestMagicLinkResult {
  ok: boolean;
  message: string;
}

export interface SignInWithPasswordResult {
  ok: boolean;
  message: string;
}

/**
 * Login normal: email + contraseña, sin segundo factor por mail.
 */
export async function signInWithPasswordAction(formData: FormData): Promise<SignInWithPasswordResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Ingresá email y contraseña." };
  }

  if (!isEmailAllowed(email)) {
    return { ok: false, message: "Ese dominio de email no tiene acceso al panel." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: "Email o contraseña incorrectos." };
  }

  redirect("/dashboard");
}

/**
 * "Olvidé mi contraseña": único caso en el que el panel envía un mail para
 * el login. Manda un link que lleva a /login/set-password para definir una
 * contraseña nueva.
 */
export async function requestMagicLink(formData: FormData): Promise<RequestMagicLinkResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { ok: false, message: "Ingresá un email." };
  }

  if (!isEmailAllowed(email)) {
    return { ok: false, message: "Ese dominio de email no tiene acceso al panel." };
  }

  const headersList = await headers();
  const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback?reset=1`,
    },
  });

  if (error) {
    return { ok: false, message: "No se pudo enviar el link. Probá de nuevo." };
  }

  return { ok: true, message: "Te enviamos un link a tu email para definir una nueva contraseña." };
}
