"use client";
import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export default function AdminStatCard({ title, value, icon: Icon }: AdminStatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-emerald-600" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</p>
      <p className="text-sm text-slate-500 mt-1">{title}</p>
    </div>
  );
}
