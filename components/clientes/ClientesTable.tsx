"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Check } from "lucide-react";

export interface ClientRow {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  company: string | null;
  created_at: string;
}

export function ClientesTable({ rows }: { rows: ClientRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 text-xs uppercase">
            <th className="pb-3 font-medium">Nombre y apellido</th>
            <th className="pb-3 font-medium">Empresa</th>
            <th className="pb-3 font-medium">Email</th>
            <th className="pb-3 font-medium">Teléfono</th>
            <th className="pb-3 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r) => (
            <ClientRowItem key={r.id} row={r} />
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="text-sm text-gray-400 py-6 text-center">No hay clientes todavía.</p>
      )}
    </div>
  );
}

function ClientRowItem({ row }: { row: ClientRow }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(row.name ?? "");
  const [company, setCompany] = useState(row.company ?? "");
  const [email, setEmail] = useState(row.email ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await fetch(`/api/contacts/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company, email }),
      });
      setEditing(false);
    });
  }

  return (
    <tr className="align-middle">
      <td className="py-3 pr-4">
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre y apellido"
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-primary-500"
          />
        ) : (
          <span className="font-medium">{row.name ?? "—"}</span>
        )}
      </td>
      <td className="py-3 pr-4">
        {editing ? (
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Empresa"
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-primary-500"
          />
        ) : (
          row.company ?? "—"
        )}
      </td>
      <td className="py-3 pr-4">
        {editing ? (
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@empresa.com"
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-primary-500"
          />
        ) : (
          row.email ?? "—"
        )}
      </td>
      <td className="py-3 pr-4 text-gray-500">{row.phone}</td>
      <td className="py-3 flex items-center gap-2 justify-end">
        {editing ? (
          <button
            onClick={save}
            disabled={isPending}
            className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center disabled:opacity-50"
          >
            <Check size={14} />
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200"
          >
            <Pencil size={13} />
          </button>
        )}
        <Link
          href={`/conversations/${row.id}`}
          className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200"
        >
          <ExternalLink size={13} />
        </Link>
      </td>
    </tr>
  );
}
