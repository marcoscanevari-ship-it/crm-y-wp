import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, isAdmin } from "@/lib/profile";
import { Topbar } from "@/components/ui/Topbar";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!isAdmin(profile) || !profile) {
    redirect("/dashboard");
  }

  const supabase = await createServerSupabaseClient();

  const [{ data: userData }, { data: settings }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("settings").select("key, value").in("key", ["system_prompt", "calendly_link"]),
  ]);

  const map = new Map((settings ?? []).map((s) => [s.key, s.value]));

  return (
    <>
      <Topbar
        title="Configuración"
        subtitle="Editá las reglas de Zokky."
        userEmail={userData.user?.email}
      />
      <SettingsForm systemPrompt={map.get("system_prompt") ?? ""} calendlyLink={map.get("calendly_link") ?? ""} />
    </>
  );
}
