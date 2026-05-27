"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Clock, BarChart2 } from "lucide-react";
import type { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  isCompleted: boolean;
}

const difficultyColors = {
  Pemula: "bg-emerald-100 text-emerald-700",
  Menengah: "bg-amber-100 text-amber-700",
  Lanjutan: "bg-red-100 text-red-700",
};

export default function ModuleCard({ module, isCompleted }: ModuleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 hover:shadow-md hover:border-emerald-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[module.difficulty]}`}>
          {module.difficulty}
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1 text-emerald-500">
            <CheckCircle className="w-5 h-5" />
          </div>
        )}
      </div>

      <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {module.title}
      </h3>
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{module.description}</p>

      <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {module.readingTime}
        </span>
        <span className="flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5" /> {module.categoryLabel}
        </span>
      </div>

      <Link
        href={`/learn/${module.slug}`}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isCompleted
            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            : "bg-emerald-500 text-white hover:bg-emerald-600"
        }`}
      >
        <BookOpen className="w-4 h-4" />
        {isCompleted ? "Baca Ulang" : "Buka Modul"}
      </Link>
    </motion.div>
  );
}
