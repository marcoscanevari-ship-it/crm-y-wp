import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/auth";

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

  if (!data.user.email || !isEmailAllowed(data.user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=dominio-no-permitido`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
