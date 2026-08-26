import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, isAdmin } from "@/lib/profile";
import { Topbar } from "@/components/ui/Topbar";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!isAdmin(profile) || !profile) {
    redirect("/dashboard");
  }

  const supabase = await createServerSupabaseClient();

  const [{ data: userData }, { data: settings }, { data: profiles }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("settings").select("key, value").in("key", ["system_prompt", "calendly_link"]),
    supabase.from("profiles").select("id, email, role").order("email"),
  ]);

  const map = new Map((settings ?? []).map((s) => [s.key, s.value]));

  return (
    <>
      <Topbar
        title="Configuración"
        subtitle="Editá las reglas de Zokky y la matriz de roles."
        userEmail={userData.user?.email}
      />
      <SettingsTabs
        systemPrompt={map.get("system_prompt") ?? ""}
        calendlyLink={map.get("calendly_link") ?? ""}
        profiles={profiles ?? []}
        currentUserId={profile.id}
      />
    </>
  );
}
