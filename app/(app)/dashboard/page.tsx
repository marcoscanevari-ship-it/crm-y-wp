import { createServerSupabaseClient } from "@/lib/supabase/server";
import { inferCountry } from "@/lib/phone";
import { Topbar } from "@/components/ui/Topbar";
import { StatCard } from "@/components/ui/StatCard";
import { LeadsBarChart } from "@/components/ui/LeadsBarChart";
import { TopicsDonutChart } from "@/components/ui/TopicsDonutChart";

export const dynamic = "force-dynamic";

function lastNDaysLabels(n: number) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
    });
  }
  return days;
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: userData }, { data: contacts }, { data: leads }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("contacts").select("id, phone, ad_source, created_at"),
    supabase
      .from("leads")
      .select("id, contact_id, score, topic, qualified_at")
      .order("qualified_at", { ascending: false }),
  ]);

  const allContacts = contacts ?? [];
  const allLeads = leads ?? [];

  // Última calificación por contacto (leads ya viene ordenado desc por qualified_at).
  const latestLeadByContact = new Map<string, (typeof allLeads)[number]>();
  for (const lead of allLeads) {
    if (!latestLeadByContact.has(lead.contact_id)) {
      latestLeadByContact.set(lead.contact_id, lead);
    }
  }
  const latestLeads = Array.from(latestLeadByContact.values());

  const hotCount = latestLeads.filter((l) => l.score === "hot").length;
  const warmCount = latestLeads.filter((l) => l.score === "warm").length;
  const coldCount = latestLeads.filter((l) => l.score === "cold").length;

  // Leads calificados por día (últimos 8 días).
  const days = lastNDaysLabels(8);
  const leadsByDay = days.map(({ key, label }) => ({
    day: label,
    count: allLeads.filter((l) => l.qualified_at?.slice(0, 10) === key).length,
  }));

  // Temas (topic) de las calificaciones más recientes.
  const topicCounts = new Map<string, number>();
  for (const lead of latestLeads) {
    const topic = lead.topic ?? "Sin tema";
    topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
  }
  const topicsData = Array.from(topicCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Fuentes de anuncios.
  const sourceCounts = new Map<string, number>();
  for (const c of allContacts) {
    const source = c.ad_source ?? "Orgánico";
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
  }
  const sourcesData = Array.from(sourceCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Países (inferidos del teléfono).
  const countryCounts = new Map<string, number>();
  for (const c of allContacts) {
    const country = inferCountry(c.phone);
    countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1);
  }
  const countriesData = Array.from(countryCounts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <>
      <Topbar
        title="Hola 👋"
        subtitle="Esto es lo que está pasando con tus conversaciones."
        userEmail={userData.user?.email}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total contactos" value={allContacts.length} highlight href="/clientes" />
        <StatCard label="Leads hot" value={hotCount} deltaPositive href="/conversations?score=hot" />
        <StatCard label="Leads warm" value={warmCount} href="/conversations?score=warm" />
        <StatCard label="Leads cold" value={coldCount} href="/conversations?score=cold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Leads calificados</h2>
            <span className="text-xs text-gray-400">Últimos 8 días</span>
          </div>
          <LeadsBarChart data={leadsByDay} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold mb-3">Temas</h2>
          <TopicsDonutChart data={topicsData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold mb-3">Fuentes de anuncios</h2>
          <ListBars data={sourcesData} total={allContacts.length} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold mb-3">Países</h2>
          <ListBars data={countriesData} total={allContacts.length} />
        </div>
      </div>
    </>
  );
}

function ListBars({
  data,
  total,
}: {
  data: Array<{ name: string; value: number }>;
  total: number;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400">Sin datos todavía</p>;
  }

  return (
    <ul className="space-y-3">
      {data.map((d) => {
        const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
        return (
          <li key={d.name}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-700">{d.name}</span>
              <span className="text-gray-400">{d.value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
