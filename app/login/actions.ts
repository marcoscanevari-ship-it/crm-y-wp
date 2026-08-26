"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/auth";
import { headers, cookies } from "next/headers";

export interface RequestMagicLinkResult {
  ok: boolean;
  message: string;
}

export interface SignInWithPasswordResult {
  ok: boolean;
  message: string;
  mfaPending: boolean;
}

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
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, message: "No se pudo enviar el link. Probá de nuevo." };
  }

  return { ok: true, message: "Te enviamos un link mágico a tu email." };
}

/**
 * Primer factor (password) + disparo del segundo factor (link mágico al mail).
 * No persiste la sesión creada por signInWithPassword: se cierra inmediatamente
 * para que la sesión real solo quede establecida al click del link (callback).
 */
export async function signInWithPasswordAction(formData: FormData): Promise<SignInWithPasswordResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Ingresá email y contraseña.", mfaPending: false };
  }

  if (!isEmailAllowed(email)) {
    return { ok: false, message: "Ese dominio de email no tiene acceso al panel.", mfaPending: false };
  }

  const supabase = await createServerSupabaseClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    return { ok: false, message: "Email o contraseña incorrectos.", mfaPending: false };
  }

  // No dejamos esa sesión persistida: el password es solo el primer factor.
  await supabase.auth.signOut();

  const headersList = await headers();
  const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (otpError) {
    return { ok: false, message: "No se pudo enviar el link de confirmación. Probá de nuevo.", mfaPending: false };
  }

  const cookieStore = await cookies();
  cookieStore.set("mfa_pending_email", email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });

  return { ok: true, message: "Revisá tu email para completar el ingreso.", mfaPending: true };
}
