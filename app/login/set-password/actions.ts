"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface SetPasswordResult {
  ok: boolean;
  message: string;
}

export async function setPasswordAction(
  _prev: SetPasswordResult,
  formData: FormData
): Promise<SetPasswordResult> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { ok: false, message: "La contraseña tiene que tener al menos 8 caracteres." };
  }

  if (password !== confirm) {
    return { ok: false, message: "Las contraseñas no coinciden." };
  }

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { ok: false, message: "Tu sesión expiró. Volvé a pedir el link de ingreso." };
  }

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    return { ok: false, message: "No se pudo guardar la contraseña. Probá de nuevo." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ password_set: true })
    .eq("id", userData.user.id);

  if (profileError) {
    return { ok: false, message: "No se pudo guardar la contraseña. Probá de nuevo." };
  }

  redirect("/dashboard");
}
