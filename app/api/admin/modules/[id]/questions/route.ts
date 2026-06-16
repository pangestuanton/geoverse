import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminUser } from "@/lib/adminRoute";
import { quizQuestionSchema } from "@/lib/validations";
import { createQuizQuestion, softDeleteQuizQuestion, updateQuizQuestion } from "@/lib/modules";

const createSchema = quizQuestionSchema.extend({
  sortOrder: z.number().int().min(0).optional(),
});

const patchSchema = quizQuestionSchema.extend({
  questionId: z.string().uuid("Soal tidak valid."),
});

const deleteSchema = z.object({
  questionId: z.string().uuid("Soal tidak valid."),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Modul tidak valid." }, { status: 400 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data soal tidak valid." }, { status: 400 });
  }

  try {
    const question = await createQuizQuestion(id, {
      question: parsed.data.question,
      options: parsed.data.options,
      correctAnswer: parsed.data.correctAnswer,
      explanation: parsed.data.explanation,
      points: parsed.data.points,
      sortOrder: parsed.data.sortOrder ?? 0,
    });
    return NextResponse.json({ question }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat soal." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Modul tidak valid." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data soal tidak valid." }, { status: 400 });
  }

  try {
    await updateQuizQuestion(parsed.data.questionId, {
      question: parsed.data.question,
      options: parsed.data.options,
      correctAnswer: parsed.data.correctAnswer,
      explanation: parsed.data.explanation,
      points: parsed.data.points,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui soal." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Modul tidak valid." }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data soal tidak valid." }, { status: 400 });
  }

  try {
    await softDeleteQuizQuestion(parsed.data.questionId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus soal." }, { status: 500 });
  }
}
