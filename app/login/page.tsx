"use client";

import { Suspense, useActionState } from "react";
import { requestMagicLink, type RequestMagicLinkResult } from "./actions";
import { useSearchParams } from "next/navigation";

const initialState: RequestMagicLinkResult = { ok: false, message: "" };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: RequestMagicLinkResult, formData: FormData) => requestMagicLink(formData),
    initialState
  );
  const searchParams = useSearchParams();
  const domainError = searchParams.get("error") === "dominio-no-permitido";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-blobs" />
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-xl shadow-indigo-900/10 p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
            B
          </div>
          <span className="font-semibold text-lg">Berta CRM</span>
        </div>

        <h1 className="text-xl font-semibold mb-1">Ingresá a tu panel</h1>
        <p className="text-sm text-gray-500 mb-6">
          Te enviamos un link mágico por email, sin contraseña.
        </p>

        {domainError && (
          <div className="mb-4 rounded-xl bg-red-50 text-red-600 text-sm px-3 py-2">
            Ese email no tiene acceso al panel.
          </div>
        )}

        <form action={formAction} className="space-y-3">
          <input
            type="email"
            name="email"
            required
            placeholder="tu@email.com"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {pending ? "Enviando..." : "Enviar link mágico"}
          </button>
        </form>

        {state.message && (
          <p
            className={`mt-4 text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </div>
  );
}
