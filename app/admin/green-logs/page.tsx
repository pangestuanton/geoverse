"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import GreenLogTable from "@/components/admin/GreenLogTable";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getAllGreenLogs, updateGreenLogStatus } from "@/lib/firestore";
import type { GreenLog, GreenLogStatus } from "@/types";

export default function AdminGreenLogsPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard();
  const [logs, setLogs] = useState<GreenLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    getAllGreenLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading && isAdmin) fetchLogs();
  }, [authLoading, isAdmin]);

  const handleStatusUpdate = async (logId: string, status: GreenLogStatus) => {
    try {
      await updateGreenLogStatus(logId, status);
      setLogs((prev) => prev.map((l) => l.id === logId ? { ...l, status } : l));
      toast.success("Status berhasil diperbarui.");
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui status.");
    }
  };

  if (authLoading || loading) return <AdminSidebar><LoadingSpinner /></AdminSidebar>;
  if (!isAdmin) return null;

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Catatan Green Log
          </h1>
          <p className="text-slate-500 text-sm mt-1">{logs.length} catatan tercatat</p>
        </div>
        <GreenLogTable logs={logs} onStatusUpdate={handleStatusUpdate} />
      </div>
    </AdminSidebar>
  );
}
