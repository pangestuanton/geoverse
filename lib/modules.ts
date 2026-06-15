/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from "./supabase";
import { getAdminSupabase } from "@/utils/supabase/server-admin";
import type { ModuleDB, QuizQuestionDB } from "@/types";
import { modules as staticModules } from "@/data/modules";
import type { Module } from "@/types";

// ===== MAPPING =====

function mapModuleFromDb(data: any, questions?: any[]): ModuleDB {
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description || "",
    category: data.category || "",
    categoryLabel: data.category_label || "",
    readingTime: data.reading_time || "",
    difficulty: data.difficulty || "Pemula",
    content: Array.isArray(data.content) ? data.content : [],
    keyPoints: Array.isArray(data.key_points) ? data.key_points : [],
    reflection: data.reflection || "",
    status: data.status || "published",
    sortOrder: data.sort_order || 0,
    questions: questions ? questions.map(mapQuestionFromDb) : undefined,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  };
}

function mapQuestionFromDb(data: any): QuizQuestionDB {
  return {
    id: data.id,
    moduleId: data.module_id,
    question: data.question,
    options: Array.isArray(data.options) ? data.options : [],
    correctAnswer: data.correct_answer,
    explanation: data.explanation || "",
    points: data.points || 10,
    sortOrder: data.sort_order || 0,
    isDeleted: data.is_deleted || false,
    version: data.version || 1,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  };
}

// ===== PUBLIC: Module yang published (untuk user) =====

/**
 * Otomatis seed modul statis ke database jika database modules kosong.
 * Berfungsi sebagai self-healing agar admin dashboard langsung terisi modul default.
 */
export async function seedStaticModules(): Promise<void> {
  const adminSupabase = getAdminSupabase();

  try {
    // Cek apakah sudah ada modul di DB
    const { data: existing, error: countError } = await adminSupabase
      .from("modules")
      .select("id")
      .limit(1);

    if (countError) {
      console.warn("[Seeder] Gagal cek modul eksisting:", countError);
      return;
    }

    if (existing && existing.length > 0) {
      // Sudah ada modul di database, skip seeding
      return;
    }

    console.info("[Seeder] Database modules kosong. Memulai seeding modul default...");

    for (const m of staticModules) {
      // Insert module tanpa id (biar DB generate UUID)
      const { data: moduleRow, error: modError } = await adminSupabase
        .from("modules")
        .insert({
          slug: m.slug,
          title: m.title,
          description: m.description,
          category: m.category,
          category_label: m.categoryLabel,
          reading_time: m.readingTime,
          difficulty: m.difficulty,
          content: m.content,
          key_points: m.keyPoints,
          reflection: m.reflection,
          status: "published",
          sort_order: 0,
        })
        .select("id")
        .single();

      if (modError || !moduleRow) {
        console.error(`[Seeder] Gagal seed modul "${m.slug}":`, modError);
        continue;
      }

      // Insert questions
      if (m.quiz && m.quiz.length > 0) {
        const questionPayloads = m.quiz.map((q, idx) => ({
          module_id: moduleRow.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: "",
          points: 10,
          sort_order: idx,
          is_deleted: false,
          version: 1,
        }));

        const { error: quizError } = await adminSupabase
          .from("quiz_questions")
          .insert(questionPayloads);

        if (quizError) {
          console.error(`[Seeder] Gagal seed soal kuis untuk modul "${m.slug}":`, quizError);
        }
      }
    }
    console.info("[Seeder] Seeding modul default selesai!");
  } catch (err) {
    console.error("[Seeder] Error selama seeding:", err);
  }
}

/**
 * Ambil modul published dari DB.
 * Fallback ke static data jika DB kosong (backward compatibility).
 */
export async function getPublishedModules(): Promise<ModuleDB[]> {
  await seedStaticModules();

  try {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      // Fallback ke static data
      return staticModules.map(staticToDb);
    }

    return data.map((m) => mapModuleFromDb(m));
  } catch {
    // Fallback ke static data jika DB tidak tersedia
    return staticModules.map(staticToDb);
  }
}

export async function getModuleBySlug(slug: string): Promise<ModuleDB | null> {
  try {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // Fallback ke static data
      const staticMod = staticModules.find((m) => m.slug === slug);
      if (staticMod) return staticToDb(staticMod);
      return null;
    }

    // Fetch questions untuk modul ini
    const { data: questions } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("module_id", data.id)
      .eq("is_deleted", false)
      .order("sort_order", { ascending: true });

    return mapModuleFromDb(data, questions || []);
  } catch {
    const staticMod = staticModules.find((m) => m.slug === slug);
    if (staticMod) return staticToDb(staticMod);
    return null;
  }
}

// ===== ADMIN: Semua modul termasuk draft =====

export async function getAllModulesAdmin(): Promise<ModuleDB[]> {
  await seedStaticModules();

  const adminSupabase = getAdminSupabase();
  const { data, error } = await adminSupabase
    .from("modules")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data || []).map((m) => mapModuleFromDb(m));
}

export async function getModuleWithQuestionsAdmin(moduleId: string): Promise<ModuleDB | null> {
  const adminSupabase = getAdminSupabase();

  const { data: module, error } = await adminSupabase
    .from("modules")
    .select("*")
    .eq("id", moduleId)
    .maybeSingle();

  if (error || !module) return null;

  const { data: questions } = await adminSupabase
    .from("quiz_questions")
    .select("*")
    .eq("module_id", moduleId)
    .eq("is_deleted", false)
    .order("sort_order", { ascending: true });

  return mapModuleFromDb(module, questions || []);
}

export async function createModule(moduleData: Omit<ModuleDB, "id" | "createdAt" | "updatedAt" | "questions">): Promise<ModuleDB> {
  const adminSupabase = getAdminSupabase();

  const { data, error } = await adminSupabase
    .from("modules")
    .insert({
      slug: moduleData.slug,
      title: moduleData.title,
      description: moduleData.description,
      category: moduleData.category,
      category_label: moduleData.categoryLabel,
      reading_time: moduleData.readingTime,
      difficulty: moduleData.difficulty,
      content: moduleData.content,
      key_points: moduleData.keyPoints,
      reflection: moduleData.reflection,
      status: moduleData.status,
      sort_order: moduleData.sortOrder,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapModuleFromDb(data);
}

export async function updateModule(
  moduleId: string,
  updates: Partial<Omit<ModuleDB, "id" | "createdAt" | "updatedAt" | "questions">>
): Promise<void> {
  const adminSupabase = getAdminSupabase();

  const payload: Record<string, any> = { updated_at: new Date().toISOString() };
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.categoryLabel !== undefined) payload.category_label = updates.categoryLabel;
  if (updates.readingTime !== undefined) payload.reading_time = updates.readingTime;
  if (updates.difficulty !== undefined) payload.difficulty = updates.difficulty;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.keyPoints !== undefined) payload.key_points = updates.keyPoints;
  if (updates.reflection !== undefined) payload.reflection = updates.reflection;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

  const { error } = await adminSupabase
    .from("modules")
    .update(payload)
    .eq("id", moduleId);

  if (error) throw error;
}

export async function deleteModule(moduleId: string): Promise<void> {
  // Soft delete: ubah status ke draft (agar progress user tidak hilang)
  await updateModule(moduleId, { status: "draft" });
}

// ===== QUIZ QUESTIONS =====

export async function createQuizQuestion(
  moduleId: string,
  question: Omit<QuizQuestionDB, "id" | "moduleId" | "createdAt" | "updatedAt" | "isDeleted" | "version">
): Promise<QuizQuestionDB> {
  const adminSupabase = getAdminSupabase();

  const { data, error } = await adminSupabase
    .from("quiz_questions")
    .insert({
      module_id: moduleId,
      question: question.question,
      options: question.options,
      correct_answer: question.correctAnswer,
      explanation: question.explanation,
      points: question.points,
      sort_order: question.sortOrder,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapQuestionFromDb(data);
}

export async function updateQuizQuestion(
  questionId: string,
  updates: Partial<Omit<QuizQuestionDB, "id" | "moduleId" | "createdAt" | "isDeleted">>
): Promise<void> {
  const adminSupabase = getAdminSupabase();

  const { data: existing } = await adminSupabase
    .from("quiz_questions")
    .select("version")
    .eq("id", questionId)
    .single();

  const payload: Record<string, any> = {
    updated_at: new Date().toISOString(),
    version: (existing?.version || 1) + 1, // versioning untuk audit
  };
  if (updates.question !== undefined) payload.question = updates.question;
  if (updates.options !== undefined) payload.options = updates.options;
  if (updates.correctAnswer !== undefined) payload.correct_answer = updates.correctAnswer;
  if (updates.explanation !== undefined) payload.explanation = updates.explanation;
  if (updates.points !== undefined) payload.points = updates.points;
  if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

  const { error } = await adminSupabase
    .from("quiz_questions")
    .update(payload)
    .eq("id", questionId);

  if (error) throw error;
}

export async function softDeleteQuizQuestion(questionId: string): Promise<void> {
  const adminSupabase = getAdminSupabase();

  const { error } = await adminSupabase
    .from("quiz_questions")
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq("id", questionId);

  if (error) throw error;
}

// ===== Konversi static Module → ModuleDB =====
function staticToDb(m: Module): ModuleDB {
  return {
    id: m.id,
    slug: m.slug,
    title: m.title,
    description: m.description,
    category: m.category,
    categoryLabel: m.categoryLabel,
    readingTime: m.readingTime,
    difficulty: m.difficulty,
    content: m.content,
    keyPoints: m.keyPoints,
    reflection: m.reflection,
    status: "published",
    sortOrder: 0,
    questions: m.quiz.map((q, idx) => ({
      id: `static-${m.id}-${idx}`,
      moduleId: m.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: "",
      points: 10,
      sortOrder: idx,
      isDeleted: false,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
