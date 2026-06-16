import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/adminRoute";
import { moduleSchema } from "@/lib/validations";
import { createModule, getAllModulesAdmin } from "@/lib/modules";

export async function GET() {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  try {
    const modules = await getAllModulesAdmin();
    return NextResponse.json({ modules });
  } catch {
    return NextResponse.json({ error: "Gagal memuat modul." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  const parsed = moduleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data modul tidak valid." }, { status: 400 });
  }

  try {
    const createdModule = await createModule({
      slug: parsed.data.slug,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      categoryLabel: parsed.data.categoryLabel,
      readingTime: parsed.data.readingTime,
      difficulty: parsed.data.difficulty,
      content: parsed.data.content,
      keyPoints: parsed.data.keyPoints,
      reflection: parsed.data.reflection,
      status: parsed.data.status,
      sortOrder: parsed.data.sortOrder,
    });

    return NextResponse.json({ module: createdModule }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat modul." }, { status: 500 });
  }
}
