"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
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
    <div className="h-[280px] bg-white border border-brand-100 rounded-2xl animate-pulse flex items-center justify-center text-stone-400 text-sm">
      Memuat Grafik...
    </div>
  )
});
import RecentGreenLogs from "@/components/dashboard/RecentGreenLogs";
import RecommendedModule from "@/components/dashboard/RecommendedModule";
import BadgeCard from "@/components/badges/BadgeCard";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useGreenLogs } from "@/hooks/useGreenLogs";
import { getDashboardConfig } from "@/lib/dashboard";
import type { DashboardSectionConfig } from "@/lib/dashboard";
import { getEarnedBadgeCards } from "@/lib/badgeDisplay";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

const ANNOUNCEMENT_STYLES: Record<string, string> = {
  info: "bg-sky-50 border-sky-200 text-sky-800",
  success: "bg-leaf-50 border-leaf-200 text-leaf-800",
  warning: "bg-earth-50 border-earth-200 text-earth-800",
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

  if (userLoading || logsLoading) return <Sidebar><LoadingSpinner text="Memuat dashboard..." /></Sidebar>;

  const completedModuleIds = progress.filter((p) => p.completed).map((p) => p.moduleId);
  const displayName = user?.displayName || profile?.displayName || profile?.name || "Pengguna";
  const earnedBadges = getEarnedBadgeCards(userBadges);
  const approvedLogs = logs.filter((l) => l.status === "approved");

  return (
    <Sidebar>
      <div className="space-y-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-600 tracking-tight">
              Halo, {displayName}!
            </h1>
            <p className="text-stone-400 mt-1 text-sm">
              Aksi kecil tetap berarti kalau dilakukan konsisten.
            </p>
          </div>
          {user?.photoURL && (
            <Image
              src={user.photoURL}
              alt=""
              width={48}
              height={48}
              className="w-12 h-12 rounded-full border-2 border-brand-200 object-cover shadow-sm"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

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
              aria-label="Tutup pengumuman"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {isOffline && (
          <div className="bg-earth-50 border border-earth-200 text-earth-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-fade-in-up">
            <AlertTriangle className="w-5 h-5 text-earth-600 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Mode Offline</span> &mdash; Beberapa data terbaru mungkin tidak termuat.
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Modul Selesai" value={completedModuleIds.length} icon={BookOpen} color="text-sky-600" bgColor="bg-sky-50" />
          <StatCard title="Total Green Log" value={logs.length} icon={Leaf} />
          <StatCard title="Poin Hijau" value={profile?.totalPoints || 0} icon={Star} color="text-earth-600" bgColor="bg-earth-50" />
          <StatCard title="Badge Diperoleh" value={userBadges.filter((b) => b.unlocked).length} icon={Award} color="text-teal-600" bgColor="bg-teal-50" />
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-charcoal-500">Badge Terbuka</h2>
              <p className="text-sm text-stone-400 mt-1">
                Badge yang sudah kamu buka akan tampil di sini.
              </p>
            </div>
            <Link href="/badges" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              Lihat semua
            </Link>
          </div>

          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} isUnlocked={true} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-8 text-center">
              <Award className="mx-auto mb-3 h-10 w-10 text-brand-300" />
              <p className="font-semibold text-charcoal-400">Belum ada badge terbuka</p>
              <p className="mt-1 text-sm text-stone-400">
                Ikuti modul belajar dan catat Green Log untuk mulai membuka badge.
              </p>
            </div>
          )}
        </div>

        <DashboardChart logs={approvedLogs} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecommendedModule completedModuleIds={completedModuleIds} />
          <RecentGreenLogs logs={logs} />
        </div>

        <div className="flex flex-wrap gap-4">
          <Link href="/green-log" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 active:scale-[0.98] shadow-sm shadow-brand-500/20">
            <Leaf className="w-4 h-4" />
            Tambah Green Log
          </Link>
          <Link href="/learn" className="bg-white hover:bg-brand-50 text-brand-700 border-2 border-brand-200 px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 active:scale-[0.98]">
            <BookOpen className="w-4 h-4" />
            Lanjut Belajar
          </Link>
        </div>
      </div>
    </Sidebar>
  );
}
