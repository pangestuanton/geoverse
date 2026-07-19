"use client";
import { useState, useEffect } from "react";
import { Users, Leaf, Scale, BookOpen, Target } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import dynamic from "next/dynamic";
const AdminChart = dynamic(() => import("@/components/admin/AdminChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] bg-white border border-brand-100 rounded-2xl animate-pulse flex items-center justify-center text-stone-400 text-sm">
      Memuat Grafik...
    </div>
  )
});
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminStatCard from "@/components/admin/AdminStatCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { UserProfile, GreenLog } from "@/types";

export default function AdminPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<GreenLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      Promise.all([
        fetch("/api/admin/users").then(async (response) => {
          const payload = (await response.json().catch(() => null)) as { users?: UserProfile[]; error?: string } | null;
          if (!response.ok) throw new Error(payload?.error || "Gagal memuat pengguna.");
          return payload?.users || [];
        }),
        fetch("/api/admin/green-logs").then(async (response) => {
          const payload = (await response.json().catch(() => null)) as { logs?: GreenLog[]; error?: string } | null;
          if (!response.ok) throw new Error(payload?.error || "Gagal memuat Green Log.");
          return payload?.logs || [];
        }),
      ])
        .then(([u, l]) => { setUsers(u); setLogs(l); setError(null); })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Gagal memuat ringkasan admin."))
        .finally(() => setLoading(false));
    }
  }, [authLoading, isAdmin]);

  if (authLoading || loading) return <AdminSidebar><LoadingSpinner text="Memuat ringkasan admin..." /></AdminSidebar>;
  if (!isAdmin) return null;

  const totalKg = logs.reduce((sum, l) => sum + (l.estimatedKg || 0), 0);

  return (
    <AdminSidebar>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-600 tracking-tight">
            Ringkasan Platform
          </h1>
          <p className="text-stone-400 mt-1 text-sm">Monitor aktivitas GeoVerse secara keseluruhan.</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminStatCard title="Total Pengguna" value={users.length} icon={Users} />
          <AdminStatCard title="Total Green Log" value={logs.length} icon={Leaf} />
          <AdminStatCard title="Sampah Terpilah" value={`${totalKg.toFixed(1)} kg`} icon={Scale} />
          <AdminStatCard title="Modul Tersedia" value={9} icon={BookOpen} />
          <AdminStatCard title="Tantangan Aktif" value={4} icon={Target} />
        </div>

        <AdminChart logs={logs} />
      </div>
    </AdminSidebar>
  );
}
