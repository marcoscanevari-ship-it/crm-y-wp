import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { bot_enabled } = await request.json();

  if (typeof bot_enabled !== "boolean") {
    return NextResponse.json({ error: "bot_enabled debe ser boolean" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("contacts").update({ bot_enabled }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
