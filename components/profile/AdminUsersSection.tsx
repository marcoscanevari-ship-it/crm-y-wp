"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserAction,
  resetUserPasswordAction,
  type ActionResult,
} from "@/app/(app)/profile/actions";

interface ProfileRow {
  id: string;
  email: string;
  role: "admin" | "operador";
}

const initialState: ActionResult = { ok: false, message: "" };

export function AdminUsersSection({
  profiles,
  currentUserId,
}: {
  profiles: ProfileRow[];
  currentUserId: string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CreateUserForm />
      <UsersList profiles={profiles} currentUserId={currentUserId} />
    </div>
  );
}

function CreateUserForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => createUserAction(formData),
    initialState
  );

  return (
    <form action={formAction} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h2 className="font-semibold">Crear usuario</h2>
      <p className="text-xs text-gray-400">
        Le asignás una contraseña inicial y se la pasás por otro medio (no se envía mail).
      </p>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          name="email"
          required
          placeholder="colaborador@zokkia.com"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Contraseña inicial</label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Rol</label>
        <select
          name="role"
          defaultValue="operador"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        >
          <option value="operador">Operador</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-primary-600 text-white text-sm font-medium px-5 py-2.5 hover:bg-primary-700 transition disabled:opacity-60"
        >
          {pending ? "Creando..." : "Crear usuario"}
        </button>
        {state.message && (
          <span className={`text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}>{state.message}</span>
        )}
      </div>
    </form>
  );
}

function UsersList({ profiles, currentUserId }: { profiles: ProfileRow[]; currentUserId: string }) {
  const router = useRouter();
  const [rolePending, setRolePending] = useState<string | null>(null);

  const changeRole = async (id: string, role: string) => {
    setRolePending(id);
    await fetch(`/api/profiles/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setRolePending(null);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="font-semibold mb-4">Usuarios</h2>
      <div className="divide-y divide-gray-100">
        {profiles.map((p) => (
          <UserRow
            key={p.id}
            profile={p}
            isSelf={p.id === currentUserId}
            rolePending={rolePending === p.id}
            onChangeRole={(role) => changeRole(p.id, role)}
          />
        ))}
      </div>
    </div>
  );
}

function UserRow({
  profile,
  isSelf,
  rolePending,
  onChangeRole,
}: {
  profile: ProfileRow;
  isSelf: boolean;
  rolePending: boolean;
  onChangeRole: (role: string) => void;
}) {
  const [showReset, setShowReset] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => resetUserPasswordAction(formData),
    initialState
  );

  return (
    <div className="py-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm truncate">{profile.email}</span>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={profile.role}
            disabled={rolePending || isSelf}
            onChange={(e) => onChangeRole(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 disabled:opacity-60"
          >
            <option value="admin">Admin</option>
            <option value="operador">Operador</option>
          </select>
          <button
            type="button"
            onClick={() => setShowReset((v) => !v)}
            className="text-sm text-primary-600 hover:underline whitespace-nowrap"
          >
            Blanquear contraseña
          </button>
        </div>
      </div>

      {showReset && (
        <form action={formAction} className="flex items-center gap-2 pl-1">
          <input type="hidden" name="userId" value={profile.id} />
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="Nueva contraseña"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary-600 text-white text-sm font-medium px-3 py-1.5 hover:bg-primary-700 transition disabled:opacity-60 whitespace-nowrap"
          >
            {pending ? "Guardando..." : "Guardar"}
          </button>
          {state.message && (
            <span className={`text-xs ${state.ok ? "text-green-600" : "text-red-600"}`}>{state.message}</span>
          )}
        </form>
      )}
    </div>
  );
}
