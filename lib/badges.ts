/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from "./supabase";
import type { BadgeDB, UserBadgeWithDetails } from "@/types";

// ===== MAPPING =====

function mapBadgeFromDb(data: any): BadgeDB {
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    description: data.description || "",
    icon: data.icon || "🏅",
    category: data.category || "umum",
    isActive: data.is_active ?? true,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  };
}

function mapUserBadgeWithDetailsFromDb(data: any): UserBadgeWithDetails {
  return {
    id: data.id,
    userId: data.user_id,
    badgeId: data.badge_id,
    badge: mapBadgeFromDb(data.badges),
    awardedBy: data.awarded_by || null,
    awardedNote: data.awarded_note || null,
    unlockedAt: data.unlocked_at ? new Date(data.unlocked_at) : new Date(),
  };
}

// ===== PUBLIC =====

export async function getActiveBadges(): Promise<BadgeDB[]> {
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data.map(mapBadgeFromDb);
}

export async function getUserBadgesWithDetails(userId: string): Promise<UserBadgeWithDetails[]> {
  const { data, error } = await supabase
    .from("user_badges")
    .select("*, badges(*)")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });

  if (error || !data) return [];
  return data.filter((d) => d.badges).map(mapUserBadgeWithDetailsFromDb);
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
  return (data || []).map(mapBadgeFromDb);
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
  return mapBadgeFromDb(data);
}

export async function updateBadge(
  badgeId: string,
  updates: Partial<Omit<BadgeDB, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const { getAdminSupabase } = await import("@/utils/supabase/server-admin");
  const adminSupabase = getAdminSupabase();

  const payload: Record<string, any> = { updated_at: new Date().toISOString() };
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

/**
 * Berikan badge ke user tertentu.
 * Mencegah duplikasi: jika user sudah punya badge ini, akan gagal secara graceful.
 */
export async function awardBadgeToUser(
  badgeId: string,
  userId: string,
  adminUid: string,
  note?: string
): Promise<void> {
  const { getAdminSupabase } = await import("@/utils/supabase/server-admin");
  const adminSupabase = getAdminSupabase();

  // Cek apakah user sudah punya badge ini
  const { data: existing } = await adminSupabase
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_id", badgeId)
    .maybeSingle();

  if (existing) {
    throw new Error("Pengguna sudah memiliki badge ini.");
  }

  const { error } = await adminSupabase.from("user_badges").insert({
    user_id: userId,
    badge_id: badgeId,
    unlocked: true,
    unlocked_at: new Date().toISOString(),
    awarded_by: adminUid,
    awarded_note: note || null,
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
    .select("user_id, badge_id, awarded_by, unlocked_at, users(name, display_name), badges(name)")
    .order("unlocked_at", { ascending: false });

  if (error || !data) return [];

  return data.map((d: any) => ({
    userId: d.user_id,
    userName: d.users?.display_name || d.users?.name || "Pengguna",
    badgeId: d.badge_id,
    badgeName: d.badges?.name || "",
    awardedBy: d.awarded_by,
    unlockedAt: d.unlocked_at ? new Date(d.unlocked_at) : new Date(),
  }));
}
