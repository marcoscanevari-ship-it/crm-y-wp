import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const update: Record<string, string | null> = {};
  for (const field of ["name", "last_name", "email", "company", "notes"] as const) {
    if (field in body) {
      update[field] = typeof body[field] === "string" && body[field].trim() ? body[field].trim() : null;
    }
  }

  const stage = ["hot", "warm", "cold"].includes(body.stage) ? (body.stage as string) : null;

  if (Object.keys(update).length === 0 && !stage) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  if (stage) {
    const { data: userData } = await supabase.auth.getUser();
    const { data: latest } = await supabase
      .from("leads")
      .select("score")
      .eq("contact_id", id)
      .order("qualified_at", { ascending: false })
      .limit(1);
    if (latest?.[0]?.score !== stage) {
      await supabase.from("leads").insert({
        contact_id: id,
        score: stage,
        reason: `Etapa cambiada manualmente por ${userData.user?.email ?? "un usuario"}`,
        notified: true,
      });
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true });
  }

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
