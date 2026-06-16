"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Leaf, BookOpen, Award, LogOut, Edit2 } from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Sidebar from "@/components/common/Sidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import BadgeCard from "@/components/badges/BadgeCard";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useGreenLogs } from "@/hooks/useGreenLogs";
import { signOutUser } from "@/lib/auth";
import { getEarnedBadgeCards } from "@/lib/badgeDisplay";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, progress, userBadges, loading: userLoading } = useUserData();
  const { logs, loading: logsLoading } = useGreenLogs();

  if (userLoading || logsLoading) return <Sidebar><LoadingSpinner /></Sidebar>;

  const completedModules = progress.filter((p) => p.completed).length;

  const displayName = user?.displayName || profile?.displayName || profile?.name || "Pengguna GeoVerse";
  const googleName = user?.googleName;

  const earnedBadges = getEarnedBadgeCards(userBadges);
  const hasAnyBadge = earnedBadges.length > 0;

  const handleLogout = async () => {
    await signOutUser();
    router.push("/");
  };

  return (
    <Sidebar>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-emerald-100 text-center">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt=""
              width={80}
              height={80}
              className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-emerald-200 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-emerald-600">{displayName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {displayName}
          </h1>
          {/* Google name sebagai fallback info */}
          {googleName && googleName !== displayName && (
            <p className="text-xs text-slate-400 mt-0.5">
              Nama Google: {googleName}
            </p>
          )}
          <p className="text-slate-500 text-sm mt-1">{user?.email}</p>

          {/* Edit display name link */}
          <Link
            href="/setup-profile"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 mt-2 font-medium transition-colors"
            onClick={(e) => {
              // Reset profileSetupDone di sisi client agar halaman setup terbuka
              e.preventDefault();
              router.push("/setup-profile?edit=1");
            }}
          >
            <Edit2 className="w-3 h-3" />
            Ubah Nama Tampilan
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center border border-emerald-100">
            <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-slate-800">{profile?.totalPoints || 0}</p>
            <p className="text-xs text-slate-500">Total Poin</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-emerald-100">
            <Leaf className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-slate-800">{logs.length}</p>
            <p className="text-xs text-slate-500">Green Log</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-emerald-100">
            <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-slate-800">{completedModules}</p>
            <p className="text-xs text-slate-500">Modul Selesai</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-emerald-100">
            <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-slate-800">{earnedBadges.length}</p>
            <p className="text-xs text-slate-500">Badge</p>
          </div>
        </div>

        {/* Badge Section */}
        <div>
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Badge yang Diperoleh
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Badge tampil di sini setelah terbuka lewat aktivitas belajar atau aksi hijau.
              </p>
            </div>
            <Link href="/badges" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Lihat semua badge
            </Link>
          </div>

          {hasAnyBadge ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {earnedBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} isUnlocked={true} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-6 text-center">
              <Award className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
              <p className="font-semibold text-slate-700">Belum ada badge terbuka</p>
              <p className="mt-1 text-sm text-slate-500">
                Selesaikan modul dan catatan Green Log untuk mulai mengumpulkan badge.
              </p>
              <Link
                href="/learn"
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Mulai Belajar
              </Link>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-200 hover:bg-red-50 text-red-600 py-3 rounded-xl font-semibold text-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </Sidebar>
  );
}
