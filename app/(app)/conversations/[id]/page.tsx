import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { ChatThread } from "@/components/conversations/ChatThread";

export const dynamic = "force-dynamic";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const [{ data: contact }, { data: messages }, { data: leads }] = await Promise.all([
    supabase.from("contacts").select("*").eq("id", id).single(),
    supabase
      .from("messages")
      .select("id, role, content, created_at, status")
      .eq("contact_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("leads")
      .select("score, reason, topic, qualified_at")
      .eq("contact_id", id)
      .order("qualified_at", { ascending: false })
      .limit(1),
  ]);

  if (!contact) notFound();

  const latestLead = leads?.[0];

  return (
    <>
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/conversations"
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">{contact.name ?? contact.phone}</h1>
          <p className="text-sm text-gray-500">{contact.phone}</p>
        </div>
        {latestLead && (
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={latestLead.score as BadgeVariant} />
            <span className="text-xs text-gray-400 max-w-xs truncate">{latestLead.reason}</span>
          </div>
        )}
      </div>

      <ChatThread
        contactId={contact.id}
        initialMessages={messages ?? []}
        initialBotEnabled={contact.bot_enabled}
        initialBlocked={contact.blocked}
      />
    </>
  );
}
