"use client";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { Badge } from "@/types";

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
}

export default function BadgeCard({ badge, isUnlocked }: BadgeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-2xl p-6 text-center border transition-all ${
        isUnlocked
          ? "bg-white border-emerald-200 shadow-sm hover:shadow-md"
          : "bg-slate-50 border-slate-200 opacity-60"
      }`}
    >
      {!isUnlocked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-4 h-4 text-slate-400" />
        </div>
      )}

      <div className={`text-5xl mb-4 ${!isUnlocked ? "grayscale" : ""}`}>
        {badge.icon}
      </div>

      <h3 className={`font-semibold mb-2 ${isUnlocked ? "text-slate-800" : "text-slate-500"}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {badge.name}
      </h3>

      <p className={`text-sm mb-3 ${isUnlocked ? "text-slate-500" : "text-slate-400"}`}>
        {badge.description}
      </p>

      <div className={`text-xs font-medium px-3 py-1.5 rounded-full inline-block ${
        isUnlocked ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}>
        {isUnlocked ? "✅ Terbuka" : `🔒 ${badge.requirement}`}
      </div>
    </motion.div>
  );
}
