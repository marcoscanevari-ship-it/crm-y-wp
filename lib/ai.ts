const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-5-nano";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Falta OPENROUTER_API_KEY en las variables de entorno");
  }

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      reasoning: { effort: "low" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error de OpenRouter: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Respuesta inesperada de OpenRouter");
  }
  return content.trim();
}

/**
 * Genera la respuesta de Zokky dado el historial de la conversación y el system prompt vigente.
 */
export async function generateReply(
  history: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  return chatCompletion([{ role: "system", content: systemPrompt }, ...history]);
}

/**
 * Genera un mensaje de follow-up contextual para conversaciones sin respuesta.
 */
export async function generateFollowup(
  history: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const followupInstruction: ChatMessage = {
    role: "system",
    content:
      "El usuario no respondió tu último mensaje hace varias horas. Generá un único mensaje corto de " +
      "seguimiento, natural y no invasivo, retomando el hilo de la conversación. No te disculpes por escribir de nuevo.",
  };
  return chatCompletion([
    { role: "system", content: systemPrompt },
    ...history,
    followupInstruction,
  ]);
}
