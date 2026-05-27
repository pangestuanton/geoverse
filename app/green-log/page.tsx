"use client";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Sidebar from "@/components/common/Sidebar";
import GreenLogForm from "@/components/green-log/GreenLogForm";
import GreenLogItem from "@/components/green-log/GreenLogItem";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useGreenLogs } from "@/hooks/useGreenLogs";
import { Leaf } from "lucide-react";

export default function GreenLogPage() {
  return (
    <ProtectedRoute>
      <GreenLogContent />
    </ProtectedRoute>
  );
}

function GreenLogContent() {
  const { logs, loading, refetch } = useGreenLogs();

  return (
    <Sidebar>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Green Log
          </h1>
          <p className="text-slate-500 mt-1">
            Catat aksi pilah sampah dan kebiasaan hijau harianmu.
          </p>
        </div>

        <GreenLogForm onSuccess={refetch} />

        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Riwayat Green Log
          </h2>

          {loading ? (
            <LoadingSpinner text="Memuat riwayat..." />
          ) : logs.length === 0 ? (
            <EmptyState
              icon={<Leaf className="w-8 h-8 text-emerald-400" />}
              title="Belum ada Green Log"
              description="Mulai catat aksi hijau pertamamu hari ini. Setiap langkah kecil berarti."
            />
          ) : (
            <div className="space-y-3">
              {logs.map((log, i) => (
                <GreenLogItem key={log.id || i} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
