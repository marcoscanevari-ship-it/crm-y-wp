import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/ui/Topbar";
import { ClientesTable } from "@/components/clientes/ClientesTable";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createServerSupabaseClient();

  const [{ data: userData }, { data: contacts }, { data: leads }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("contacts")
      .select("id, phone, name, last_name, email, company, notes, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("leads")
      .select("contact_id, score")
      .order("qualified_at", { ascending: false }),
  ]);

  const stageByContact = new Map<string, "hot" | "warm" | "cold">();
  for (const l of leads ?? []) {
    if (!stageByContact.has(l.contact_id)) stageByContact.set(l.contact_id, l.score);
  }

  let rows = (contacts ?? []).map((c) => ({ ...c, stage: stageByContact.get(c.id) ?? null }));
  if (q) {
    const query = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.phone.toLowerCase().includes(query) ||
        (r.name ?? "").toLowerCase().includes(query) ||
        (r.last_name ?? "").toLowerCase().includes(query) ||
        (r.company ?? "").toLowerCase().includes(query) ||
        (r.email ?? "").toLowerCase().includes(query)
    );
  }

  return (
    <>
      <Topbar
        title="Base de clientes"
        subtitle={`${rows.length} contactos`}
        userEmail={userData.user?.email}
      />

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <form className="mb-4" method="get">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre, empresa, email o teléfono..."
            className="w-full sm:w-96 rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </form>

        <ClientesTable rows={rows} />
      </div>
    </>
  );
}
