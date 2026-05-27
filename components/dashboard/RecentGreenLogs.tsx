import { Leaf } from "lucide-react";
import type { GreenLog } from "@/types";
import { STATUS_LABELS } from "@/types";

interface RecentGreenLogsProps {
  logs: GreenLog[];
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function RecentGreenLogs({ logs }: RecentGreenLogsProps) {
  const recent = logs.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
        <h3 className="font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Green Log Terbaru
        </h3>
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-slate-500 text-sm">Belum ada Green Log. Mulai catat aksi hijau pertamamu hari ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
      <h3 className="font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Green Log Terbaru
      </h3>
      <div className="space-y-3">
        {recent.map((log, i) => (
          <div key={log.id || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{log.actionType}</p>
                <p className="text-xs text-slate-400">{log.wasteCategory} · {log.estimatedKg} kg · {log.actionDate}</p>
              </div>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[log.status]}`}>
              {STATUS_LABELS[log.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
