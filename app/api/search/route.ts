import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createServerSupabaseClient();
  const term = `%${q}%`;

  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("id, name, phone, email, company")
    .or(`name.ilike.${term},phone.ilike.${term},email.ilike.${term},company.ilike.${term}`)
    .limit(8);

  if (error || !contacts?.length) {
    return NextResponse.json({ results: [] });
  }

  const ids = contacts.map((c) => c.id);
  const { data: leads } = await supabase
    .from("leads")
    .select("contact_id, score, qualified_at")
    .in("contact_id", ids)
    .order("qualified_at", { ascending: false });

  const latestScoreByContact = new Map<string, string>();
  for (const l of leads ?? []) {
    if (!latestScoreByContact.has(l.contact_id)) {
      latestScoreByContact.set(l.contact_id, l.score);
    }
  }

  const results = contacts.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    score: latestScoreByContact.get(c.id) ?? null,
  }));

  return NextResponse.json({ results });
}
