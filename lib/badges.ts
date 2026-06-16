import { supabase } from "./supabase";
import type { BadgeDB, UserBadgeWithDetails } from "@/types";
import type { getAdminSupabase as createAdminSupabaseClient } from "@/utils/supabase/server-admin";

type AdminSupabaseClient = ReturnType<typeof createAdminSupabaseClient>;

type BadgeRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type UserBadgeRow = {
  user_id: string;
  badge_id: string;
  awarded_by: string | null;
  awarded_note: string | null;
  unlocked_at: string | null;
};

const DEFAULT_BADGE_ICON = "\uD83C\uDFC5";

export function mapBadgeFromDb(data: BadgeRow): BadgeDB {
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description || "",
    icon: data.icon || DEFAULT_BADGE_ICON,
    category: data.category || "umum",
    isActive: data.is_active ?? true,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  };
}

type UserRowSummary = {
  uid: string;
  name: string | null;
  display_name: string | null;
};

function buildBadgeLookup(badges: BadgeRow[]) {
  const lookup = new Map<string, BadgeRow>();

  for (const badge of badges) {
    lookup.set(badge.id, badge);
    lookup.set(badge.slug, badge);
  }

  return lookup;
}

function syntheticUserBadgeId(userId: string, badgeId: string) {
  return `${userId}:${badgeId}`;
}

function mapUserBadgeWithDetailsFromDb(data: UserBadgeRow, badge: BadgeRow): UserBadgeWithDetails {

  return {
    id: syntheticUserBadgeId(data.user_id, data.badge_id),
    userId: data.user_id,
    badgeId: data.badge_id,
    badge: mapBadgeFromDb(badge),
    awardedBy: data.awarded_by || null,
    awardedNote: data.awarded_note || null,
    unlockedAt: data.unlocked_at ? new Date(data.unlocked_at) : new Date(),
  };
}

function isUuidCastError(error: { code?: string; message?: string } | null) {
  return error?.code === "22P02" || error?.message?.includes("invalid input syntax for type uuid");
}

async function hasExistingUserBadge(
  adminSupabase: AdminSupabaseClient,
  userId: string,
  badge: Pick<BadgeRow, "id" | "slug">
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

    if ((data || []).length > 0) return true;
  }

  return false;
}

// ===== PUBLIC =====

export async function getActiveBadges(): Promise<BadgeDB[]> {
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as BadgeRow[]).map(mapBadgeFromDb);
}

export async function getUserBadgesWithDetails(userId: string): Promise<UserBadgeWithDetails[]> {
  const [{ data: userBadgeRows, error: userBadgeError }, { data: badgeRows, error: badgeError }] = await Promise.all([
    supabase
      .from("user_badges")
      .select("user_id, badge_id, awarded_by, awarded_note, unlocked_at")
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: false }),
    supabase
      .from("badges")
      .select("*")
      .eq("is_active", true),
  ]);

  if (userBadgeError || badgeError || !userBadgeRows || !badgeRows) return [];

  const badgeLookup = buildBadgeLookup(badgeRows as BadgeRow[]);

  return (userBadgeRows as UserBadgeRow[])
    .map((row) => {
      const badge = badgeLookup.get(row.badge_id);
      return badge ? mapUserBadgeWithDetailsFromDb(row, badge) : null;
    })
    .filter((badge): badge is UserBadgeWithDetails => Boolean(badge));
}

// ===== ADMIN =====

export async function getAllBadgesAdmin(): Promise<BadgeDB[]> {
  const { getAdminSupabase } = await import("@/utils/supabase/server-admin");
  const adminSupabase = getAdminSupabase();
  const { data, error } = await adminSupabase
    .from("badges")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data || []) as BadgeRow[]).map(mapBadgeFromDb);
}

export async function createBadge(
  badgeData: Omit<BadgeDB, "id" | "createdAt" | "updatedAt" | "isActive">
): Promise<BadgeDB> {
  const { getAdminSupabase } = await import("@/utils/supabase/server-admin");
  const adminSupabase = getAdminSupabase();

  const { data, error } = await adminSupabase
    .from("badges")
    .insert({
      slug: badgeData.slug,
      name: badgeData.name,
      description: badgeData.description,
      icon: badgeData.icon,
      category: badgeData.category,
      is_active: true,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Slug "${badgeData.slug}" sudah dipakai badge lain.`);
    }
    throw error;
  }

  return mapBadgeFromDb(data as BadgeRow);
}

export async function updateBadge(
  badgeId: string,
  updates: Partial<Omit<BadgeDB, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const { getAdminSupabase } = await import("@/utils/supabase/server-admin");
  const adminSupabase = getAdminSupabase();

  const payload: Record<string, string | boolean> = { updated_at: new Date().toISOString() };
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.icon !== undefined) payload.icon = updates.icon;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.isActive !== undefined) payload.is_active = updates.isActive;

  const { error } = await adminSupabase
    .from("badges")
    .update(payload)
    .eq("id", badgeId);

  if (error) throw error;
}

export async function toggleBadgeActive(badgeId: string, isActive: boolean): Promise<void> {
  await updateBadge(badgeId, { isActive });
}

export async function awardBadgeToUser(
  badgeId: string,
  userId: string,
  adminUid: string,
  note?: string
): Promise<void> {
  const { getAdminSupabase } = await import("@/utils/supabase/server-admin");
  const adminSupabase = getAdminSupabase();

  const { data: badge, error: badgeError } = await adminSupabase
    .from("badges")
    .select("id, slug, name, description, icon, category, is_active, created_at, updated_at")
    .eq("id", badgeId)
    .maybeSingle();

  if (badgeError) throw badgeError;
  if (!badge) throw new Error("Badge tidak ditemukan.");
  if (!badge.is_active) throw new Error("Badge tidak aktif tidak bisa diberikan.");

  const existing = await hasExistingUserBadge(adminSupabase, userId, badge);

  if (existing) {
    throw new Error("Pengguna sudah memiliki badge ini.");
  }

  const { error } = await adminSupabase.from("user_badges").insert({
    user_id: userId,
    badge_id: badge.id,
    unlocked: true,
    unlocked_at: new Date().toISOString(),
    awarded_by: adminUid,
    awarded_note: note?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("Pengguna sudah memiliki badge ini.");
    }
    throw error;
  }
}

export async function getAllUserBadgesAdmin(): Promise<
  { userId: string; userName: string; badgeId: string; badgeName: string; awardedBy: string | null; unlockedAt: Date }[]
> {
  const { getAdminSupabase } = await import("@/utils/supabase/server-admin");
  const adminSupabase = getAdminSupabase();

  const { data, error } = await adminSupabase
    .from("user_badges")
    .select("user_id, badge_id, awarded_by, awarded_note, unlocked_at")
    .order("unlocked_at", { ascending: false });

  if (error || !data) return [];

  const userBadgeRows = data as UserBadgeRow[];
  const userIds = Array.from(new Set(userBadgeRows.map((row) => row.user_id)));
  const [{ data: users, error: usersError }, { data: badges, error: badgesError }] = await Promise.all([
    userIds.length > 0
      ? adminSupabase.from("users").select("uid, name, display_name").in("uid", userIds)
      : Promise.resolve({ data: [], error: null }),
    adminSupabase.from("badges").select("*"),
  ]);

  if (usersError || badgesError || !users || !badges) return [];

  const userLookup = new Map((users as UserRowSummary[]).map((user) => [user.uid, user]));
  const badgeLookup = buildBadgeLookup(badges as BadgeRow[]);

  return userBadgeRows.map((row) => {
    const user = userLookup.get(row.user_id);
    const badge = badgeLookup.get(row.badge_id);
    return {
      userId: row.user_id,
      userName: user?.display_name || user?.name || "Pengguna",
      badgeId: row.badge_id,
      badgeName: badge?.name || "",
      awardedBy: row.awarded_by,
      unlockedAt: row.unlocked_at ? new Date(row.unlocked_at) : new Date(),
    };
  });
}
