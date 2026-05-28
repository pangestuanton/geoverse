/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { supabase } from "./supabase";
import { getAdminSupabase } from "@/utils/supabase/server-admin";

export interface AnnouncementConfig {
  title: string;
  body: string;
  type: "info" | "warning" | "success" | "danger";
}

export interface DashboardSectionConfig {
  showChallenges: boolean;
  showLeaderboard: boolean;
  featuredModuleSlug: string;
  announcement: AnnouncementConfig | null;
}

// ===== PUBLIC: Baca config aktif untuk dashboard user =====

export async function getDashboardConfig(): Promise<DashboardSectionConfig> {
  const defaults: DashboardSectionConfig = {
    showChallenges: true,
    showLeaderboard: true,
    featuredModuleSlug: "",
    announcement: null,
  };

  try {
    const { data, error } = await supabase
      .from("dashboard_config")
      .select("key, value, is_active")
      .eq("is_active", true);

    if (error || !data) return defaults;

    const config = { ...defaults };

    for (const row of data) {
      switch (row.key) {
        case "show_challenges":
          config.showChallenges = (row.value as any)?.enabled ?? true;
          break;
        case "show_leaderboard":
          config.showLeaderboard = (row.value as any)?.enabled ?? true;
          break;
        case "featured_module_slug":
          config.featuredModuleSlug = (row.value as any)?.slug ?? "";
          break;
        case "announcement":
          if ((row.value as any)?.body) {
            config.announcement = row.value as AnnouncementConfig;
          }
          break;
      }
    }

    return config;
  } catch {
    return defaults;
  }
}

// ===== ADMIN: Baca semua config (termasuk nonaktif) =====

export async function getAllDashboardConfigsAdmin(): Promise<
  { id: string; key: string; value: Record<string, unknown>; isActive: boolean }[]
> {
  const adminSupabase = getAdminSupabase();
  const { data, error } = await adminSupabase
    .from("dashboard_config")
    .select("*")
    .order("key");

  if (error || !data) return [];
  return data.map((d: any) => ({
    id: d.id,
    key: d.key,
    value: d.value,
    isActive: d.is_active,
  }));
}

export async function upsertDashboardConfig(
  key: string,
  value: Record<string, unknown>,
  isActive: boolean
): Promise<void> {
  const adminSupabase = getAdminSupabase();

  const { error } = await adminSupabase
    .from("dashboard_config")
    .upsert(
      { key, value, is_active: isActive, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) throw error;
}
