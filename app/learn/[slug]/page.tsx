"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Sidebar from "@/components/common/Sidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ModuleContent from "@/components/learn/ModuleContent";
import QuizCard from "@/components/learn/QuizCard";
import { supabase } from "@/lib/supabase";
import { useUserData } from "@/hooks/useUserData";
import { getModuleBySlug } from "@/lib/modules";
import { saveModuleProgress, updateUserPoints } from "@/lib/firestore";
import { calculateModulePoints } from "@/lib/points";
import { createAdminNotification } from "@/lib/adminNotifications";
import type { ModuleDB } from "@/types";
// Konversi ModuleDB → format yang dipakai ModuleContent (backward compat)
import type { Module } from "@/types";

export default function ModuleDetailPage() {
  return (
    <ProtectedRoute>
      <ModuleDetailContent />
    </ProtectedRoute>
  );
}

function ModuleDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { progress, refetch } = useUserData();
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [module, setModule] = useState<ModuleDB | null | undefined>(undefined); // undefined = loading

  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      getModuleBySlug(slug)
        .then((m) => setModule(m))
        .catch(() => setModule(null));
    }
  }, [slug]);

  if (module === undefined) {
    return <Sidebar><LoadingSpinner /></Sidebar>;
  }

  if (!module) {
    return (
      <Sidebar>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Modul tidak ditemukan</h2>
          <p className="text-slate-500 mb-4">Modul yang kamu cari tidak tersedia atau sedang dalam perbaikan.</p>
          <Link href="/learn" className="text-emerald-600 hover:text-emerald-700 font-medium">
            {"<-"} Kembali ke daftar modul
          </Link>
        </div>
      </Sidebar>
    );
  }

  const existingProgress = progress.find((p) => p.moduleId === module.id);
  const isAlreadyCompleted = existingProgress?.completed || completed;

  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
  };

  const handleMarkComplete = async () => {
    if (quizScore === null) return;
    setSaving(true);

    try {
      const {
        data: { user: freshUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !freshUser) {
        toast.error("Silakan login terlebih dahulu.");
        return;
      }

      const uid = freshUser.id;

      await saveModuleProgress(uid, module.id, quizScore);

      createAdminNotification({
        type: "new_progress",
        title: "Modul Belajar Selesai",
        message: `Menyelesaikan modul "${module.title}" dengan skor kuis ${quizScore}%.`,
        userId: uid,
        sourceCollection: "progress",
        sourceId: module.id,
      }).catch(console.warn);

      const points = calculateModulePoints(quizScore);
      await updateUserPoints(uid, points);

      const badgeResponse = await fetch("/api/badges/sync", { method: "POST" });
      const badgePayload = (await badgeResponse.json().catch(() => null)) as
        | { unlocked?: { name: string; icon: string }[]; error?: string }
        | null;

      if (!badgeResponse.ok) {
        throw new Error(badgePayload?.error || "Gagal menyinkronkan badge.");
      }

      for (const badge of badgePayload?.unlocked || []) {
        toast.success(`Badge "${badge.name}" terbuka! ${badge.icon}`);
      }

      setCompleted(true);
      toast.success(`Modul selesai! +${points} poin diperoleh.`);
      refetch();
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menyimpan progres. Coba lagi.";
      console.warn("Gagal menyimpan progres modul:", { message });
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Konversi ModuleDB ke format Module untuk komponen ModuleContent
  const moduleForContent: Module = {
    id: module.id,
    slug: module.slug,
    title: module.title,
    description: module.description,
    category: module.category,
    categoryLabel: module.categoryLabel,
    readingTime: module.readingTime,
    difficulty: module.difficulty,
    content: module.content,
    keyPoints: module.keyPoints,
    reflection: module.reflection,
    quiz: (module.questions || []).map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
    })),
  };

  return (
    <Sidebar>
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/learn" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke daftar modul
        </Link>

        <ModuleContent module={moduleForContent} />

        {!isAlreadyCompleted && moduleForContent.quiz.length > 0 && (
          <QuizCard questions={moduleForContent.quiz} onComplete={handleQuizComplete} />
        )}

        {isAlreadyCompleted ? (
          <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-200">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-emerald-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Modul ini sudah selesai!
            </p>
            {existingProgress?.score !== undefined && (
              <p className="text-sm text-emerald-600 mt-1">Skor kuis: {existingProgress.score}%</p>
            )}
          </div>
        ) : quizScore !== null ? (
          <button
            onClick={handleMarkComplete}
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Tandai Selesai & Simpan Progres
              </>
            )}
          </button>
        ) : null}
      </div>
    </Sidebar>
  );
}
