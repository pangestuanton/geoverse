"use client";
import Link from "next/link";
import { BookOpen, Leaf, Star, Award } from "lucide-react";
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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { profile, progress, userBadges, loading: userLoading } = useUserData();
  const { logs, loading: logsLoading } = useGreenLogs();

  if (userLoading || logsLoading) return <Sidebar><LoadingSpinner /></Sidebar>;

  const completedModuleIds = progress.filter((p) => p.completed).map((p) => p.moduleId);
  const displayName = user?.displayName || profile?.name || "Pengguna";

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
