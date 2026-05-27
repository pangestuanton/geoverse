"use client";
import { CheckCircle, Clock, BarChart2, MessageSquare } from "lucide-react";
import type { Module } from "@/types";

interface ModuleContentProps {
  module: Module;
}

export default function ModuleContent({ module }: ModuleContentProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            {module.categoryLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" /> {module.readingTime}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <BarChart2 className="w-3.5 h-3.5" /> {module.difficulty}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {module.title}
        </h1>
      </div>

      {/* Content paragraphs */}
      <div className="space-y-4">
        {module.content.map((paragraph, i) => (
          <p key={i} className="text-slate-600 leading-relaxed">{paragraph}</p>
        ))}
      </div>

      {/* Key Points */}
      <div className="bg-emerald-50 rounded-2xl p-6">
        <h3 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          Poin Penting
        </h3>
        <ul className="space-y-3">
          {module.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-emerald-700">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Reflection */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
        <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <MessageSquare className="w-5 h-5 text-amber-500" />
          Refleksi
        </h3>
        <p className="text-amber-700 italic leading-relaxed">&ldquo;{module.reflection}&rdquo;</p>
      </div>
    </div>
  );
}
