import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false);

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
