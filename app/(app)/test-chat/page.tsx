import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/ui/Topbar";
import { TestChat } from "@/components/test-chat/TestChat";

export const dynamic = "force-dynamic";

export default async function TestChatPage() {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  return (
    <>
      <Topbar
        title="Test chat"
        subtitle="Probá las respuestas del agente sin enviar WhatsApp real."
        userEmail={userData.user?.email}
      />
      <TestChat />
    </>
  );
}
