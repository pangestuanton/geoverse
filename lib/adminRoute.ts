import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdminEmail } from "@/lib/auth";

export async function requireAdminUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("[requireAdminUser] auth.getUser failed:", error?.message || "No user");
    return { error: NextResponse.json({ error: "Sesi login tidak valid." }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("uid", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[requireAdminUser] profile query failed:", profileError.message, "uid:", user.id);
    return { error: NextResponse.json({ error: "Gagal memverifikasi akses admin." }, { status: 500 }) };
  }

  const emailIsAdmin = isAdminEmail(user.email ?? null);

  if (profile?.role !== "admin" && !emailIsAdmin) {
    return { error: NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 }) };
  }

  return { user };
}
