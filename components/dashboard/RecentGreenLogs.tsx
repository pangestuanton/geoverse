import { Leaf } from "lucide-react";
import type { GreenLog } from "@/types";
import { STATUS_LABELS } from "@/types";
import StatusBadge from "@/components/common/StatusBadge";

interface RecentGreenLogsProps {
  logs: GreenLog[];
}

export default function RecentGreenLogs({ logs }: RecentGreenLogsProps) {
  const recent = logs.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-100">
        <h3 className="font-bold text-charcoal-500 mb-4">Green Log Terbaru</h3>
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mb-3">
            <Leaf className="w-6 h-6 text-brand-400" />
          </div>
          <p className="text-sm text-stone-400">Belum ada Green Log. Mulai catat aksi hijau pertamamu hari ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-100">
      <h3 className="font-bold text-charcoal-500 mb-4">Green Log Terbaru</h3>
      <div className="space-y-3">
        {recent.map((log, i) => (
          <div key={log.id || i} className="flex items-center justify-between p-3 rounded-xl bg-stone-100/60 hover:bg-brand-50/50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4 text-brand-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-charcoal-400 truncate">{log.actionType}</p>
                <p className="text-xs text-stone-400">{log.wasteCategory} &middot; {log.estimatedKg} kg &middot; {log.actionDate}</p>
              </div>
            </div>
            <StatusBadge variant={log.status === "approved" ? "approved" : log.status === "rejected" ? "rejected" : "pending"} size="sm">
              {STATUS_LABELS[log.status]}
            </StatusBadge>
          </div>
        ))}
      </div>
    </div>
  );
}
