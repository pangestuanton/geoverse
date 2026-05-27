"use client";
import type { Module } from "@/types";

interface ModuleManagerProps {
  modules: Module[];
}

export default function ModuleManager({ modules }: ModuleManagerProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-emerald-50 border-b border-emerald-100">
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Judul Modul</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Kategori</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Durasi Baca</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Tingkat</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((mod) => (
              <tr key={mod.id} className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{mod.title}</td>
                <td className="px-6 py-4 text-slate-500">{mod.categoryLabel}</td>
                <td className="px-6 py-4 text-slate-500">{mod.readingTime}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    mod.difficulty === "Pemula" ? "bg-emerald-100 text-emerald-700" :
                    mod.difficulty === "Menengah" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {mod.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button disabled className="text-xs bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg cursor-not-allowed">
                    Kelola
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
