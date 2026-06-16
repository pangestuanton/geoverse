import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { getAdminSupabase } from "@/utils/supabase/server-admin";
import { isAdminEmail } from "@/lib/auth";

const awardSchema = z.object({
  badgeId: z.string().uuid("Badge tidak valid."),
  userId: z.string().uuid("Pengguna tidak valid."),
  note: z.string().max(200, "Catatan maksimal 200 karakter.").optional(),
});

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: NextResponse.json({ error: "Sesi login tidak valid." }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("uid", user.id)
    .maybeSingle();

  if (profileError) {
    return { error: NextResponse.json({ error: "Gagal memverifikasi akses admin." }, { status: 500 }) };
  }

  if (profile?.role !== "admin" && !isAdminEmail(user.email ?? null)) {
    return { error: NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 }) };
  }

  return { user };
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const parsed = awardSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data badge tidak valid." }, { status: 400 });
  }

  try {
    const adminSupabase = getAdminSupabase();
    const { badgeId, userId, note } = parsed.data;

    const [{ data: badge, error: badgeError }, { data: targetUser, error: userError }, { data: existing, error: existingError }] =
      await Promise.all([
        adminSupabase.from("badges").select("id, is_active").eq("id", badgeId).maybeSingle(),
        adminSupabase.from("users").select("uid, role").eq("uid", userId).maybeSingle(),
        adminSupabase
          .from("user_badges")
          .select("id")
          .eq("user_id", userId)
          .eq("badge_id", badgeId)
          .maybeSingle(),
      ]);

    if (badgeError || userError || existingError) {
      return NextResponse.json({ error: "Gagal memverifikasi data badge." }, { status: 500 });
    }

    if (!badge) {
      return NextResponse.json({ error: "Badge tidak ditemukan." }, { status: 404 });
    }

    if (!badge.is_active) {
      return NextResponse.json({ error: "Badge tidak aktif tidak bisa diberikan." }, { status: 400 });
    }

    if (!targetUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    if (targetUser.role === "admin") {
      return NextResponse.json({ error: "Badge hanya bisa diberikan ke pengguna biasa." }, { status: 400 });
    }

    if (existing) {
      return NextResponse.json({ error: "Pengguna sudah memiliki badge ini." }, { status: 409 });
    }

    const { error } = await adminSupabase.from("user_badges").insert({
      user_id: userId,
      badge_id: badgeId,
      unlocked: true,
      unlocked_at: new Date().toISOString(),
      awarded_by: admin.user.id,
      awarded_note: note?.trim() || null,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Pengguna sudah memiliki badge ini." }, { status: 409 });
      }
      return NextResponse.json({ error: "Gagal memberikan badge." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Konfigurasi server admin tidak valid." }, { status: 500 });
  }
}
