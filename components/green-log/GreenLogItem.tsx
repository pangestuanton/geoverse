"use client";
import { Leaf, MapPin, Scale, Calendar } from "lucide-react";
import type { GreenLog } from "@/types";
import { STATUS_LABELS } from "@/types";
import StatusBadge from "@/components/common/StatusBadge";

interface GreenLogItemProps {
  log: GreenLog;
}

export default function GreenLogItem({ log }: GreenLogItemProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-brand-100 hover:border-brand-200 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-brand-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-charcoal-400 text-sm truncate">{log.actionType}</p>
            <p className="text-xs text-stone-400">{log.wasteCategory}</p>
          </div>
        </div>
        <StatusBadge variant={log.status === "approved" ? "approved" : log.status === "rejected" ? "rejected" : "pending"} size="sm">
          {STATUS_LABELS[log.status]}
        </StatusBadge>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mt-3">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {log.actionDate}
        </span>
        <span className="flex items-center gap-1">
          <Scale className="w-3 h-3" /> {log.estimatedKg} kg
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {log.location}
        </span>
        <span className="text-brand-600 font-semibold">+{log.points} poin</span>
      </div>
      {log.note && (
        <p className="text-xs text-stone-400 mt-2 italic leading-relaxed">&ldquo;{log.note}&rdquo;</p>
      )}
    </div>
  );
}
