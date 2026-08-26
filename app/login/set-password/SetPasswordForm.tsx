"use client";

import { useActionState } from "react";
import { setPasswordAction, type SetPasswordResult } from "./actions";

const initialState: SetPasswordResult = { ok: false, message: "" };

export function SetPasswordForm() {
  const [state, formAction, pending] = useActionState(setPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input
        type="password"
        name="password"
        required
        minLength={8}
        placeholder="Nueva contraseña"
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      <input
        type="password"
        name="confirm"
        required
        minLength={8}
        placeholder="Repetí la contraseña"
        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 transition disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar contraseña"}
      </button>

      {state.message && <p className="text-sm text-red-600">{state.message}</p>}
    </form>
  );
}
