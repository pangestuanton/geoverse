"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Clock } from "lucide-react";
import type { Module } from "@/types";

interface ModuleCardProps {
  module: Module;
  isCompleted: boolean;
}

const difficultyColors: Record<string, string> = {
  Pemula: "bg-leaf-50 text-leaf-600 border-leaf-200",
  Menengah: "bg-earth-50 text-earth-600 border-earth-200",
  Lanjutan: "bg-red-50 text-red-600 border-red-200",
};

export default function ModuleCard({ module, isCompleted }: ModuleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-card border border-brand-100 hover:shadow-card-hover hover:border-brand-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyColors[module.difficulty] || "bg-stone-100 text-stone-600"}`}>
          {module.difficulty}
        </span>
        {isCompleted && (
          <div className="flex items-center gap-1 text-leaf-500">
            <CheckCircle className="w-5 h-5" />
          </div>
        )}
      </div>

      <h3 className="font-bold text-charcoal-500 mb-2 group-hover:text-brand-600 transition-colors">
        {module.title}
      </h3>
      <p className="text-sm text-stone-400 mb-4 line-clamp-2">{module.description}</p>

      <div className="flex items-center gap-4 text-xs text-stone-400 mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {module.readingTime}
        </span>
        <span>{module.categoryLabel}</span>
      </div>

      <Link
        href={`/learn/${module.slug}`}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          isCompleted
            ? "bg-brand-50 text-brand-600 hover:bg-brand-100"
            : "bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98]"
        }`}
      >
        <BookOpen className="w-4 h-4" />
        {isCompleted ? "Baca Ulang" : "Buka Modul"}
      </Link>
    </motion.div>
  );
}
