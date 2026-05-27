"use client";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Sidebar from "@/components/common/Sidebar";
import BadgeCard from "@/components/badges/BadgeCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useUserData } from "@/hooks/useUserData";
import { badges } from "@/data/badges";

export default function BadgesPage() {
  return (
    <ProtectedRoute>
      <BadgesContent />
    </ProtectedRoute>
  );
}

function BadgesContent() {
  const { userBadges, loading } = useUserData();

  if (loading) return <Sidebar><LoadingSpinner /></Sidebar>;

  const unlockedIds = userBadges.filter((b) => b.unlocked).map((b) => b.badgeId);

  return (
    <Sidebar>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Badge & Penghargaan
          </h1>
          <p className="text-slate-500 mt-1">
            Kumpulkan badge dengan menyelesaikan aksi hijau dan modul belajar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} isUnlocked={unlockedIds.includes(badge.id)} />
          ))}
        </div>
      </div>
    </Sidebar>
  );
}
