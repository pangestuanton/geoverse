import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdminEmail } from "@/lib/auth";
import { getAdminSupabase } from "@/utils/supabase/server-admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // 'recovery' untuk password reset
  const next = searchParams.get("next") ?? "/dashboard";

  // Create redirect response first so we can write cookies directly onto it
  const response = NextResponse.redirect(`${origin}/dashboard`);

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vcaqoepveroxvreswycv.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_J1U0_Z2aDBvBZ50EsGoMtg_N-r4c5vq";

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(c => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] Gagal exchange code:", error.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent("Autentikasi gagal. Silakan coba lagi.")}`
      );
    }

    if (type === "recovery") {
      response.headers.set("Location", `${origin}/auth/update-password`);
      return response;
    }

    if (data.user) {
      // Cek apakah user sudah setup profil
      const { data: profile } = await supabase
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
          response.headers.set("Location", `${origin}/admin`);
        } else {
          response.headers.set("Location", `${origin}/setup-profile`);
        }
        return response;
      }

      // Self-healing: jika email terdaftar di admin tapi di DB masih 'user'
      if (profile && profile.role !== "admin" && isUserAdmin) {
        const adminSupabase = getAdminSupabase();
        await adminSupabase.from("users").update({ role: "admin" }).eq("uid", data.user.id);
        profile.role = "admin";
      }

      if (!profile.profile_setup_done && profile.role !== "admin") {
        response.headers.set("Location", `${origin}/setup-profile`);
        return response;
      }

      // Admin → dashboard admin, user biasa → dashboard user
      if (profile.role === "admin") {
        response.headers.set("Location", `${origin}/admin`);
      } else {
        response.headers.set("Location", `${origin}${next}`);
      }

      return response;
    }
  }

  // Tidak ada code → redirect ke login dengan error
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Link autentikasi tidak valid atau sudah kedaluwarsa.")}`
  );
}
