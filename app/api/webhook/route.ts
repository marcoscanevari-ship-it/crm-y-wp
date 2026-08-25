import { NextResponse, type NextRequest } from "next/server";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendWhatsAppText,
  type WhatsAppWebhookPayload,
} from "@/lib/whatsapp";
import { generateReply, type ChatMessage } from "@/lib/ai";
import { classifyLead } from "@/lib/qualify";
import { sendHotLeadAlert } from "@/lib/email";

const QUALIFY_AFTER_USER_MESSAGES = 3;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const payload: WhatsAppWebhookPayload = await request.json();
  const supabase = createAdminClient();

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value) continue;

      if (value.statuses?.length) {
        await Promise.all(
          value.statuses.map((status) =>
            supabase
              .from("messages")
              .update({ status: status.status })
              .eq("whatsapp_message_id", status.id)
          )
        );
      }

      if (value.messages?.length) {
        for (const message of value.messages) {
          if (message.type !== "text" || !message.text) continue;

          const contactName = value.contacts?.find((c) => c.wa_id === message.from)?.profile
            ?.name;

          const contact = await upsertContact(supabase, {
            phone: message.from,
            name: contactName,
            adSource: message.referral?.source_type ?? message.referral?.source_url,
            ctwaClid: message.referral?.ctwa_clid,
          });

          await supabase.from("messages").insert({
            contact_id: contact.id,
            role: "user",
            content: message.text.body,
          });

          if (contact.blocked || !contact.bot_enabled) {
            continue;
          }

          const { data: history } = await supabase
            .from("messages")
            .select("role, content")
            .eq("contact_id", contact.id)
            .order("created_at", { ascending: false })
            .limit(20);

          const chatHistory: ChatMessage[] = (history ?? [])
            .reverse()
            .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

          const { data: settingRow } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "system_prompt")
            .single();

          const systemPrompt = settingRow?.value ?? "Sos Berta, asistente de la agencia.";

          const reply = await generateReply(chatHistory, systemPrompt);
          const wamid = await sendWhatsAppText(contact.phone, reply);

          await supabase.from("messages").insert({
            contact_id: contact.id,
            role: "assistant",
            content: reply,
            whatsapp_message_id: wamid,
            status: "sent",
          });

          const userMessageCount = chatHistory.filter((m) => m.role === "user").length;
          if (userMessageCount >= QUALIFY_AFTER_USER_MESSAGES) {
            after(() => qualifyInBackground(contact.id, contact.name, contact.phone));
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}

async function upsertContact(
  supabase: ReturnType<typeof createAdminClient>,
  params: { phone: string; name?: string; adSource?: string; ctwaClid?: string }
) {
  const { data: existing } = await supabase
    .from("contacts")
    .select("*")
    .eq("phone", params.phone)
    .maybeSingle();

  if (existing) {
    if (!existing.name && params.name) {
      const { data: updated } = await supabase
        .from("contacts")
        .update({ name: params.name })
        .eq("id", existing.id)
        .select()
        .single();
      return updated ?? existing;
    }
    return existing;
  }

  const { data: created, error } = await supabase
    .from("contacts")
    .insert({
      phone: params.phone,
      name: params.name ?? null,
      ad_source: params.adSource ?? null,
      ctwa_clid: params.ctwaClid ?? null,
    })
    .select()
    .single();

  if (error || !created) {
    throw new Error(`No se pudo crear el contacto: ${error?.message}`);
  }

  return created;
}

async function qualifyInBackground(
  contactId: string,
  contactName: string | null,
  phone: string
) {
  const supabase = createAdminClient();

  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: true })
    .limit(20);

  const chatHistory: ChatMessage[] = (history ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  try {
    const qualification = await classifyLead(chatHistory);

    const { data: lead } = await supabase
      .from("leads")
      .insert({
        contact_id: contactId,
        score: qualification.score,
        reason: qualification.reason,
        topic: qualification.topic,
      })
      .select()
      .single();

    if (qualification.score === "hot" && lead) {
      await sendHotLeadAlert({ contactName, phone, reason: qualification.reason });
      await supabase.from("leads").update({ notified: true }).eq("id", lead.id);
    }
  } catch (err) {
    console.error("Error calificando lead en background:", err);
  }
}
