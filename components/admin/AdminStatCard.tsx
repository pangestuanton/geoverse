"use client";
import type { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export default function AdminStatCard({ title, value, icon: Icon }: AdminStatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-brand-100">
      <div className="flex items-center justify-between mb-3">
        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-brand-50 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-charcoal-600 tracking-tight">{value}</p>
      <p className="text-xs sm:text-sm text-stone-400 mt-1">{title}</p>
    </div>
  );
}
