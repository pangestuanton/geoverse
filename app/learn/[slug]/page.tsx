"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Sidebar from "@/components/common/Sidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ModuleContent from "@/components/learn/ModuleContent";
import QuizCard from "@/components/learn/QuizCard";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { modules } from "@/data/modules";
import { badges } from "@/data/badges";
import { saveModuleProgress, updateUserPoints, saveUserBadge } from "@/lib/firestore";
import { calculateModulePoints, checkBadgeUnlock } from "@/lib/points";
import { createAdminNotification } from "@/lib/adminNotifications";

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
  const { user } = useAuth();
  const { progress, userBadges, refetch } = useUserData();
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  const slug = params.slug as string;
  const module = modules.find((m) => m.slug === slug);

  if (!module) {
    return (
      <Sidebar>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Modul tidak ditemukan</h2>
          <p className="text-slate-500 mb-4">Modul yang kamu cari tidak tersedia.</p>
          <Link href="/learn" className="text-emerald-600 hover:text-emerald-700 font-medium">
            ← Kembali ke daftar modul
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
    if (!user || quizScore === null) return;
    setSaving(true);

    try {
      // Save progress
      await saveModuleProgress(user.uid, module.id, quizScore);

      // Picu notifikasi admin untuk penyelesaian modul belajar
      await createAdminNotification({
        type: "new_progress",
        title: "Modul Belajar Selesai",
        message: `Menyelesaikan modul "${module.title}" dengan skor kuis ${quizScore}%.`,
        userId: user.uid,
        sourceCollection: "progress",
        sourceId: module.id,
      });

      // Calculate and award points
      const points = calculateModulePoints(quizScore);
      await updateUserPoints(user.uid, points);

      // Check badge unlocks
      const completedModuleIds = [
        ...progress.filter((p) => p.completed).map((p) => p.moduleId),
        module.id,
      ];
      const unlockedBadgeIds = userBadges.filter((b) => b.unlocked).map((b) => b.badgeId);

      for (const badge of badges) {
        if (unlockedBadgeIds.includes(badge.id)) continue;
        const shouldUnlock = badge.checkUnlock({
          totalGreenLogs: 0,
          completedModules: completedModuleIds,
          greenLogDays: 0,
          completedChallenges: 0,
        });
        if (shouldUnlock) {
          await saveUserBadge(user.uid, badge.id);
          toast.success(`Badge "${badge.name}" terbuka! ${badge.icon}`);
        }
      }

      setCompleted(true);
      toast.success(`Modul selesai! +${points} poin diperoleh.`);
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan progres. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sidebar>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back button */}
        <Link href="/learn" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke daftar modul
        </Link>

        {/* Module Content */}
        <ModuleContent module={module} />

        {/* Quiz */}
        {!isAlreadyCompleted && (
          <QuizCard questions={module.quiz} onComplete={handleQuizComplete} />
        )}

        {/* Completion */}
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
