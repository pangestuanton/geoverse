"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, Leaf, BookOpen, Award, LogOut, Edit2, User } from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Sidebar from "@/components/common/Sidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import BadgeCard from "@/components/badges/BadgeCard";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useGreenLogs } from "@/hooks/useGreenLogs";
import { signOutUser } from "@/lib/auth";
import { getUserBadgesWithDetails } from "@/lib/badges";
import { badges as staticBadges } from "@/data/badges";
import type { UserBadgeWithDetails } from "@/types";
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
  const [dbBadges, setDbBadges] = useState<UserBadgeWithDetails[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      getUserBadgesWithDetails(user.uid)
        .then(setDbBadges)
        .catch(() => setBadgesLoading(false))
        .finally(() => setBadgesLoading(false));
    } else {
      setBadgesLoading(false);
    }
  }, [user?.uid]);

  if (userLoading || logsLoading || badgesLoading) return <Sidebar><LoadingSpinner /></Sidebar>;

  const completedModules = progress.filter((p) => p.completed).length;

  // Badge yang ditampilkan:
  // 1. DB badges (dari Supabase) jika ada
  // 2. Fallback ke static badges yang unlocked
  const displayName = user?.displayName || profile?.displayName || profile?.name || "Pengguna GeoVerse";
  const googleName = user?.googleName;

  const unlockedStaticBadgeIds = userBadges.filter((b) => b.unlocked).map((b) => b.badgeId);
  const earnedStaticBadges = staticBadges.filter((b) => unlockedStaticBadgeIds.includes(b.id));

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
            <img src={user.photoURL} alt="" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-emerald-200" referrerPolicy="no-referrer" />
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
            <p className="text-xl font-bold text-slate-800">{dbBadges.length || unlockedStaticBadgeIds.length}</p>
            <p className="text-xs text-slate-500">Badge</p>
          </div>
        </div>

        {/* DB Badges */}
        {dbBadges.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Badge yang Diperoleh
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dbBadges.map((ub) => (
                <div key={ub.id} className="bg-white rounded-xl border border-emerald-100 p-4 flex items-start gap-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {ub.badge.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{ub.badge.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{ub.badge.description}</p>
                    {ub.awardedNote && (
                      <p className="text-xs text-emerald-600 mt-1 italic">"{ub.awardedNote}"</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {ub.unlockedAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback: Static badges (jika DB badges kosong) */}
        {dbBadges.length === 0 && earnedStaticBadges.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Badge yang Diperoleh
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {earnedStaticBadges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} isUnlocked={true} />
              ))}
            </div>
          </div>
        )}

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
