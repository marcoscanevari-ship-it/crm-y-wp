"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface ProfileRow {
  id: string;
  email: string;
  role: "admin" | "operador";
}

export function RolesMatrix({ profiles, currentUserId }: { profiles: ProfileRow[]; currentUserId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const changeRole = (id: string, role: string) => {
    startTransition(async () => {
      await fetch(`/api/profiles/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">Matriz de roles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="font-medium mb-1">Admin</p>
            <p className="text-gray-500">
              Acceso completo: Dashboard, Conversaciones, Base de clientes, Configuración y Test chat.
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 p-4">
            <p className="font-medium mb-1">Operador</p>
            <p className="text-gray-500">
              Acceso a Dashboard, Conversaciones y Base de clientes. Sin acceso a Configuración ni Test chat.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold mb-4">Usuarios</h2>
        <div className="divide-y divide-gray-100">
          {profiles.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3">
              <span className="text-sm">{p.email}</span>
              <select
                value={p.role}
                disabled={isPending || p.id === currentUserId}
                onChange={(e) => changeRole(p.id, e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 disabled:opacity-60"
              >
                <option value="admin">Admin</option>
                <option value="operador">Operador</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
