import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateReply, type ChatMessage } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const { history } = (await request.json()) as { history: ChatMessage[] };

  if (!Array.isArray(history)) {
    return NextResponse.json({ error: "history debe ser un array" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: settingRow } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "system_prompt")
    .single();

  const systemPrompt = settingRow?.value ?? "Sos Berta, asistente de la agencia.";

  try {
    const reply = await generateReply(history, systemPrompt);
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error generando respuesta" },
      { status: 500 }
    );
  }
}
