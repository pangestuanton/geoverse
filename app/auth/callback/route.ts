import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { isAdminEmail } from "@/lib/auth";
import { getAdminSupabase } from "@/utils/supabase/server-admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // 'recovery' untuk password reset
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] Gagal exchange code:", error.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("Autentikasi gagal. Silakan coba lagi.")}`
      );
    }

    if (type === "recovery") {
      // Password reset flow → arahkan ke halaman update password
      return NextResponse.redirect(`${origin}/auth/update-password`);
    }

    if (data.user) {
      // Cek apakah user sudah setup profil
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("profile_setup_done, role")
        .eq("uid", data.user.id)
        .maybeSingle();

      const email = data.user.email ?? null;
      const isUserAdmin = isAdminEmail(email);

      if (!profile) {
        // User belum ada di tabel users (pertama kali login Google)
        // Buat profil dasar terlebih dahulu
        await supabase.from("users").upsert({
          uid: data.user.id,
          email: data.user.email ?? "",
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "Pengguna GeoVerse",
          display_name: null,
          photo_url: data.user.user_metadata?.avatar_url || "",
          role: isUserAdmin ? "admin" : "user",
          total_points: 0,
          profile_setup_done: false,
        }, { onConflict: "uid" });

        if (isUserAdmin) {
          return NextResponse.redirect(`${origin}/admin`);
        }
        return NextResponse.redirect(`${origin}/setup-profile`);
      }

      // Self-healing: jika email terdaftar di admin tapi di DB masih 'user'
      if (profile && profile.role !== "admin" && isUserAdmin) {
        const adminSupabase = getAdminSupabase();
        await adminSupabase.from("users").update({ role: "admin" }).eq("uid", data.user.id);
        profile.role = "admin";
      }

      if (!profile.profile_setup_done && profile.role !== "admin") {
        return NextResponse.redirect(`${origin}/setup-profile`);
      }

      // Admin → dashboard admin, user biasa → dashboard user
      if (profile.role === "admin") {
        return NextResponse.redirect(`${origin}/admin`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Tidak ada code → redirect ke login dengan error
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Link autentikasi tidak valid atau sudah kedaluwarsa.")}`
  );
}
