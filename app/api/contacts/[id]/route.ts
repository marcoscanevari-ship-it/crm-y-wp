import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const update: Record<string, string | null> = {};
  for (const field of ["name", "email", "company"] as const) {
    if (field in body) {
      update[field] = typeof body[field] === "string" && body[field].trim() ? body[field].trim() : null;
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contacts")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar el contacto" }, { status: 500 });
  }

  return NextResponse.json({ contact: data });
}
