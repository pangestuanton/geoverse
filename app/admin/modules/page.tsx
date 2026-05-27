"use client";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ModuleManager from "@/components/admin/ModuleManager";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { modules } from "@/data/modules";

export default function AdminModulesPage() {
  const { loading, isAdmin } = useAdminGuard();

  if (loading) return <AdminSidebar><LoadingSpinner /></AdminSidebar>;
  if (!isAdmin) return null;

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Kelola Modul
          </h1>
          <p className="text-slate-500 text-sm mt-1">{modules.length} modul tersedia</p>
        </div>
        <ModuleManager modules={modules} />
      </div>
    </AdminSidebar>
  );
}
