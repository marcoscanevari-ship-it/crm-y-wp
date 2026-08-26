import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SetPasswordForm } from "./SetPasswordForm";

export const dynamic = "force-dynamic";

export default async function SetPasswordPage() {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-blobs" />
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-xl shadow-primary-900/10 p-8">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Image src="/zokkia-mark.png" alt="Zokkia" width={40} height={40} />
          <span className="font-semibold text-lg">ZOKKIA CRM</span>
        </div>

        <h1 className="text-xl font-semibold mb-1">Creá tu contraseña</h1>
        <p className="text-sm text-gray-500 mb-6">
          La vas a usar junto con un link de confirmación por email en tus próximos ingresos.
        </p>

        <SetPasswordForm />
      </div>
    </div>
  );
}
