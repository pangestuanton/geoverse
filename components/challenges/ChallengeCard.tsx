"use client";
import { motion } from "framer-motion";
import { Clock, Star, Target, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { Challenge } from "@/types";

interface ChallengeCardProps {
  challenge: Challenge;
}

const categoryColors: Record<string, string> = {
  waste: "bg-emerald-100 text-emerald-700",
  climate: "bg-blue-100 text-blue-700",
  geothermal: "bg-orange-100 text-orange-700",
};

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const [showSteps, setShowSteps] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[challenge.category] || "bg-slate-100 text-slate-700"}`}>
          {challenge.category === "waste" ? "Sampah" : challenge.category === "climate" ? "Iklim" : "Geothermal"}
        </span>
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="w-4 h-4 fill-amber-400" />
          <span className="text-sm font-semibold">{challenge.rewardPoints} poin</span>
        </div>
      </div>

      <h3 className="font-semibold text-slate-800 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {challenge.title}
      </h3>
      <p className="text-sm text-slate-500 mb-4">{challenge.description}</p>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
        <Clock className="w-3.5 h-3.5" />
        <span>Durasi: {challenge.duration}</span>
      </div>

      {/* Steps */}
      <button
        onClick={() => setShowSteps(!showSteps)}
        className="flex items-center gap-1 text-sm text-emerald-600 font-medium mb-3 hover:text-emerald-700 transition-colors"
      >
        {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showSteps ? "Sembunyikan langkah" : "Lihat langkah"}
      </button>

      {showSteps && (
        <motion.ol
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2 mb-4"
        >
          {challenge.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </motion.ol>
      )}

      <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
        <Target className="w-4 h-4" />
        Mulai Tantangan
      </button>
    </motion.div>
  );
}
