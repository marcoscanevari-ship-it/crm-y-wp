"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ClientForm } from "./ClientForm";

export interface ClientRow {
  id: string;
  phone: string;
  name: string | null;
  last_name: string | null;
  email: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
  stage: "hot" | "warm" | "cold" | null;
}

export function ClientesTable({ rows }: { rows: ClientRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ClientRow | null>(null);

  function saved() {
    setCreating(false);
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm"
        >
          <Plus size={14} /> Nuevo cliente
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 text-xs uppercase">
            <th className="pb-3 font-medium">Nombre y apellido</th>
            <th className="pb-3 font-medium">Empresa</th>
            <th className="pb-3 font-medium">Email</th>
            <th className="pb-3 font-medium">Teléfono</th>
            <th className="pb-3 font-medium">Etapa</th>
            <th className="pb-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r) => (
            <tr key={r.id} className="align-middle">
              <td className="py-3 pr-4 font-medium">
                {[r.name, r.last_name].filter(Boolean).join(" ") || "—"}
              </td>
              <td className="py-3 pr-4">{r.company ?? "—"}</td>
              <td className="py-3 pr-4">{r.email ?? "—"}</td>
              <td className="py-3 pr-4 text-gray-500">{r.phone}</td>
              <td className="py-3 pr-4">
                <Badge variant={r.stage ?? "neutral"} />
              </td>
              <td className="py-3 flex items-center gap-2 justify-end">
                <button
                  onClick={() => setEditing(r)}
                  className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200"
                >
                  <Pencil size={13} />
                </button>
                <Link
                  href={`/conversations/${r.id}`}
                  className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200"
                >
                  <ExternalLink size={13} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="text-sm text-gray-400 py-6 text-center">No hay clientes todavía.</p>
      )}

      {creating && <ClientForm onClose={() => setCreating(false)} onSaved={saved} />}
      {editing && (
        <ClientForm
          contactId={editing.id}
          initial={{
            name: editing.name ?? "",
            last_name: editing.last_name ?? "",
            phone: editing.phone,
            company: editing.company ?? "",
            email: editing.email ?? "",
            notes: editing.notes ?? "",
            stage: editing.stage ?? "none",
          }}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}
    </div>
  );
}
