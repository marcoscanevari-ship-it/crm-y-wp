import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/ui/Topbar";
import { NotificationsList } from "@/components/notifications/NotificationsList";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: userData }, { data: notifications }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("notifications")
      .select("id, type, contact_id, message, read, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <>
      <Topbar
        title="Notificaciones"
        subtitle="Nuevos contactos y cambios de estado de tus leads."
        userEmail={userData.user?.email}
      />
      <NotificationsList notifications={notifications ?? []} />
    </>
  );
}
