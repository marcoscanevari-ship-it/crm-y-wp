import { redirect } from "next/navigation";
import { getProfile } from "@/lib/profile";
import { Topbar } from "@/components/ui/Topbar";
import { ProfileForm } from "@/components/profile/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <>
      <Topbar title="Mi perfil" subtitle="Tus datos, preferencias y seguridad." userEmail={profile.email} />
      <ProfileForm profile={profile} />
    </>
  );
}
