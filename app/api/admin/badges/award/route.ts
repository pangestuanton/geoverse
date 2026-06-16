import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getAdminSupabase } from "@/utils/supabase/server-admin";
import { isAdminEmail } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Sesi login tidak valid." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("uid", user.id)
      .maybeSingle();

    const isAdmin = profile?.role === "admin" || isAdminEmail(user.email ?? null);
    if (!isAdmin) {
      return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
    }

    const body = (await request.json()) as {
      badgeId?: string;
      userId?: string;
      note?: string;
    };

    const badgeId = body.badgeId?.trim();
    const userId = body.userId?.trim();
    const note = body.note?.trim() || null;

    if (!badgeId || !userId) {
      return NextResponse.json({ error: "Badge dan pengguna wajib dipilih." }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();
    const { data: existing } = await adminSupabase
      .from("user_badges")
      .select("id")
      .eq("user_id", userId)
      .eq("badge_id", badgeId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Pengguna sudah memiliki badge ini." }, { status: 409 });
    }

    const { error } = await adminSupabase.from("user_badges").insert({
      user_id: userId,
      badge_id: badgeId,
      unlocked: true,
      unlocked_at: new Date().toISOString(),
      awarded_by: user.id,
      awarded_note: note,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Pengguna sudah memiliki badge ini." }, { status: 409 });
      }
      return NextResponse.json({ error: error.message || "Gagal memberikan badge." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/badges/award] error:", error);
    return NextResponse.json({ error: "Gagal memberikan badge." }, { status: 500 });
  }
}
