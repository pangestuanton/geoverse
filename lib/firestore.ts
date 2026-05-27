import { supabase } from "./supabase";
import { createAdminNotification } from "./adminNotifications";
import type { GreenLog, UserProfile, UserProgress, UserBadge } from "@/types";

// ===== MAPPING UTILITIES =====
function mapProfileFromDb(data: any): UserProfile {
  return {
    uid: data.uid,
    name: data.name,
    email: data.email,
    photoURL: data.photo_url || "",
    totalPoints: data.total_points || 0,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  };
}

function mapLogFromDb(data: any): GreenLog {
  return {
    id: data.id,
    userId: data.user_id,
    userName: data.user_name,
    userEmail: data.user_email,
    actionDate: data.action_date,
    actionType: data.action_type,
    wasteCategory: data.waste_category,
    estimatedKg: Number(data.estimated_kg),
    location: data.location,
    note: data.note || "",
    points: data.points || 0,
    status: data.status,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  };
}

function mapProgressFromDb(data: any): UserProgress {
  return {
    moduleId: data.module_id,
    completed: data.completed,
    score: data.score,
    completedAt: data.completed_at ? new Date(data.completed_at) : null,
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  };
}

function mapBadgeFromDb(data: any): UserBadge {
  return {
    badgeId: data.badge_id,
    unlocked: data.unlocked,
    unlockedAt: data.unlocked_at ? new Date(data.unlocked_at) : null,
  };
}

// ===== USER =====

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("uid", uid)
      .maybeSingle();

    if (error) {
      console.warn("Gagal membaca profil, memastikan tabel 'users' ada:", error);
      return null;
    }

    if (!data) {
      // Self-healing: buat baris profil di public.users jika terlewat oleh trigger database
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser && authUser.id === uid) {
        const { data: insertedData, error: insertError } = await supabase
          .from("users")
          .insert({
            uid: uid,
            name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || "Pengguna GeoVerse",
            email: authUser.email || "",
            photo_url: authUser.user_metadata?.avatar_url || "",
            total_points: 0,
          })
          .select("*")
          .single();

        if (!insertError && insertedData) {
          return mapProfileFromDb(insertedData);
        }
      }
      return null;
    }

    return mapProfileFromDb(data);
  } catch (err) {
    console.error("Kesalahan pada getUserProfile:", err);
    return null;
  }
}

export async function updateUserPoints(uid: string, points: number) {
  // Pastikan profil user ada terlebih dahulu (self-healing)
  await getUserProfile(uid);

  // Dapatkan poin saat ini untuk menghindari kondisi balapan (race condition)
  const { data, error: selectError } = await supabase
    .from("users")
    .select("total_points")
    .eq("uid", uid)
    .single();

  if (selectError) throw selectError;
  const currentPoints = data?.total_points || 0;

  const { error } = await supabase
    .from("users")
    .update({
      total_points: currentPoints + points,
      updated_at: new Date().toISOString(),
    })
    .eq("uid", uid);

  if (error) throw error;
}

// ===== GREEN LOG =====

export async function addGreenLog(
  uid: string,
  logData: Omit<GreenLog, "id" | "createdAt" | "updatedAt">
) {
  const { data, error } = await supabase
    .from("green_logs")
    .insert({
      user_id: uid,
      user_name: logData.userName,
      user_email: logData.userEmail,
      action_date: logData.actionDate,
      action_type: logData.actionType,
      waste_category: logData.wasteCategory,
      estimated_kg: logData.estimatedKg,
      location: logData.location,
      note: logData.note || "",
      points: logData.points,
      status: logData.status || "pending",
    })
    .select("id")
    .single();

  if (error) throw error;
  const logId = data.id;

  // Update user points
  await updateUserPoints(uid, logData.points);

  // Picu notifikasi admin untuk Green Log baru
  createAdminNotification({
    type: "new_green_log",
    title: "Catatan Green Log Baru",
    message: `Mencatat aksi hijau: ${logData.actionType} (${logData.estimatedKg} kg).`,
    userId: uid,
    sourceCollection: "greenLogs",
    sourceId: logId,
  }).catch(console.error);

  return logId;
}

export async function getUserGreenLogs(uid: string): Promise<GreenLog[]> {
  const { data, error } = await supabase
    .from("green_logs")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapLogFromDb);
}

export async function getAllGreenLogs(): Promise<GreenLog[]> {
  const { data, error } = await supabase
    .from("green_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapLogFromDb);
}

export async function updateGreenLogStatus(
  logId: string,
  status: "pending" | "approved" | "rejected"
) {
  // Dapatkan detail log untuk melacak userId dan poin yang harus disesuaikan
  const { data: logData, error: fetchError } = await supabase
    .from("green_logs")
    .select("*")
    .eq("id", logId)
    .single();

  if (fetchError || !logData) {
    throw new Error("Green Log tidak ditemukan");
  }

  const oldStatus = logData.status;
  const userId = logData.user_id;
  const points = logData.points || 0;

  if (oldStatus !== status) {
    // Lakukan penyesuaian poin jika berpindah ke/dari status rejected
    if (status === "rejected" && oldStatus !== "rejected") {
      await updateUserPoints(userId, -points);
    } else if (oldStatus === "rejected" && status !== "rejected") {
      await updateUserPoints(userId, points);
    }

    // Update status
    const { error: updateError } = await supabase
      .from("green_logs")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", logId);

    if (updateError) throw updateError;
  }
}

// ===== LEARNING PROGRESS =====

export async function saveModuleProgress(
  uid: string,
  moduleId: string,
  score: number
) {
  const { error } = await supabase
    .from("user_progress")
    .upsert(
      {
        user_id: uid,
        module_id: moduleId,
        completed: true,
        score,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,module_id",
      }
    );

  if (error) throw error;
}

export async function getUserProgress(uid: string): Promise<UserProgress[]> {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", uid);

  if (error || !data) return [];
  return data.map(mapProgressFromDb);
}

export async function getModuleProgress(
  uid: string,
  moduleId: string
): Promise<UserProgress | null> {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", uid)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (error || !data) return null;
  return mapProgressFromDb(data);
}

// ===== BADGES =====

export async function saveUserBadge(uid: string, badgeId: string) {
  const { error } = await supabase
    .from("user_badges")
    .upsert(
      {
        user_id: uid,
        badge_id: badgeId,
        unlocked: true,
        unlocked_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,badge_id",
      }
    );

  if (error) throw error;

  // Picu notifikasi admin untuk pencapaian badge baru
  createAdminNotification({
    type: "user_activity",
    title: "Badge Baru Terbuka",
    message: `Membuka badge pencapaian: ${badgeId}.`,
    userId: uid,
    sourceCollection: "badges",
    sourceId: badgeId,
  }).catch(console.error);
}

export async function getUserBadges(uid: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", uid);

  if (error || !data) return [];
  return data.map(mapBadgeFromDb);
}

// ===== ADMIN =====

export async function getAllUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapProfileFromDb);
}

export async function adminUpdateUserProfile(
  uid: string,
  updates: { name: string; totalPoints: number }
) {
  const { error } = await supabase
    .from("users")
    .update({
      name: updates.name,
      total_points: updates.totalPoints,
      updated_at: new Date().toISOString(),
    })
    .eq("uid", uid);

  if (error) throw error;
}
