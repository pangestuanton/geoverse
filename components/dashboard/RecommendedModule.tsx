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
      <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-100">
        <h3 className="font-bold text-charcoal-500 mb-4">Rekomendasi Modul</h3>
        <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-xl">
          <CheckCircle className="w-6 h-6 text-brand-500" />
          <p className="text-sm text-brand-700 font-medium">Semua modul sudah selesai! Kerja bagus!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-100">
      <h3 className="font-bold text-charcoal-500 mb-4">Rekomendasi Modul</h3>
      <div className="flex items-start gap-4 p-4 bg-brand-50/50 rounded-xl">
        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-charcoal-500 mb-1">{nextModule.title}</p>
          <p className="text-sm text-stone-400 mb-3 line-clamp-2">{nextModule.description}</p>
          <div className="flex items-center gap-3 text-xs text-stone-400 mb-3">
            <span>{nextModule.readingTime}</span>
            <span>{nextModule.difficulty}</span>
          </div>
          <Link
            href={`/learn/${nextModule.slug}`}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Buka Modul
          </Link>
        </div>
      </div>
    </div>
  );
}
