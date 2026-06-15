"use client";
import { useState } from "react";
import { Filter, CheckCircle, XCircle, Clock, X, AlertCircle } from "lucide-react";
import type { GreenLog, GreenLogStatus } from "@/types";
import { STATUS_LABELS } from "@/types";

interface GreenLogTableProps {
  logs: GreenLog[];
  onApprove: (logId: string) => Promise<void>;
  onReject: (logId: string, reason: string) => Promise<void>;
}

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Menunggu" },
  approved: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Disetujui" },
  rejected: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Ditolak" },
};

type FilterStatus = GreenLogStatus | "all";

export default function GreenLogTable({ logs, onApprove, onReject }: GreenLogTableProps) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [rejectModal, setRejectModal] = useState<{ open: boolean; logId: string | null }>({
    open: false,
    logId: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filtered = filter === "all" ? logs : logs.filter((l) => l.status === filter);
  const counts = {
    all: logs.length,
    pending: logs.filter((l) => l.status === "pending").length,
    approved: logs.filter((l) => l.status === "approved").length,
    rejected: logs.filter((l) => l.status === "rejected").length,
  };

  const handleApprove = async (logId: string) => {
    setProcessingId(logId);
    try {
      await onApprove(logId);
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (logId: string) => {
    setRejectModal({ open: true, logId });
    setRejectReason("");
    setRejectError("");
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, logId: null });
    setRejectReason("");
    setRejectError("");
  };

  const handleRejectSubmit = async () => {
    const trimmed = rejectReason.trim();
    if (trimmed.length < 5) {
      setRejectError("Alasan penolakan minimal 5 karakter.");
      return;
    }
    if (trimmed.length > 300) {
      setRejectError("Alasan penolakan maksimal 300 karakter.");
      return;
    }
    if (!rejectModal.logId) return;

    setProcessingId(rejectModal.logId);
    try {
      await onReject(rejectModal.logId, trimmed);
      closeRejectModal();
    } catch {
      setRejectError("Gagal menolak log. Coba lagi.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "pending", "approved", "rejected"] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === s
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600"
            }`}
          >
            {s === "all" ? "Semua" : STATUS_LABELS[s]}{" "}
            <span className={`ml-1 text-xs ${filter === s ? "text-emerald-100" : "text-slate-400"}`}>
              ({counts[s]})
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-50 border-b border-emerald-100">
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Pengguna</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Aksi</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Kategori</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Berat</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Lokasi</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Tanggal</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Poin</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Aksi Admin</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Tidak ada catatan Green Log.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
                  const cfg = statusConfig[log.status];
                  const StatusIcon = cfg.icon;
                  const isProcessing = processingId === log.id;

                  return (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{log.userName}</div>
                        <div className="text-xs text-slate-400">{log.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{log.actionType}</td>
                      <td className="px-4 py-3 text-slate-600">{log.wasteCategory}</td>
                      <td className="px-4 py-3 text-slate-600">{log.estimatedKg} kg</td>
                      <td className="px-4 py-3 text-slate-600">{log.location}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{log.actionDate}</td>
                      <td className="px-4 py-3 font-medium text-amber-600">+{log.points}</td>
                      <td className="px-4 py-3">
                        <div>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                          {log.status === "rejected" && log.rejectionReason && (
                            <p className="text-xs text-red-500 mt-1 max-w-[140px] truncate" title={log.rejectionReason}>
                              {log.rejectionReason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.status !== "approved" && (
                          <button
                            id={`btn-approve-${log.id}`}
                            onClick={() => log.id && handleApprove(log.id)}
                            disabled={isProcessing}
                            className="text-xs bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-2.5 py-1.5 rounded-lg mr-1.5 transition-colors font-medium"
                          >
                            {isProcessing ? "..." : "Setujui"}
                          </button>
                        )}
                        {log.status !== "rejected" && (
                          <button
                            id={`btn-reject-${log.id}`}
                            onClick={() => log.id && openRejectModal(log.id)}
                            disabled={isProcessing}
                            className="text-xs bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 px-2.5 py-1.5 rounded-lg transition-colors font-medium border border-red-200"
                          >
                            Tolak
                          </button>
                        )}
                        {log.status === "approved" && (
                          <button
                            id={`btn-reject-approved-${log.id}`}
                            onClick={() => log.id && openRejectModal(log.id)}
                            disabled={isProcessing}
                            className="text-xs bg-slate-50 hover:bg-red-50 disabled:opacity-50 text-slate-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg transition-colors font-medium border border-slate-200"
                          >
                            Batalkan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Tolak Green Log
              </h3>
              <button
                onClick={closeRejectModal}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Berikan alasan penolakan yang jelas agar pengguna dapat memperbaiki catatannya.
            </p>

            <textarea
              id="input-reject-reason"
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setRejectError("");
              }}
              placeholder="Contoh: Data estimasi berat tidak masuk akal, atau bukti aksi tidak valid."
              rows={4}
              maxLength={300}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            <div className="flex items-center justify-between mt-1 mb-4">
              {rejectError ? (
                <div className="flex items-center gap-1 text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  {rejectError}
                </div>
              ) : (
                <span className="text-xs text-slate-400">Min. 5 karakter</span>
              )}
              <span className="text-xs text-slate-400">{rejectReason.length}/300</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeRejectModal}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                id="btn-confirm-reject"
                onClick={handleRejectSubmit}
                disabled={!!processingId}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {processingId ? "Memproses..." : "Konfirmasi Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
