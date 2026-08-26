"use client";

import { useActionState } from "react";
import type { Profile } from "@/lib/profile";
import {
  updatePersonalDataAction,
  updatePreferencesAction,
  changePasswordAction,
  uploadAvatarAction,
  type ActionResult,
} from "@/app/(app)/profile/actions";

const initialState: ActionResult = { ok: false, message: "" };

export function ProfileForm({ profile }: { profile: Profile }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AvatarSection profile={profile} />
      <PreferencesSection profile={profile} />
      <PersonalDataSection profile={profile} />
      <PasswordSection />
    </div>
  );
}

function SectionMessage({ state }: { state: ActionResult }) {
  if (!state.message) return null;
  return (
    <span className={`text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}>
      {state.message}
    </span>
  );
}

function AvatarSection({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => uploadAvatarAction(formData),
    initialState
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h2 className="font-semibold">Foto de perfil</h2>
      <div className="flex items-center gap-4">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-semibold">
            {profile.email.slice(0, 1).toUpperCase()}
          </div>
        )}
        <form action={formAction} className="flex-1 flex items-center gap-3">
          <input
            type="file"
            name="avatar"
            accept="image/*"
            className="text-sm flex-1"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-indigo-600 text-white text-sm font-medium px-4 py-2 hover:bg-indigo-700 transition disabled:opacity-60 shrink-0"
          >
            {pending ? "Subiendo..." : "Subir"}
          </button>
        </form>
      </div>
      <SectionMessage state={state} />
    </div>
  );
}

function PreferencesSection({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => updatePreferencesAction(formData),
    initialState
  );

  return (
    <form action={formAction} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h2 className="font-semibold">Preferencias</h2>

      <div>
        <label className="block text-sm font-medium mb-2">Idioma</label>
        <select
          name="language"
          defaultValue={profile.language}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tema</label>
        <select
          name="theme"
          defaultValue={profile.theme}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar preferencias"}
        </button>
        <SectionMessage state={state} />
      </div>
    </form>
  );
}

function PersonalDataSection({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => updatePersonalDataAction(formData),
    initialState
  );

  return (
    <form action={formAction} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h2 className="font-semibold">Datos personales</h2>
      <p className="text-xs text-gray-400">Email: {profile.email} (no editable)</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">Teléfono</label>
          <input
            name="phone"
            defaultValue={profile.phone ?? ""}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">DNI</label>
          <input
            name="dni"
            defaultValue={profile.dni ?? ""}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Dirección</label>
        <input
          name="address"
          defaultValue={profile.address ?? ""}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">Edad</label>
          <input
            type="number"
            name="age"
            min={0}
            defaultValue={profile.age ?? ""}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Gustos personales</label>
          <input
            name="hobbies"
            defaultValue={profile.hobbies ?? ""}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar datos"}
        </button>
        <SectionMessage state={state} />
      </div>
    </form>
  );
}

function PasswordSection() {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => changePasswordAction(formData),
    initialState
  );

  return (
    <form action={formAction} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h2 className="font-semibold">Cambiar contraseña</h2>

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

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Cambiar contraseña"}
        </button>
        <SectionMessage state={state} />
      </div>
    </form>
  );
}
