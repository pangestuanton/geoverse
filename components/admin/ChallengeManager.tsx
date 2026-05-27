"use client";
import type { Challenge } from "@/types";

interface ChallengeManagerProps {
  challenges: Challenge[];
}

export default function ChallengeManager({ challenges }: ChallengeManagerProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-emerald-50 border-b border-emerald-100">
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Judul Tantangan</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Durasi</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Poin Hadiah</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Kategori</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map((ch) => (
              <tr key={ch.id} className="border-b border-slate-50 hover:bg-emerald-50/30 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{ch.title}</td>
                <td className="px-6 py-4 text-slate-500">{ch.duration}</td>
                <td className="px-6 py-4 text-emerald-600 font-semibold">{ch.rewardPoints}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ch.category === "waste" ? "bg-emerald-100 text-emerald-700" :
                    ch.category === "climate" ? "bg-blue-100 text-blue-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {ch.category === "waste" ? "Sampah" : ch.category === "climate" ? "Iklim" : "Geothermal"}
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
