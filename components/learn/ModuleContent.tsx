"use client";
import { CheckCircle, Clock, BarChart2, MessageSquare } from "lucide-react";
import type { Module } from "@/types";

interface ModuleContentProps {
  module: Module;
}

export default function ModuleContent({ module }: ModuleContentProps) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {module.categoryLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-stone-400">
            <Clock className="w-3.5 h-3.5" /> {module.readingTime}
          </span>
          <span className="flex items-center gap-1 text-xs text-stone-400">
            <BarChart2 className="w-3.5 h-3.5" /> {module.difficulty}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-600 tracking-tight">
          {module.title}
        </h1>
      </div>

      <div className="space-y-4">
        {module.content.map((paragraph, i) => (
          <p key={i} className="text-charcoal-300 leading-relaxed text-[15px]">{paragraph}</p>
        ))}
      </div>

      <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100">
        <h3 className="font-bold text-brand-800 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-brand-500" />
          Poin Penting
        </h3>
        <ul className="space-y-3">
          {module.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-brand-700">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mt-2 shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-earth-50 rounded-2xl p-6 border border-earth-100">
        <h3 className="font-bold text-earth-800 mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-earth-500" />
          Refleksi
        </h3>
        <p className="text-earth-700 italic leading-relaxed">&ldquo;{module.reflection}&rdquo;</p>
      </div>
    </div>
  );
}
