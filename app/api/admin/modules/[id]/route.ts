import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/adminRoute";
import { moduleSchema } from "@/lib/validations";
import { deleteModule, getModuleWithQuestionsAdmin, updateModule } from "@/lib/modules";

const updateSchema = moduleSchema.partial();

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Modul tidak valid." }, { status: 400 });
  }

  try {
    const moduleRow = await getModuleWithQuestionsAdmin(id);
    if (!moduleRow) return NextResponse.json({ error: "Modul tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ module: moduleRow });
  } catch {
    return NextResponse.json({ error: "Gagal memuat modul." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Modul tidak valid." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data modul tidak valid." }, { status: 400 });
  }

  try {
    await updateModule(id, parsed.data);
    const moduleRow = await getModuleWithQuestionsAdmin(id);
    return NextResponse.json({ module: moduleRow });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui modul." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Modul tidak valid." }, { status: 400 });
  }

  try {
    await deleteModule(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal mengarsipkan modul." }, { status: 500 });
  }
}
