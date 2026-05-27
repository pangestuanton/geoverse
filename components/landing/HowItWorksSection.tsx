"use client";
import { motion } from "framer-motion";
import { LogIn, BookOpen, ClipboardList, TrendingUp } from "lucide-react";

const steps = [
  { icon: LogIn, title: "Masuk dengan Google", description: "Cukup satu klik untuk mulai." },
  { icon: BookOpen, title: "Pelajari modul singkat", description: "Baca, pahami, dan jawab kuis." },
  { icon: ClipboardList, title: "Catat aksi pilah sampah", description: "Gunakan Green Log setiap hari." },
  { icon: TrendingUp, title: "Lihat dampak dan progres", description: "Pantau poin dan kebiasaan hijau." },
];

export default function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="py-24 bg-[#f0fdf4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Cara Kerja GeoVerse
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Empat langkah sederhana untuk mulai belajar dan bergerak.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-emerald-200" />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center mb-4 relative">
                  <step.icon className="w-8 h-8 text-emerald-500" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
