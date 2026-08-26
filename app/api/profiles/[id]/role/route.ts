import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, isAdmin } from "@/lib/profile";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getProfile();
  if (!isAdmin(profile)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const { role } = await request.json();

  if (role !== "admin" && role !== "operador") {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar el rol" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
