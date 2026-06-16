"use client";
import { useState, useEffect } from "react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BadgeManager from "@/components/admin/BadgeManager";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getAllBadgesAdmin } from "@/lib/badges";
import { getAllUsers } from "@/lib/firestore";
import type { BadgeDB, UserProfile } from "@/types";

export default function AdminBadgesPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard();
  const [badges, setBadges] = useState<BadgeDB[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      Promise.all([getAllBadgesAdmin(), getAllUsers()])
        .then(([b, u]) => {
          setBadges(b);
          setUsers(u);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [authLoading, isAdmin]);

  if (authLoading || loading) return <AdminSidebar><LoadingSpinner /></AdminSidebar>;
  if (!isAdmin) return null;

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Kelola Badge
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {badges.length} badge · {badges.filter((b) => b.isActive).length} aktif
          </p>
        </div>

        <BadgeManager
          initialBadges={badges}
          users={users}
        />
      </div>
    </AdminSidebar>
  );
}
