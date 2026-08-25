"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SaveSettingsResult {
  ok: boolean;
  message: string;
}

export async function saveSystemPrompt(
  _prev: SaveSettingsResult,
  formData: FormData
): Promise<SaveSettingsResult> {
  const systemPrompt = String(formData.get("system_prompt") ?? "").trim();
  const calendlyLink = String(formData.get("calendly_link") ?? "").trim();

  if (!systemPrompt) {
    return { ok: false, message: "El system prompt no puede estar vacío." };
  }

  const supabase = await createServerSupabaseClient();

  const { error: e1 } = await supabase
    .from("settings")
    .upsert({ key: "system_prompt", value: systemPrompt });

  const { error: e2 } = await supabase
    .from("settings")
    .upsert({ key: "calendly_link", value: calendlyLink });

  if (e1 || e2) {
    return { ok: false, message: "No se pudo guardar. Probá de nuevo." };
  }

  revalidatePath("/settings");
  return { ok: true, message: "Cambios guardados." };
}
