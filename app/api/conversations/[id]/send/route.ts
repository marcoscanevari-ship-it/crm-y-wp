import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendWhatsAppText } from "@/lib/whatsapp";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content } = await request.json();

  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Contenido requerido" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { data: contact } = await supabase
    .from("contacts")
    .select("id, phone, blocked")
    .eq("id", id)
    .single();

  if (!contact) {
    return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
  }
  if (contact.blocked) {
    return NextResponse.json({ error: "Contacto bloqueado" }, { status: 409 });
  }

  const wamid = await sendWhatsAppText(contact.phone, content.trim());

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      contact_id: contact.id,
      role: "assistant",
      content: content.trim(),
      whatsapp_message_id: wamid,
      status: "sent",
    })
    .select()
    .single();

  if (error || !message) {
    return NextResponse.json({ error: "No se pudo guardar el mensaje" }, { status: 500 });
  }

  return NextResponse.json({ message });
}
