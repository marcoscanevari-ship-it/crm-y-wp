"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  ok: boolean;
  message: string;
}

export async function updatePersonalDataAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, message: "Tu sesión expiró." };
  }

  const ageRaw = String(formData.get("age") ?? "").trim();

  const update = {
    phone: nullableString(formData.get("phone")),
    dni: nullableString(formData.get("dni")),
    address: nullableString(formData.get("address")),
    hobbies: nullableString(formData.get("hobbies")),
    age: ageRaw ? Number(ageRaw) : null,
  };

  const { error } = await supabase.from("profiles").update(update).eq("id", userData.user.id);
  if (error) {
    return { ok: false, message: "No se pudieron guardar los datos." };
  }

  revalidatePath("/profile");
  return { ok: true, message: "Datos guardados." };
}

export async function updatePreferencesAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, message: "Tu sesión expiró." };
  }

  const theme = String(formData.get("theme") ?? "light");
  const language = String(formData.get("language") ?? "es");

  if (!["light", "dark"].includes(theme) || !["es", "en"].includes(language)) {
    return { ok: false, message: "Preferencias inválidas." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ theme, language })
    .eq("id", userData.user.id);

  if (error) {
    return { ok: false, message: "No se pudieron guardar las preferencias." };
  }

  const cookieStore = await cookies();
  cookieStore.set("theme", theme, { path: "/", maxAge: 60 * 60 * 24 * 365 });

  revalidatePath("/", "layout");
  return { ok: true, message: "Preferencias guardadas." };
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { ok: false, message: "La contraseña tiene que tener al menos 8 caracteres." };
  }
  if (password !== confirm) {
    return { ok: false, message: "Las contraseñas no coinciden." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, message: "No se pudo cambiar la contraseña." };
  }

  return { ok: true, message: "Contraseña actualizada." };
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Elegí una imagen." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "El archivo tiene que ser una imagen." };
  }

  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { ok: false, message: "Tu sesión expiró." };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userData.user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { ok: false, message: "No se pudo subir la imagen." };
  }

  const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = `${publicUrl.publicUrl}?t=${Date.now()}`;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userData.user.id);

  if (profileError) {
    return { ok: false, message: "No se pudo guardar la imagen." };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Foto de perfil actualizada." };
}

function nullableString(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  return str ? str : null;
}
