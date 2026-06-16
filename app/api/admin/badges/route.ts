import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { getAdminSupabase } from "@/utils/supabase/server-admin";
import { isAdminEmail } from "@/lib/auth";
import { badgeSchema } from "@/lib/validations";
import { mapBadgeFromDb } from "@/lib/badges";

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update"),
    badgeId: z.string().uuid("Badge tidak valid."),
    badge: badgeSchema,
  }),
  z.object({
    action: z.literal("toggle"),
    badgeId: z.string().uuid("Badge tidak valid."),
    isActive: z.boolean(),
  }),
]);

async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: NextResponse.json({ error: "Sesi login tidak valid." }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("uid", user.id)
    .maybeSingle();

  if (profileError) {
    return { error: NextResponse.json({ error: "Gagal memverifikasi akses admin." }, { status: 500 }) };
  }

  if (profile?.role !== "admin" && !isAdminEmail(user.email ?? null)) {
    return { error: NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 }) };
  }

  return { user };
}

export async function GET() {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  try {
    const adminSupabase = getAdminSupabase();
    const [{ data: badges, error: badgesError }, { data: users, error: usersError }] = await Promise.all([
      adminSupabase.from("badges").select("*").order("created_at", { ascending: false }),
      adminSupabase
        .from("users")
        .select("uid, name, display_name, email, photo_url, role, total_points, profile_setup_done, created_at, updated_at")
        .order("created_at", { ascending: false }),
    ]);

    if (badgesError || usersError) {
      return NextResponse.json({ error: "Gagal memuat data badge admin." }, { status: 500 });
    }

    return NextResponse.json({
      badges: (badges || []).map(mapBadgeFromDb),
      users: (users || []).map((user) => ({
        uid: user.uid,
        name: user.name,
        displayName: user.display_name || null,
        email: user.email,
        photoURL: user.photo_url || "",
        role: user.role || "user",
        totalPoints: user.total_points || 0,
        profileSetupDone: user.profile_setup_done || false,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Konfigurasi server admin tidak valid." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const parsed = badgeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data badge tidak valid." }, { status: 400 });
  }

  try {
    const adminSupabase = getAdminSupabase();
    const { data, error } = await adminSupabase
      .from("badges")
      .insert({
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        icon: parsed.data.icon,
        category: parsed.data.category,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: `Slug "${parsed.data.slug}" sudah dipakai badge lain.` }, { status: 409 });
      }
      return NextResponse.json({ error: "Gagal membuat badge." }, { status: 500 });
    }

    return NextResponse.json({ badge: mapBadgeFromDb(data) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Konfigurasi server admin tidak valid." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data badge tidak valid." }, { status: 400 });
  }

  try {
    const adminSupabase = getAdminSupabase();
    const payload =
      parsed.data.action === "update"
        ? {
            slug: parsed.data.badge.slug,
            name: parsed.data.badge.name,
            description: parsed.data.badge.description,
            icon: parsed.data.badge.icon,
            category: parsed.data.badge.category,
            updated_at: new Date().toISOString(),
          }
        : {
            is_active: parsed.data.isActive,
            updated_at: new Date().toISOString(),
          };

    const { data, error } = await adminSupabase
      .from("badges")
      .update(payload)
      .eq("id", parsed.data.badgeId)
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Slug sudah dipakai badge lain." }, { status: 409 });
      }
      return NextResponse.json({ error: "Gagal memperbarui badge." }, { status: 500 });
    }

    return NextResponse.json({ badge: mapBadgeFromDb(data) });
  } catch {
    return NextResponse.json({ error: "Konfigurasi server admin tidak valid." }, { status: 500 });
  }
}
