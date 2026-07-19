"use client";
import { useState, useEffect } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BadgeManager from "@/components/admin/BadgeManager";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { BadgeDB, UserProfile } from "@/types";

export default function AdminBadgesPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard();
  const [badges, setBadges] = useState<BadgeDB[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetch("/api/admin/badges")
        .then(async (response) => {
          const payload = (await response.json().catch(() => null)) as
            | { badges?: BadgeDB[]; users?: UserProfile[]; error?: string }
            | null;
          if (!response.ok) throw new Error(payload?.error || "Gagal memuat data badge.");
          setBadges(payload?.badges || []);
          setUsers(payload?.users || []);
          setError(null);
        })
        .catch((err: unknown) => { setError(err instanceof Error ? err.message : "Gagal memuat data badge."); })
        .finally(() => setLoading(false));
    }
  }, [authLoading, isAdmin]);

  if (authLoading || loading) return <AdminSidebar><LoadingSpinner text="Memuat badge..." /></AdminSidebar>;
  if (!isAdmin) return null;

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-600 tracking-tight">
            Kelola Badge
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            {badges.length} badge &middot; {badges.filter((b) => b.isActive).length} aktif
          </p>
        </div>
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}
        <BadgeManager initialBadges={badges} users={users} />
      </div>
    </AdminSidebar>
  );
}
