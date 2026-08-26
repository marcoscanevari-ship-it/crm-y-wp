import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, isAdmin } from "@/lib/profile";
import { Topbar } from "@/components/ui/Topbar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AdminUsersSection } from "@/components/profile/AdminUsersSection";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }

  const admin = isAdmin(profile);
  let profiles: { id: string; email: string; role: "admin" | "operador" }[] = [];

  if (admin) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.from("profiles").select("id, email, role").order("email");
    profiles = data ?? [];
  }

  return (
    <>
      <Topbar title="Mi perfil" subtitle="Tus datos, preferencias y seguridad." userEmail={profile.email} />
      <div className="space-y-4">
        <ProfileForm profile={profile} />
        {admin && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Administración de usuarios</h2>
            <AdminUsersSection profiles={profiles} currentUserId={profile.id} />
          </div>
        )}
      </div>
    </>
  );
}
