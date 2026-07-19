"use client";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
}

export default function StatCard({ title, value, icon: Icon, color = "text-brand-600", bgColor = "bg-brand-50" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-brand-100 hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 sm:w-12 sm:h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-charcoal-600 tracking-tight">{value}</p>
      <p className="text-xs sm:text-sm text-stone-400 mt-1">{title}</p>
    </motion.div>
  );
}
