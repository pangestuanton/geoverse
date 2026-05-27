"use client";
import type { GreenLog, GreenLogStatus } from "@/types";
import { STATUS_LABELS } from "@/types";

interface GreenLogTableProps {
  logs: GreenLog[];
  onStatusUpdate: (logId: string, status: GreenLogStatus) => void;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function GreenLogTable({ logs, onStatusUpdate }: GreenLogTableProps) {
  return (
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
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">Belum ada catatan Green Log.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{log.userName}</td>
                  <td className="px-4 py-3 text-slate-600">{log.actionType}</td>
                  <td className="px-4 py-3 text-slate-600">{log.wasteCategory}</td>
                  <td className="px-4 py-3 text-slate-600">{log.estimatedKg} kg</td>
                  <td className="px-4 py-3 text-slate-600">{log.location}</td>
                  <td className="px-4 py-3 text-slate-400">{log.actionDate}</td>
                  <td className="px-4 py-3">
                    <select
                      value={log.status}
                      onChange={(e) => log.id && onStatusUpdate(log.id, e.target.value as GreenLogStatus)}
                      className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer ${statusColors[log.status]}`}
                    >
                      <option value="pending">Menunggu</option>
                      <option value="approved">Disetujui</option>
                      <option value="rejected">Ditolak</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
