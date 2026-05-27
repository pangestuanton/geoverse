import Link from "next/link";
import { BookOpen, CheckCircle } from "lucide-react";
import { modules } from "@/data/modules";

interface RecommendedModuleProps {
  completedModuleIds: string[];
}

export default function RecommendedModule({ completedModuleIds }: RecommendedModuleProps) {
  const nextModule = modules.find((m) => !completedModuleIds.includes(m.id));

  if (!nextModule) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
        <h3 className="font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Rekomendasi Modul
        </h3>
        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
          <p className="text-sm text-emerald-700 font-medium">Semua modul sudah selesai! Kerja bagus! 🎉</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
      <h3 className="font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Rekomendasi Modul
      </h3>
      <div className="flex items-start gap-4 p-4 bg-emerald-50/50 rounded-xl">
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800 mb-1">{nextModule.title}</p>
          <p className="text-sm text-slate-500 mb-3">{nextModule.description}</p>
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
            <span>⏱ {nextModule.readingTime}</span>
            <span>📊 {nextModule.difficulty}</span>
          </div>
          <Link
            href={`/learn/${nextModule.slug}`}
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Buka Modul
          </Link>
        </div>
      </div>
    </div>
  );
}
