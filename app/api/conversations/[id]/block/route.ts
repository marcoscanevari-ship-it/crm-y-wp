import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { blocked } = await request.json();

  if (typeof blocked !== "boolean") {
    return NextResponse.json({ error: "blocked debe ser boolean" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("contacts").update({ blocked }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
