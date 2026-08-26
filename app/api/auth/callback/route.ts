import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEmailAllowed, ADMIN_EMAILS } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=sin-codigo`);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=codigo-invalido`);
  }

  const email = data.user.email;
  if (!email || !isEmailAllowed(email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=dominio-no-permitido`);
  }

  // Provisiona (o consulta) el perfil con el cliente admin para poder decidir
  // el rol server-side sin exponer esa lógica al cliente.
  const admin = createAdminClient();
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("password_set")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!existingProfile) {
    await admin.from("profiles").insert({
      id: data.user.id,
      email,
      role: ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : "operador",
    });
    return NextResponse.redirect(`${origin}/login/set-password`);
  }

  if (!existingProfile.password_set) {
    return NextResponse.redirect(`${origin}/login/set-password`);
  }

  const response = NextResponse.redirect(`${origin}/dashboard`);
  response.cookies.delete("mfa_pending_email");
  return response;
}
