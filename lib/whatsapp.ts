import { toWhatsAppSendFormat } from "@/lib/phone";

const GRAPH_API_VERSION = "v21.0";

function apiUrl(path: string) {
  return `https://graph.facebook.com/${GRAPH_API_VERSION}/${path}`;
}

/**
 * Envía un mensaje de texto vía WhatsApp Business API.
 * Devuelve el wamid (whatsapp_message_id) del mensaje enviado.
 */
export async function sendWhatsAppText(to: string, body: string): Promise<string | null> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !token) {
    throw new Error("Faltan WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN");
  }

  const res = await fetch(apiUrl(`${phoneNumberId}/messages`), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toWhatsAppSendFormat(to),
      type: "text",
      text: { body, preview_url: false },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error enviando mensaje de WhatsApp: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data?.messages?.[0]?.id ?? null;
}

export async function markWhatsAppMessageAsRead(messageId: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !token) return;

  await fetch(apiUrl(`${phoneNumberId}/messages`), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  });
}

// --- Tipos del payload entrante de Meta ---

export interface WhatsAppIncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  referral?: {
    source_url?: string;
    source_type?: string;
    ctwa_clid?: string;
  };
}

export interface WhatsAppStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
}

export interface WhatsAppContact {
  profile: { name?: string };
  wa_id: string;
}

export interface WhatsAppWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsAppIncomingMessage[];
        statuses?: WhatsAppStatus[];
        contacts?: WhatsAppContact[];
      };
    }>;
  }>;
}
