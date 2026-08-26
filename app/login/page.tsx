"use client";

import { Suspense, useActionState, useState } from "react";
import {
  requestMagicLink,
  signInWithPasswordAction,
  type RequestMagicLinkResult,
  type SignInWithPasswordResult,
} from "./actions";
import { useSearchParams } from "next/navigation";

const initialMagicState: RequestMagicLinkResult = { ok: false, message: "" };
const initialPasswordState: SignInWithPasswordResult = { ok: false, message: "", mfaPending: false };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [mode, setMode] = useState<"password" | "magic">("password");

  const [passwordState, passwordAction, passwordPending] = useActionState(
    async (_prev: SignInWithPasswordResult, formData: FormData) => signInWithPasswordAction(formData),
    initialPasswordState
  );
  const [magicState, magicAction, magicPending] = useActionState(
    async (_prev: RequestMagicLinkResult, formData: FormData) => requestMagicLink(formData),
    initialMagicState
  );

  const searchParams = useSearchParams();
  const domainError = searchParams.get("error") === "dominio-no-permitido";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-blobs" />
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-xl shadow-indigo-900/10 p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
            Z
          </div>
          <span className="font-semibold text-lg">ZOKKIA CRM</span>
        </div>

        {domainError && (
          <div className="mb-4 rounded-xl bg-red-50 text-red-600 text-sm px-3 py-2">
            Ese email no tiene acceso al panel. Solo se permite el dominio @zokkia.com.
          </div>
        )}

        {passwordState.mfaPending ? (
          <div>
            <h1 className="text-xl font-semibold mb-1">Revisá tu email</h1>
            <p className="text-sm text-gray-500">{passwordState.message}</p>
          </div>
        ) : mode === "password" ? (
          <>
            <h1 className="text-xl font-semibold mb-1">Ingresá a tu panel</h1>
            <p className="text-sm text-gray-500 mb-6">Ingresá con tu email y contraseña de @zokkia.com.</p>

            <form action={passwordAction} className="space-y-3">
              <input
                type="email"
                name="email"
                required
                placeholder="tu@zokkia.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <input
                type="password"
                name="password"
                required
                placeholder="Contraseña"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={passwordPending}
                className="w-full rounded-xl bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {passwordPending ? "Ingresando..." : "Ingresar"}
              </button>
            </form>

            {passwordState.message && !passwordState.ok && (
              <p className="mt-4 text-sm text-red-600">{passwordState.message}</p>
            )}

            <button
              type="button"
              onClick={() => setMode("magic")}
              className="mt-4 text-sm text-indigo-600 hover:underline"
            >
              ¿Primera vez o olvidaste tu contraseña? Enviate un link mágico
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold mb-1">Link mágico</h1>
            <p className="text-sm text-gray-500 mb-6">
              Te enviamos un link a tu email de @zokkia.com para ingresar y definir tu contraseña.
            </p>

            <form action={magicAction} className="space-y-3">
              <input
                type="email"
                name="email"
                required
                placeholder="tu@zokkia.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={magicPending}
                className="w-full rounded-xl bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {magicPending ? "Enviando..." : "Enviar link mágico"}
              </button>
            </form>

            {magicState.message && (
              <p className={`mt-4 text-sm ${magicState.ok ? "text-green-600" : "text-red-600"}`}>
                {magicState.message}
              </p>
            )}

            <button
              type="button"
              onClick={() => setMode("password")}
              className="mt-4 text-sm text-indigo-600 hover:underline"
            >
              Ya tengo contraseña
            </button>
          </>
        )}
      </div>
    </div>
  );
}
