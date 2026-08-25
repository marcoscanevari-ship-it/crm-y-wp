"use client";

import { useState, useTransition } from "react";
import { Send, RotateCcw } from "lucide-react";

interface TestMessage {
  role: "user" | "assistant";
  content: string;
}

export function TestChat() {
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    if (!draft.trim()) return;
    const next: TestMessage[] = [...messages, { role: "user", content: draft.trim() }];
    setMessages(next);
    setDraft("");
    setError(null);

    startTransition(async () => {
      const res = await fetch("/api/test-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: next }),
      });

      if (!res.ok) {
        setError("Error generando la respuesta. Revisá OPENROUTER_API_KEY.");
        return;
      }

      const { reply } = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm flex flex-col h-[calc(100vh-11rem)]">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <p className="text-sm text-gray-500">
          Chat de prueba — no se envía por WhatsApp ni se guarda en la base.
        </p>
        <button
          onClick={() => setMessages([])}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          <RotateCcw size={13} />
          Reiniciar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-10">
            Escribí un mensaje para probar cómo responde Berta.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "assistant" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                m.role === "assistant"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-end">
            <div className="bg-indigo-100 text-indigo-400 rounded-2xl rounded-br-sm px-4 py-2 text-sm">
              Berta está escribiendo...
            </div>
          </div>
        )}
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
            placeholder="Escribí como si fueras un lead..."
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            onClick={handleSend}
            disabled={isPending || !draft.trim()}
            className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
