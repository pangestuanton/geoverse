import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getAdminSupabase } from "@/utils/supabase/server-admin";
import { badges as badgeRules } from "@/data/badges";
import { mapBadgeFromDb } from "@/lib/badges";
import type { BadgeDB } from "@/types";

type ProgressWithModule = {
  module_id: string;
  completed: boolean | null;
  modules: { slug: string | null } | { slug: string | null }[] | null;
};

type GreenLogRow = {
  action_date: string | null;
};

type ExistingUserBadgeRow = {
  badge_id: string;
};

function firstRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export async function POST() {
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

    const adminSupabase = getAdminSupabase();
    const [
      { data: progressRows, error: progressError },
      { data: greenLogRows, error: greenLogError },
      { data: existingRows, error: existingBadgeError },
      { data: badgeRows, error: activeBadgeError },
    ] = await Promise.all([
      supabase
        .from("user_progress")
        .select("module_id, completed, modules(slug)")
        .eq("user_id", user.id)
        .eq("completed", true),
      supabase
        .from("green_logs")
        .select("action_date")
        .eq("user_id", user.id),
      supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", user.id),
      adminSupabase
        .from("badges")
        .select("*")
        .eq("is_active", true),
    ]);

    if (progressError || greenLogError || existingBadgeError) {
      return NextResponse.json({ error: "Gagal memuat data badge pengguna." }, { status: 500 });
    }

    if (activeBadgeError) {
      return NextResponse.json({ error: "Gagal memuat daftar badge aktif." }, { status: 500 });
    }

    const completedModuleSlugs = ((progressRows || []) as unknown as ProgressWithModule[])
      .filter((row) => row.completed)
      .map((row) => firstRelation(row.modules)?.slug)
      .filter((slug): slug is string => Boolean(slug));

    const greenLogDates = new Set(
      ((greenLogRows || []) as GreenLogRow[])
        .map((row) => row.action_date)
        .filter((date): date is string => Boolean(date))
    );

    const activeBadges = ((badgeRows || []) as Parameters<typeof mapBadgeFromDb>[0][])
      .map(mapBadgeFromDb);
    const badgeSlugByKey = new Map<string, string>();
    const activeBadgeBySlug = new Map<string, BadgeDB>();

    for (const badge of activeBadges) {
      badgeSlugByKey.set(badge.id, badge.slug);
      badgeSlugByKey.set(badge.slug, badge.slug);
      activeBadgeBySlug.set(badge.slug, badge);
    }

    const existingBadgeSlugs = new Set(
      ((existingRows || []) as ExistingUserBadgeRow[])
        .map((row) => badgeSlugByKey.get(row.badge_id) || row.badge_id)
        .filter((slug): slug is string => Boolean(slug))
    );

    const eligibleSlugs = badgeRules
      .filter((rule) => !existingBadgeSlugs.has(rule.id))
      .filter((rule) =>
        rule.checkUnlock({
          totalGreenLogs: (greenLogRows || []).length,
          completedModules: completedModuleSlugs,
          greenLogDays: greenLogDates.size,
          completedChallenges: 0,
        })
      )
      .map((rule) => rule.id);

    if (eligibleSlugs.length === 0) {
      return NextResponse.json({ unlocked: [] });
    }

    const badgesToUnlock = eligibleSlugs
      .map((slug) => activeBadgeBySlug.get(slug))
      .filter((badge): badge is BadgeDB => Boolean(badge));

    if (badgesToUnlock.length === 0) {
      return NextResponse.json({ unlocked: [] });
    }

    const existingBadgeKeys = new Set(((existingRows || []) as ExistingUserBadgeRow[]).map((row) => row.badge_id));
    const rowsToInsert = badgesToUnlock
      .filter((badge) => !existingBadgeKeys.has(badge.id) && !existingBadgeKeys.has(badge.slug))
      .map((badge) => ({
        user_id: user.id,
        badge_id: badge.id,
        unlocked: true,
        unlocked_at: new Date().toISOString(),
        awarded_by: null,
        awarded_note: "Dibuka otomatis dari aktivitas pengguna.",
      }));

    if (rowsToInsert.length > 0) {
      const { error: insertError } = await adminSupabase
        .from("user_badges")
        .insert(rowsToInsert);

      if (insertError && insertError.code !== "23505") {
        return NextResponse.json({ error: "Gagal menyimpan badge pengguna." }, { status: 500 });
      }
    }

    return NextResponse.json({
      unlocked: badgesToUnlock.map((badge: BadgeDB) => ({
        id: badge.id,
        slug: badge.slug,
        name: badge.name,
        icon: badge.icon,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menyinkronkan badge.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
