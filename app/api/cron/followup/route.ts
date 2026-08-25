import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isWithinFollowupWindowArgentina, hoursSince } from "@/lib/timezone";
import { generateFollowup, type ChatMessage } from "@/lib/ai";
import { sendWhatsAppText } from "@/lib/whatsapp";

const MIN_HOURS_SINCE_LAST_MESSAGE = 5;
const MAX_HOURS_SINCE_LAST_MESSAGE = 23;

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!isWithinFollowupWindowArgentina()) {
    return NextResponse.json({ ok: true, skipped: "fuera de ventana horaria" });
  }

  const supabase = createAdminClient();

  const [{ data: contacts }, { data: messages }, { data: systemPromptRow }] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, phone, bot_enabled, blocked")
      .eq("bot_enabled", true)
      .eq("blocked", false),
    supabase
      .from("messages")
      .select("contact_id, role, content, created_at")
      .order("created_at", { ascending: false })
      .limit(3000),
    supabase.from("settings").select("value").eq("key", "system_prompt").single(),
  ]);

  const systemPrompt = systemPromptRow?.value ?? "Sos Berta, asistente de la agencia.";

  type MessageRow = NonNullable<typeof messages>[number];
  const lastMessageByContact = new Map<string, MessageRow>();
  for (const m of messages ?? []) {
    if (!lastMessageByContact.has(m.contact_id)) {
      lastMessageByContact.set(m.contact_id, m);
    }
  }

  const now = new Date();
  const candidates = (contacts ?? []).filter((c) => {
    const last = lastMessageByContact.get(c.id);
    if (!last || last.role !== "assistant") return false;
    const hours = hoursSince(new Date(last.created_at), now);
    return hours >= MIN_HOURS_SINCE_LAST_MESSAGE && hours <= MAX_HOURS_SINCE_LAST_MESSAGE;
  });

  let sent = 0;
  for (const contact of candidates) {
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: true })
      .limit(20);

    const chatHistory: ChatMessage[] = (history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    try {
      const followup = await generateFollowup(chatHistory, systemPrompt);
      const wamid = await sendWhatsAppText(contact.phone, followup);

      await supabase.from("messages").insert({
        contact_id: contact.id,
        role: "assistant",
        content: followup,
        whatsapp_message_id: wamid,
        status: "sent",
      });
      sent += 1;
    } catch (err) {
      console.error(`Error enviando follow-up a ${contact.phone}:`, err);
    }
  }

  return NextResponse.json({ ok: true, candidates: candidates.length, sent });
}
