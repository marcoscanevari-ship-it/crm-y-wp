"use client";

import { useState } from "react";
import { X } from "lucide-react";

export interface ClientFormValues {
  name: string;
  last_name: string;
  phone: string;
  company: string;
  email: string;
  notes: string;
  stage: "none" | "hot" | "warm" | "cold";
}

const EMPTY: ClientFormValues = {
  name: "",
  last_name: "",
  phone: "",
  company: "",
  email: "",
  notes: "",
  stage: "none",
};

const INPUT =
  "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

export function ClientForm({
  initial,
  contactId,
  onClose,
  onSaved,
}: {
  initial?: Partial<ClientFormValues>;
  contactId?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = !!contactId;
  const [values, setValues] = useState<ClientFormValues>({ ...EMPTY, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof ClientFormValues) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const { phone, ...rest } = values;
    const res = await fetch(editing ? `/api/contacts/${contactId}` : "/api/contacts", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing ? rest : values),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{editing ? "Editar cliente" : "Nuevo cliente"}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Nombre *
            <input required value={values.name} onChange={set("name")} className={INPUT} />
          </label>
          <label className="text-sm">
            Apellido
            <input value={values.last_name} onChange={set("last_name")} className={INPUT} />
          </label>
          <label className="text-sm">
            Celular * {editing && <span className="text-gray-400">(no editable)</span>}
            <input
              required
              disabled={editing}
              value={values.phone}
              onChange={set("phone")}
              placeholder="5491122334455"
              className={`${INPUT} disabled:bg-gray-50 disabled:text-gray-400`}
            />
          </label>
          <label className="text-sm">
            Empresa
            <input value={values.company} onChange={set("company")} className={INPUT} />
          </label>
          <label className="text-sm col-span-2">
            Email corporativo
            <input type="email" value={values.email} onChange={set("email")} className={INPUT} />
          </label>
          <label className="text-sm col-span-2">
            Etapa
            <select value={values.stage} onChange={set("stage")} className={INPUT}>
              <option value="none">Sin calificar</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </label>
          <label className="text-sm col-span-2">
            Datos adicionales
            <textarea
              rows={4}
              value={values.notes}
              onChange={set("notes")}
              placeholder="Cuenta bancaria, CUIT, canal de origen, observaciones..."
              className={INPUT}
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm bg-primary-600 text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
