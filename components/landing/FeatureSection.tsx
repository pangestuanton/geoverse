"use client";
import { motion } from "framer-motion";
import { Flame, Leaf, Target, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Flame,
    title: "Belajar Geothermal",
    description: "Pahami energi panas bumi dengan bahasa sederhana dan contoh yang dekat dengan kehidupan di Ulubelu.",
    color: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    icon: Leaf,
    title: "Green Log Sampah",
    description: "Catat aksi pilah sampah harian, mulai dari kost, rumah, sekolah, sampai komunitas.",
    color: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    icon: Target,
    title: "Tantangan Aksi Iklim",
    description: "Ikuti tantangan kecil yang membantu membangun kebiasaan ramah lingkungan secara konsisten.",
    color: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    icon: BarChart3,
    title: "Dashboard Dampak",
    description: "Lihat perkembangan belajar, poin hijau, dan dampak aksi lingkungan dari waktu ke waktu.",
    color: "bg-purple-50",
    iconColor: "text-purple-500",
  },
];

export default function FeatureSection() {
  return (
    <section id="fitur" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Fitur Utama GeoVerse
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Platform edukasi yang menghubungkan literasi energi bersih dengan kebiasaan lingkungan sehari-hari.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all group"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
