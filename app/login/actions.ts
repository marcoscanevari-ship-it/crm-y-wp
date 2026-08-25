"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/auth";
import { headers } from "next/headers";

export interface RequestMagicLinkResult {
  ok: boolean;
  message: string;
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
