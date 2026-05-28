"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAuth } from "@/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import GreenLogTable from "@/components/admin/GreenLogTable";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getAllGreenLogs, updateGreenLogStatus } from "@/lib/firestore";
import type { GreenLog } from "@/types";

export default function AdminGreenLogsPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard();
  const { user } = useAuth();
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

  const handleApprove = async (logId: string) => {
    try {
      await updateGreenLogStatus(logId, "approved", user?.uid);
      setLogs((prev) =>
        prev.map((l) =>
          l.id === logId
            ? { ...l, status: "approved" as const, rejectionReason: null, reviewedBy: user?.uid }
            : l
        )
      );
      toast.success("Green Log berhasil disetujui. Poin ditambahkan ke pengguna.");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyetujui Green Log.");
      throw error;
    }
  };

  const handleReject = async (logId: string, reason: string) => {
    try {
      await updateGreenLogStatus(logId, "rejected", user?.uid, reason);
      setLogs((prev) =>
        prev.map((l) =>
          l.id === logId
            ? {
                ...l,
                status: "rejected" as const,
                rejectionReason: reason,
                reviewedBy: user?.uid,
              }
            : l
        )
      );
      toast.success("Green Log ditolak. Alasan disimpan.");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menolak Green Log.");
      throw error;
    }
  };

  if (authLoading || loading) return <AdminSidebar><LoadingSpinner /></AdminSidebar>;
  if (!isAdmin) return null;

  const pendingCount = logs.filter((l) => l.status === "pending").length;

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Catatan Green Log
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {logs.length} catatan tercatat
            {pendingCount > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {pendingCount} menunggu review
              </span>
            )}
          </p>
        </div>
        <GreenLogTable
          logs={logs}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </AdminSidebar>
  );
}
