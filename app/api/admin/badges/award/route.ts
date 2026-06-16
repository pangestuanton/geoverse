import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/utils/supabase/server-admin";
import { requireAdminUser } from "@/lib/adminRoute";

const awardSchema = z.object({
  badgeId: z.string().trim().uuid("Badge tidak valid."),
  userId: z.string().trim().min(1, "Pengguna tidak valid."),
  note: z.string().trim().max(200, "Catatan maksimal 200 karakter.").optional(),
});

type AwardBadgeRow = {
  id: string;
  slug: string;
  is_active: boolean | null;
};

type SupabaseQueryError = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

function logDev(context: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[admin/badges/award] ${context}:`, error);
  }
}

function isUuidCastError(error: SupabaseQueryError | null) {
  return error?.code === "22P02" || error?.message?.includes("invalid input syntax for type uuid");
}

async function hasExistingUserBadge(
  adminSupabase: ReturnType<typeof getAdminSupabase>,
  userId: string,
  badge: AwardBadgeRow
) {
  const candidateBadgeIds = Array.from(new Set([badge.id, badge.slug].filter(Boolean)));

  for (const candidateBadgeId of candidateBadgeIds) {
    const { data, error } = await adminSupabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId)
      .eq("badge_id", candidateBadgeId)
      .limit(1);

    if (error) {
      if (candidateBadgeId === badge.slug && isUuidCastError(error)) {
        continue;
      }

      throw error;
    }

    if ((data || []).length > 0) {
      return true;
    }
  }

  return false;
}

export async function POST(request: Request) {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  const parsed = awardSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data badge tidak valid." }, { status: 400 });
  }

  try {
    const adminSupabase = getAdminSupabase();
    const { badgeId, userId, note } = parsed.data;

    const [{ data: badge, error: badgeError }, { data: targetUser, error: userError }] = await Promise.all([
      adminSupabase.from("badges").select("id, slug, is_active").eq("id", badgeId).maybeSingle(),
      adminSupabase.from("users").select("uid, role").eq("uid", userId).maybeSingle(),
    ]);

    if (badgeError) {
      logDev("badge verification failed", badgeError);
      return NextResponse.json({ error: "Gagal memverifikasi badge yang dipilih." }, { status: 500 });
    }

    if (userError) {
      logDev("target user verification failed", userError);
      return NextResponse.json({ error: "Gagal memverifikasi pengguna yang dipilih." }, { status: 500 });
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

    let existing = false;
    try {
      existing = await hasExistingUserBadge(adminSupabase, userId, badge);
    } catch (error) {
      logDev("existing badge verification failed", error);
      return NextResponse.json({ error: "Gagal memeriksa kepemilikan badge pengguna." }, { status: 500 });
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
      awarded_note: note || null,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Pengguna sudah memiliki badge ini." }, { status: 409 });
      }
      if (error.code === "23503" || isUuidCastError(error)) {
        logDev("badge insert rejected invalid references", error);
        return NextResponse.json({ error: "Data pengguna atau badge tidak valid." }, { status: 400 });
      }
      logDev("badge insert failed", error);
      return NextResponse.json({ error: "Gagal memberikan badge." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logDev("unexpected award failure", error);
    return NextResponse.json({ error: "Konfigurasi server admin tidak valid." }, { status: 500 });
  }
}
