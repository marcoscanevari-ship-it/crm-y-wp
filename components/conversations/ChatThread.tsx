"use client";

import { useState, useTransition } from "react";
import { Ban, Bot, Send } from "lucide-react";

export interface ThreadMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  status: string | null;
}

export function ChatThread({
  contactId,
  initialMessages,
  initialBotEnabled,
  initialBlocked,
}: {
  contactId: string;
  initialMessages: ThreadMessage[];
  initialBotEnabled: boolean;
  initialBlocked: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [botEnabled, setBotEnabled] = useState(initialBotEnabled);
  const [blocked, setBlocked] = useState(initialBlocked);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!draft.trim()) return;
    const content = draft.trim();
    setDraft("");
    setError(null);

    startTransition(async () => {
      const res = await fetch(`/api/conversations/${contactId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        setError("No se pudo enviar el mensaje.");
        return;
      }

      const { message } = await res.json();
      setMessages((prev) => [...prev, message]);
    });
  }

  async function handleToggleBot() {
    const next = !botEnabled;
    setBotEnabled(next);
    await fetch(`/api/conversations/${contactId}/toggle-bot`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bot_enabled: next }),
    });
  }

  async function handleBlock() {
    const next = !blocked;
    if (next && !confirm("¿Bloquear este contacto? Zokky dejará de responderle.")) return;
    setBlocked(next);
    await fetch(`/api/conversations/${contactId}/block`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: next }),
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm flex flex-col h-[calc(100vh-11rem)]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleBot}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition ${
              botEnabled ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
            }`}
          >
            <Bot size={13} />
            Bot {botEnabled ? "ON" : "OFF"}
          </button>
        </div>
        <button
          onClick={handleBlock}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition ${
            blocked ? "bg-red-600 text-white" : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}
        >
          <Ban size={13} />
          {blocked ? "Bloqueado" : "Bloquear"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-10">Sin mensajes todavía.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "assistant" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                m.role === "assistant"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              <p>{m.content}</p>
              <p
                className={`text-[10px] mt-1 ${
                  m.role === "assistant" ? "text-indigo-100" : "text-gray-400"
                }`}
              >
                {new Date(m.created_at).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-gray-100">
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            disabled={blocked}
            placeholder={blocked ? "Contacto bloqueado" : "Escribir un mensaje manual..."}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50"
          />
          <button
            onClick={handleSend}
            disabled={isPending || blocked || !draft.trim()}
            className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
