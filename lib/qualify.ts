import type { ChatMessage } from "./ai";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-5-nano";

export interface LeadQualification {
  score: "hot" | "warm" | "cold";
  reason: string;
  topic: string;
}

const QUALIFY_SYSTEM_PROMPT = `Sos un clasificador de leads para una agencia. Analizá la conversación de WhatsApp y clasificá al contacto:
- HOT: interés real en contratar, preguntó por precios o quiso agendar una reunión.
- WARM: mostró interés pero no llegó a querer agendar ni pidió precio.
- COLD: sin interés real, spam, busca empleo, o solo curiosidad.

Respondé ÚNICAMENTE con un JSON válido, sin texto adicional, con este formato exacto:
{"score": "hot" | "warm" | "cold", "reason": "explicación breve en español", "topic": "tema principal de la conversación en 2-3 palabras"}`;

/**
 * Clasifica una conversación en hot/warm/cold usando GPT-5 Nano vía OpenRouter.
 */
export async function classifyLead(history: ChatMessage[]): Promise<LeadQualification> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Falta OPENROUTER_API_KEY en las variables de entorno");
  }

  const transcript = history
    .map((m) => `${m.role === "user" ? "Usuario" : "Zokky"}: ${m.content}`)
    .join("\n");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      reasoning: { effort: "low" },
      messages: [
        { role: "system", content: QUALIFY_SYSTEM_PROMPT },
        { role: "user", content: transcript },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error de OpenRouter al calificar lead: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No se pudo parsear la calificación del lead");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  if (!["hot", "warm", "cold"].includes(parsed.score)) {
    throw new Error("Score de lead inválido");
  }

  return {
    score: parsed.score,
    reason: String(parsed.reason ?? "Sin razón especificada"),
    topic: String(parsed.topic ?? "General"),
  };
}
