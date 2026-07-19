"use client";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ChallengeManager from "@/components/admin/ChallengeManager";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { challenges } from "@/data/challenges";

export default function AdminChallengesPage() {
  const { loading, isAdmin } = useAdminGuard();

  if (loading) return <AdminSidebar><LoadingSpinner text="Memuat tantangan..." /></AdminSidebar>;
  if (!isAdmin) return null;

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-600 tracking-tight">
            Kelola Tantangan
          </h1>
          <p className="text-stone-400 text-sm mt-1">{challenges.length} tantangan tersedia</p>
        </div>
        <ChallengeManager challenges={challenges} />
      </div>
    </AdminSidebar>
  );
}
