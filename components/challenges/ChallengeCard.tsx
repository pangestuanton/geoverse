"use client";
import { motion } from "framer-motion";
import { Clock, Star, Target, ChevronDown, ChevronUp, Users } from "lucide-react";
import { useState } from "react";
import type { Challenge } from "@/types";

interface ChallengeCardProps {
  challenge: Challenge;
}

const categoryColors: Record<string, string> = {
  waste: "bg-leaf-50 text-leaf-600 border-leaf-200",
  climate: "bg-sky-50 text-sky-600 border-sky-200",
  geothermal: "bg-earth-50 text-earth-600 border-earth-200",
};

const categoryLabels: Record<string, string> = {
  waste: "Sampah",
  climate: "Iklim",
  geothermal: "Geothermal",
};

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const [showSteps, setShowSteps] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-card border border-brand-100 hover:shadow-card-hover transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${categoryColors[challenge.category] || "bg-stone-100 text-stone-600"}`}>
          {categoryLabels[challenge.category] || challenge.category}
        </span>
        <div className="flex items-center gap-1 text-earth-500">
          <Star className="w-4 h-4 fill-earth-400" />
          <span className="text-sm font-bold">{challenge.rewardPoints} poin</span>
        </div>
      </div>

      <h3 className="font-bold text-charcoal-500 mb-2">{challenge.title}</h3>
      <p className="text-sm text-stone-400 mb-4">{challenge.description}</p>

      <div className="flex items-center gap-4 text-xs text-stone-400 mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Durasi: {challenge.duration}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          0 peserta
        </span>
      </div>

      <div className="mb-3 w-full h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: "0%" }} />
      </div>

      <button
        onClick={() => setShowSteps(!showSteps)}
        className="flex items-center gap-1 text-sm text-brand-600 font-medium mb-3 hover:text-brand-700 transition-colors"
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
            <li key={i} className="flex items-start gap-2 text-sm text-charcoal-300">
              <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </motion.ol>
      )}

      <button className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
        <Target className="w-4 h-4" />
        Mulai Tantangan
      </button>
    </motion.div>
  );
}
