import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/adminRoute";
import { getAdminSupabase } from "@/utils/supabase/server-admin";

const updateUserSchema = z.object({
  uid: z.string().uuid("Pengguna tidak valid."),
  name: z.string().min(2, "Nama minimal 2 karakter.").max(80, "Nama maksimal 80 karakter."),
  totalPoints: z.number().int().min(0, "Poin tidak boleh negatif.").max(1_000_000, "Poin terlalu besar."),
});

function mapUser(row: {
  uid: string;
  name: string;
  display_name: string | null;
  email: string;
  photo_url: string | null;
  role: "user" | "admin";
  total_points: number | null;
  profile_setup_done: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}) {
  return {
    uid: row.uid,
    name: row.name,
    displayName: row.display_name || null,
    email: row.email,
    photoURL: row.photo_url || "",
    role: row.role || "user",
    totalPoints: row.total_points || 0,
    profileSetupDone: row.profile_setup_done || false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET() {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  try {
    const { data, error } = await getAdminSupabase()
      .from("users")
      .select("uid, name, display_name, email, photo_url, role, total_points, profile_setup_done, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Gagal memuat data pengguna." }, { status: 500 });
    }

    return NextResponse.json({ users: (data || []).map(mapUser) });
  } catch {
    return NextResponse.json({ error: "Konfigurasi server admin tidak valid." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  const parsed = updateUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data pengguna tidak valid." }, { status: 400 });
  }

  try {
    const { error } = await getAdminSupabase()
      .from("users")
      .update({
        name: parsed.data.name,
        total_points: parsed.data.totalPoints,
        updated_at: new Date().toISOString(),
      })
      .eq("uid", parsed.data.uid);

    if (error) {
      return NextResponse.json({ error: "Gagal memperbarui pengguna." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Konfigurasi server admin tidak valid." }, { status: 500 });
  }
}
