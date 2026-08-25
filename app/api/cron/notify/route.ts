import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDailyDigest } from "@/lib/email";

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { data: leads } = await supabase
    .from("leads")
    .select("id, score, reason, contact:contacts(name, phone)")
    .gte("qualified_at", startOfDay.toISOString());

  const rows = (leads ?? []).map((l) => ({
    id: l.id,
    score: l.score as "hot" | "warm" | "cold",
    reason: l.reason,
    name: (l.contact as { name: string | null; phone: string } | null)?.name ?? null,
    phone: (l.contact as { name: string | null; phone: string } | null)?.phone ?? "",
  }));

  await sendDailyDigest({
    hot: rows.filter((r) => r.score === "hot"),
    warm: rows.filter((r) => r.score === "warm"),
    cold: rows.filter((r) => r.score === "cold"),
  });

  if (rows.length > 0) {
    await supabase
      .from("leads")
      .update({ notified: true })
      .in("id", rows.map((r) => r.id));
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
