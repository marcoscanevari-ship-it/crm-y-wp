"use client";

import { useActionState } from "react";
import { saveSystemPrompt, type SaveSettingsResult } from "@/app/(app)/settings/actions";

const initialState: SaveSettingsResult = { ok: false, message: "" };

export function SettingsForm({
  systemPrompt,
  calendlyLink,
}: {
  systemPrompt: string;
  calendlyLink: string;
}) {
  const [state, formAction, pending] = useActionState(saveSystemPrompt, initialState);

  return (
    <form action={formAction} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2">System prompt de Berta</label>
        <textarea
          name="system_prompt"
          defaultValue={systemPrompt}
          rows={16}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Link de Calendly</label>
        <input
          type="url"
          name="calendly_link"
          defaultValue={calendlyLink}
          placeholder="https://calendly.com/tu-agencia/reunion"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
        {state.message && (
          <span className={`text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
