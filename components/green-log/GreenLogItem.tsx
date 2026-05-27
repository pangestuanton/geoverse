"use client";
import { Leaf, MapPin, Scale, Calendar } from "lucide-react";
import type { GreenLog } from "@/types";
import { STATUS_LABELS } from "@/types";

interface GreenLogItemProps {
  log: GreenLog;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function GreenLogItem({ log }: GreenLogItemProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-emerald-100 hover:border-emerald-200 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-slate-800 text-sm">{log.actionType}</p>
            <p className="text-xs text-slate-400">{log.wasteCategory}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[log.status]}`}>
          {STATUS_LABELS[log.status]}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {log.actionDate}
        </span>
        <span className="flex items-center gap-1">
          <Scale className="w-3 h-3" /> {log.estimatedKg} kg
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {log.location}
        </span>
        <span className="text-emerald-600 font-medium">+{log.points} poin</span>
      </div>
      {log.note && (
        <p className="text-xs text-slate-400 mt-2 italic">&ldquo;{log.note}&rdquo;</p>
      )}
    </div>
  );
}
