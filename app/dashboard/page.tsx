"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Leaf, Star, Award, AlertTriangle, Megaphone, X } from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Sidebar from "@/components/common/Sidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import StatCard from "@/components/dashboard/StatCard";
import dynamic from "next/dynamic";
const DashboardChart = dynamic(() => import("@/components/dashboard/DashboardChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] bg-white border border-emerald-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400">
      Memuat Grafik...
    </div>
  )
});
import RecentGreenLogs from "@/components/dashboard/RecentGreenLogs";
import RecommendedModule from "@/components/dashboard/RecommendedModule";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useGreenLogs } from "@/hooks/useGreenLogs";
import { getDashboardConfig } from "@/lib/dashboard";
import type { DashboardSectionConfig } from "@/lib/dashboard";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

const ANNOUNCEMENT_STYLES = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  danger: "bg-red-50 border-red-200 text-red-800",
};

function DashboardContent() {
  const { user } = useAuth();
  const { profile, progress, userBadges, loading: userLoading, isOffline } = useUserData();
  const { logs, loading: logsLoading } = useGreenLogs();
  const [dashConfig, setDashConfig] = useState<DashboardSectionConfig | null>(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  useEffect(() => {
    getDashboardConfig().then(setDashConfig).catch(console.error);
  }, []);

  if (userLoading || logsLoading) return <Sidebar><LoadingSpinner /></Sidebar>;

  const completedModuleIds = progress.filter((p) => p.completed).map((p) => p.moduleId);
  // Prioritaskan displayName (custom name) dari useAuth, lalu profile, lalu fallback
  const displayName = user?.displayName || profile?.displayName || profile?.name || "Pengguna";

  return (
    <Sidebar>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Halo, {displayName}! 👋
            </h1>
            <p className="text-slate-500 mt-1">
              Aksi kecil tetap berarti kalau dilakukan konsisten.
            </p>
          </div>
          {user?.photoURL && (
            <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full border-2 border-emerald-200" referrerPolicy="no-referrer" />
          )}
        </div>

        {/* Admin Announcement Banner */}
        {dashConfig?.announcement && !announcementDismissed && (
          <div className={`border rounded-2xl px-4 py-3 flex items-start gap-3 text-sm ${ANNOUNCEMENT_STYLES[dashConfig.announcement.type]}`}>
            <Megaphone className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              {dashConfig.announcement.title && (
                <span className="font-semibold mr-1">{dashConfig.announcement.title}:</span>
              )}
              {dashConfig.announcement.body}
            </div>
            <button
              onClick={() => setAnnouncementDismissed(true)}
              className="p-0.5 hover:opacity-70 transition-opacity shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Offline fallback warning */}
        {isOffline && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-fade-in-up">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
            <div className="flex-1">
              <span className="font-semibold">Mode Offline Aktif</span> — Perangkat Anda sedang offline. Beberapa data terbaru mungkin tidak termuat.
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Modul Selesai" value={completedModuleIds.length} icon={BookOpen} color="text-blue-600" bgColor="bg-blue-50" />
          <StatCard title="Total Green Log" value={logs.length} icon={Leaf} />
          <StatCard title="Poin Hijau" value={profile?.totalPoints || 0} icon={Star} color="text-amber-600" bgColor="bg-amber-50" />
          <StatCard title="Badge Diperoleh" value={userBadges.filter((b) => b.unlocked).length} icon={Award} color="text-purple-600" bgColor="bg-purple-50" />
        </div>

        {/* Charts */}
        <DashboardChart logs={logs} />

        {/* Recommended Module + Recent Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecommendedModule completedModuleIds={completedModuleIds} />
          <RecentGreenLogs logs={logs} />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4">
          <Link href="/green-log" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Tambah Green Log
          </Link>
          <Link href="/learn" className="bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-200 px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Lanjut Belajar
          </Link>
        </div>
      </div>
    </Sidebar>
  );
}
