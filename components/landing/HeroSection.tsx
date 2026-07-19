import Link from "next/link";
import { Flame, Leaf, BarChart3 } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16 bg-gradient-to-br from-brand-50 via-surface to-teal-50/30">
      <div className="absolute top-20 right-10 w-72 h-72 bg-teal-200/15 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-brand-100/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-earth-100/15 rounded-full blur-2xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-brand-100 text-brand-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              Eco-Tech Education Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-600 leading-tight mb-6 tracking-tight">
              Belajar Panas Bumi, Pilah Sampah, dan Aksi Iklim{" "}
              <span className="text-teal-600">dari Ulubelu</span>
            </h1>
            <p className="text-lg text-charcoal-300 leading-relaxed mb-8 max-w-lg">
              GeoVerse membantu anak muda dan komunitas memahami energi panas bumi, mencatat aksi pilah sampah harian, dan membangun kebiasaan hijau yang berdampak.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
              >
                Mulai Belajar
              </Link>
              <Link
                href="/login"
                className="bg-white hover:bg-brand-50 text-brand-700 border-2 border-brand-200 px-8 py-3.5 rounded-xl font-semibold text-base transition-all active:scale-[0.98]"
              >
                Catat Green Log
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 animate-fade-in-up animate-delay-200">
            {[
              {
                icon: Flame,
                title: "Energi Panas Bumi",
                desc: "Pahami potensi geothermal Ulubelu sebagai sumber energi bersih masa depan.",
                color: "bg-earth-50",
                iconColor: "text-earth-500",
              },
              {
                icon: Leaf,
                title: "Green Log Sampah",
                desc: "Catat aksi pilah sampah harian dan lihat progres kebiasaan hijau dari waktu ke waktu.",
                color: "bg-brand-50",
                iconColor: "text-brand-500",
              },
              {
                icon: BarChart3,
                title: "Aksi Iklim Komunitas",
                desc: "Ikuti tantangan lingkungan dan bangun kebiasaan ramah iklim bersama komunitas.",
                color: "bg-sky-50",
                iconColor: "text-sky-500",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-5 shadow-card border border-brand-100/50 hover:shadow-card-hover transition-all duration-300 flex items-start gap-4 animate-fade-in-up"
                style={{ animationDelay: `${400 + i * 100}ms` }}
              >
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-500 mb-1">{item.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
