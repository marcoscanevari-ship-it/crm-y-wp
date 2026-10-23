import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const STAGES = ["hot", "warm", "cold", "none"] as const;

function clean(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const name = clean(body.name);
  const lastName = clean(body.last_name);
  const email = clean(body.email);
  const phone = (clean(body.phone) ?? "").replace(/\D/g, "");
  const stage = STAGES.includes(body.stage) ? (body.stage as (typeof STAGES)[number]) : "none";

  if (!name) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  if (phone.length < 8 || phone.length > 15) {
    return NextResponse.json({ error: "Celular inválido (solo dígitos, con código de país)" }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const { data: contact, error } = await supabase
    .from("contacts")
    .insert({
      phone,
      name,
      last_name: lastName,
      email,
      company: clean(body.company),
      notes: clean(body.notes),
      ad_source: "Carga manual",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ya existe un cliente con ese celular" }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo crear el cliente" }, { status: 500 });
  }

  if (stage !== "none") {
    await supabase.from("leads").insert({
      contact_id: contact.id,
      score: stage,
      reason: `Cargado manualmente por ${userData.user.email}`,
      topic: null,
      notified: true,
    });
  }

  return NextResponse.json({ contact }, { status: 201 });
}
