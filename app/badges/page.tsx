"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Sidebar from "@/components/common/Sidebar";
import BadgeCard from "@/components/badges/BadgeCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useUserData } from "@/hooks/useUserData";
import { getActiveBadges } from "@/lib/badges";
import { getStaticBadgeBySlug, toBadgeCardData } from "@/lib/badgeDisplay";
import type { BadgeDB } from "@/types";

export default function BadgesPage() {
  return (
    <ProtectedRoute>
      <BadgesContent />
    </ProtectedRoute>
  );
}

function BadgesContent() {
  const { userBadges, loading } = useUserData();
  const [badges, setBadges] = useState<BadgeDB[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveBadges()
      .then((data) => {
        setBadges(data);
        setError(null);
      })
      .catch(() => setError("Gagal memuat daftar badge."))
      .finally(() => setBadgesLoading(false));
  }, []);

  if (loading || badgesLoading) return <Sidebar><LoadingSpinner /></Sidebar>;

  const unlockedBadgeIds = new Set(userBadges.filter((b) => b.unlocked).map((b) => b.badgeId));
  const unlockedBadgeSlugs = new Set(
    userBadges
      .filter((b) => b.unlocked)
      .map((b) => b.badgeSlug || b.badge?.slug)
      .filter((slug): slug is string => Boolean(slug))
  );

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

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
        ) : badges.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-white p-8 text-center">
            <p className="font-semibold text-slate-700">Belum ada badge aktif</p>
            <p className="mt-1 text-sm text-slate-500">Badge akan tampil setelah admin mengaktifkannya.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => {
              const card = toBadgeCardData(badge);
              const staticBadge = getStaticBadgeBySlug(badge.slug);
              return (
                <BadgeCard
                  key={badge.id}
                  badge={card}
                  isUnlocked={
                    unlockedBadgeIds.has(badge.id) ||
                    unlockedBadgeSlugs.has(badge.slug) ||
                    Boolean(staticBadge && unlockedBadgeSlugs.has(staticBadge.id))
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </Sidebar>
  );
}
