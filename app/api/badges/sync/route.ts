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
  badges: { slug: string | null } | { slug: string | null }[] | null;
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

    const [{ data: progressRows, error: progressError }, { data: greenLogRows, error: greenLogError }, { data: existingRows, error: badgeError }] =
      await Promise.all([
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
          .select("badge_id, badges(slug)")
          .eq("user_id", user.id),
      ]);

    if (progressError || greenLogError || badgeError) {
      return NextResponse.json({ error: "Gagal memuat data badge pengguna." }, { status: 500 });
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

    const existingBadgeSlugs = new Set(
      ((existingRows || []) as unknown as ExistingUserBadgeRow[])
        .map((row) => firstRelation(row.badges)?.slug)
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

    const adminSupabase = getAdminSupabase();
    const { data: badgeRows, error: activeBadgeError } = await adminSupabase
      .from("badges")
      .select("*")
      .in("slug", eligibleSlugs)
      .eq("is_active", true);

    if (activeBadgeError) {
      return NextResponse.json({ error: "Gagal memuat daftar badge aktif." }, { status: 500 });
    }

    const activeBadges = ((badgeRows || []) as Parameters<typeof mapBadgeFromDb>[0][])
      .map(mapBadgeFromDb);

    if (activeBadges.length === 0) {
      return NextResponse.json({ unlocked: [] });
    }

    const { error: insertError } = await adminSupabase
      .from("user_badges")
      .upsert(
        activeBadges.map((badge) => ({
          user_id: user.id,
          badge_id: badge.id,
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          awarded_by: null,
          awarded_note: "Dibuka otomatis dari aktivitas pengguna.",
        })),
        { onConflict: "user_id,badge_id", ignoreDuplicates: true }
      );

    if (insertError) {
      return NextResponse.json({ error: "Gagal menyimpan badge pengguna." }, { status: 500 });
    }

    return NextResponse.json({
      unlocked: activeBadges.map((badge: BadgeDB) => ({
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
