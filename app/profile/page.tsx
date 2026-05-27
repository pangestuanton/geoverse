"use client";
import { useRouter } from "next/navigation";
import { Star, Leaf, BookOpen, Award, LogOut } from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Sidebar from "@/components/common/Sidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import BadgeCard from "@/components/badges/BadgeCard";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useGreenLogs } from "@/hooks/useGreenLogs";
import { signOutUser } from "@/lib/auth";
import { badges } from "@/data/badges";

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
  const unlockedBadgeIds = userBadges.filter((b) => b.unlocked).map((b) => b.badgeId);
  const earnedBadges = badges.filter((b) => unlockedBadgeIds.includes(b.id));

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
              <span className="text-3xl font-bold text-emerald-600">{(user?.displayName || "P").charAt(0)}</span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {user?.displayName || profile?.name || "Pengguna GeoVerse"}
          </h1>
          <p className="text-slate-500 text-sm">{user?.email}</p>
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
            <p className="text-xl font-bold text-slate-800">{unlockedBadgeIds.length}</p>
            <p className="text-xs text-slate-500">Badge</p>
          </div>
        </div>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Badge yang Diperoleh
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {earnedBadges.map((badge) => (
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
