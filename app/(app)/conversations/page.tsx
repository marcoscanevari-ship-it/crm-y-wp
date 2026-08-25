import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/ui/Topbar";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createServerSupabaseClient();

  const [{ data: userData }, { data: contacts }, { data: messages }, { data: leads }] =
    await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from("contacts")
        .select("id, phone, name, created_at, blocked, bot_enabled")
        .order("created_at", { ascending: false }),
      supabase
        .from("messages")
        .select("contact_id, content, role, created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("leads")
        .select("contact_id, score, qualified_at")
        .order("qualified_at", { ascending: false }),
    ]);

  type MessageRow = NonNullable<typeof messages>[number];
  const lastMessageByContact = new Map<string, MessageRow>();
  for (const m of messages ?? []) {
    if (!lastMessageByContact.has(m.contact_id)) {
      lastMessageByContact.set(m.contact_id, m);
    }
  }

  const latestScoreByContact = new Map<string, "hot" | "warm" | "cold">();
  for (const l of leads ?? []) {
    if (!latestScoreByContact.has(l.contact_id)) {
      latestScoreByContact.set(l.contact_id, l.score as "hot" | "warm" | "cold");
    }
  }

  let rows = (contacts ?? []).map((c) => ({
    ...c,
    lastMessage: lastMessageByContact.get(c.id),
    score: latestScoreByContact.get(c.id),
  }));

  if (q) {
    const query = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.phone.toLowerCase().includes(query) ||
        (r.name ?? "").toLowerCase().includes(query)
    );
  }

  const counts = {
    hot: rows.filter((r) => r.score === "hot").length,
    warm: rows.filter((r) => r.score === "warm").length,
    cold: rows.filter((r) => r.score === "cold").length,
    none: rows.filter((r) => !r.score).length,
  };

  return (
    <>
      <Topbar
        title="Conversaciones"
        subtitle={`${rows.length} conversaciones`}
        userEmail={userData.user?.email}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <SummaryCard label="Hot" value={counts.hot} tone="bg-red-50 text-red-600" />
        <SummaryCard label="Warm" value={counts.warm} tone="bg-amber-50 text-amber-600" />
        <SummaryCard label="Cold" value={counts.cold} tone="bg-blue-50 text-blue-600" />
        <SummaryCard label="Sin calificar" value={counts.none} tone="bg-gray-100 text-gray-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <form className="mb-4" method="get">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nombre o teléfono..."
            className="w-full sm:w-80 rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </form>

        <div className="divide-y divide-gray-100">
          {rows.length === 0 && (
            <p className="text-sm text-gray-400 py-6 text-center">
              No hay conversaciones todavía.
            </p>
          )}
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/conversations/${r.id}`}
              className="flex items-center gap-4 py-3.5 hover:bg-gray-50 -mx-2 px-2 rounded-xl transition"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-medium text-sm shrink-0">
                {(r.name ?? r.phone).slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{r.name ?? r.phone}</span>
                  {r.blocked && <Badge variant="failed" label="Bloqueado" />}
                  {!r.bot_enabled && <Badge variant="neutral" label="Bot OFF" />}
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {r.lastMessage
                    ? `${r.lastMessage.role === "assistant" ? "Zokky: " : ""}${r.lastMessage.content}`
                    : "Sin mensajes"}
                </p>
              </div>
              <div className="text-right shrink-0">
                {r.score ? (
                  <Badge variant={r.score as BadgeVariant} />
                ) : (
                  <Badge variant="neutral" />
                )}
                <p className="text-[11px] text-gray-400 mt-1">
                  {r.lastMessage
                    ? new Date(r.lastMessage.created_at).toLocaleDateString("es-AR")
                    : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm p-4">
      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium mb-2 ${tone}`}>
        {label}
      </span>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
