import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/adminRoute";
import { getAdminSupabase } from "@/utils/supabase/server-admin";

const statusSchema = z.object({
  logId: z.string().uuid("Green Log tidak valid."),
  status: z.enum(["pending", "approved", "rejected"]),
  rejectionReason: z.string().max(300, "Alasan maksimal 300 karakter.").optional(),
});

function mapLog(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    actionDate: row.action_date,
    actionType: row.action_type,
    wasteCategory: row.waste_category,
    estimatedKg: Number(row.estimated_kg || 0),
    location: row.location,
    note: row.note || "",
    points: row.points || 0,
    status: row.status,
    rejectionReason: row.rejection_reason || null,
    reviewedBy: row.reviewed_by || null,
    reviewedAt: row.reviewed_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET() {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  try {
    const { data, error } = await getAdminSupabase()
      .from("green_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Gagal memuat Green Log." }, { status: 500 });
    }

    return NextResponse.json({ logs: (data || []).map(mapLog) });
  } catch {
    return NextResponse.json({ error: "Konfigurasi server admin tidak valid." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  const parsed = statusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data Green Log tidak valid." }, { status: 400 });
  }

  if (parsed.data.status === "rejected" && (parsed.data.rejectionReason?.trim().length || 0) < 5) {
    return NextResponse.json({ error: "Alasan penolakan minimal 5 karakter." }, { status: 400 });
  }

  try {
    const adminSupabase = getAdminSupabase();
    const { data: log, error: logError } = await adminSupabase
      .from("green_logs")
      .select("*")
      .eq("id", parsed.data.logId)
      .single();

    if (logError || !log) {
      return NextResponse.json({ error: "Green Log tidak ditemukan." }, { status: 404 });
    }

    const oldStatus = log.status as "pending" | "approved" | "rejected";
    const points = Number(log.points || 0);

    if (oldStatus !== parsed.data.status) {
      const { data: userRow, error: userError } = await adminSupabase
        .from("users")
        .select("total_points")
        .eq("uid", log.user_id)
        .single();

      if (userError || !userRow) {
        return NextResponse.json({ error: "Pengguna pemilik Green Log tidak ditemukan." }, { status: 404 });
      }

      let pointDelta = 0;
      if (parsed.data.status === "approved" && oldStatus !== "approved") pointDelta = points;
      if (oldStatus === "approved" && parsed.data.status !== "approved") pointDelta = -points;

      if (pointDelta !== 0) {
        const { error: pointsError } = await adminSupabase
          .from("users")
          .update({
            total_points: Math.max(0, Number(userRow.total_points || 0) + pointDelta),
            updated_at: new Date().toISOString(),
          })
          .eq("uid", log.user_id);

        if (pointsError) {
          return NextResponse.json({ error: "Gagal memperbarui poin pengguna." }, { status: 500 });
        }
      }
    }

    const { data: updated, error: updateError } = await adminSupabase
      .from("green_logs")
      .update({
        status: parsed.data.status,
        reviewed_by: admin.user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rejection_reason: parsed.data.status === "rejected" ? parsed.data.rejectionReason?.trim() || null : null,
      })
      .eq("id", parsed.data.logId)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json({ error: "Gagal memperbarui Green Log." }, { status: 500 });
    }

    return NextResponse.json({ log: mapLog(updated) });
  } catch {
    return NextResponse.json({ error: "Konfigurasi server admin tidak valid." }, { status: 500 });
  }
}
