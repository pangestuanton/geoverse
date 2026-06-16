import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/adminRoute";
import { getAdminSupabase } from "@/utils/supabase/server-admin";

const configSchema = z.object({
  key: z.enum(["announcement", "featured_module_slug", "show_challenges", "show_leaderboard"]),
  value: z.record(z.string(), z.unknown()),
  isActive: z.boolean(),
});

function mapConfig(row: { id: string; key: string; value: Record<string, unknown>; is_active: boolean }) {
  return {
    id: row.id,
    key: row.key,
    value: row.value,
    isActive: row.is_active,
  };
}

export async function GET() {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  try {
    const { data, error } = await getAdminSupabase()
      .from("dashboard_config")
      .select("*")
      .order("key");

    if (error) {
      return NextResponse.json({ error: "Gagal memuat konfigurasi dashboard." }, { status: 500 });
    }

    return NextResponse.json({ configs: (data || []).map(mapConfig) });
  } catch {
    return NextResponse.json({ error: "Konfigurasi server admin tidak valid." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  const parsed = configSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Konfigurasi tidak valid." }, { status: 400 });
  }

  try {
    const { error } = await getAdminSupabase()
      .from("dashboard_config")
      .upsert(
        {
          key: parsed.data.key,
          value: parsed.data.value,
          is_active: parsed.data.isActive,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

    if (error) {
      return NextResponse.json({ error: "Gagal menyimpan konfigurasi dashboard." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Konfigurasi server admin tidak valid." }, { status: 500 });
  }
}
