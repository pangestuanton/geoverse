"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import GreenLogTable from "@/components/admin/GreenLogTable";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { GreenLog } from "@/types";

export default function AdminGreenLogsPage() {
  const { loading: authLoading, isAdmin } = useAdminGuard();
  const [logs, setLogs] = useState<GreenLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = () => {
    fetch("/api/admin/green-logs")
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as { logs?: GreenLog[]; error?: string } | null;
        if (!response.ok) throw new Error(payload?.error || "Gagal memuat Green Log.");
        setLogs(payload?.logs || []);
        setError(null);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Gagal memuat Green Log."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading && isAdmin) fetchLogs();
  }, [authLoading, isAdmin]);

  const handleApprove = async (logId: string) => {
    try {
      const updated = await updateLogStatus(logId, "approved");
      setLogs((prev) => prev.map((log) => (log.id === logId ? updated : log)));
      toast.success("Green Log berhasil disetujui. Poin ditambahkan ke pengguna.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyetujui Green Log.");
      throw error;
    }
  };

  const handleReject = async (logId: string, reason: string) => {
    try {
      const updated = await updateLogStatus(logId, "rejected", reason);
      setLogs((prev) => prev.map((log) => (log.id === logId ? updated : log)));
      toast.success("Green Log ditolak. Alasan disimpan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menolak Green Log.");
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
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        <GreenLogTable
          logs={logs}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </AdminSidebar>
  );
}

async function updateLogStatus(logId: string, status: "approved" | "rejected", rejectionReason?: string) {
  const response = await fetch("/api/admin/green-logs", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logId, status, rejectionReason }),
  });
  const payload = (await response.json().catch(() => null)) as { log?: GreenLog; error?: string } | null;

  if (!response.ok || !payload?.log) {
    throw new Error(payload?.error || "Gagal memperbarui Green Log.");
  }

  return payload.log;
}
