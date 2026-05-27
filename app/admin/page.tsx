"use client";
import { useState, useEffect } from "react";
import { Users, Leaf, Scale, BookOpen, Target } from "lucide-react";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import dynamic from "next/dynamic";
const AdminChart = dynamic(() => import("@/components/admin/AdminChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] bg-white border border-emerald-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400">
      Memuat Grafik...
    </div>
  )
});
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminStatCard from "@/components/admin/AdminStatCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getAllUsers, getAllGreenLogs } from "@/lib/firestore";
import type { UserProfile, GreenLog } from "@/types";

export default function AdminPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<GreenLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      Promise.all([getAllUsers(), getAllGreenLogs()])
        .then(([u, l]) => { setUsers(u); setLogs(l); })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [authLoading, isAdmin]);

  if (authLoading || loading) return <AdminSidebar><LoadingSpinner /></AdminSidebar>;
  if (!isAdmin) return null;

  const totalKg = logs.reduce((sum, l) => sum + (l.estimatedKg || 0), 0);

  return (
    <AdminSidebar>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ringkasan Platform
          </h1>
          <p className="text-slate-500 mt-1">Monitor aktivitas GeoVerse secara keseluruhan.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminStatCard title="Total Pengguna" value={users.length} icon={Users} />
          <AdminStatCard title="Total Green Log" value={logs.length} icon={Leaf} />
          <AdminStatCard title="Sampah Terpilah" value={`${totalKg.toFixed(1)} kg`} icon={Scale} />
          <AdminStatCard title="Modul Tersedia" value={9} icon={BookOpen} />
          <AdminStatCard title="Tantangan Aktif" value={4} icon={Target} />
        </div>

        <div>
          <AdminChart logs={logs} />
        </div>
      </div>
    </AdminSidebar>
  );
}
