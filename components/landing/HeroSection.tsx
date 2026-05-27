import Link from "next/link";
import { Flame, Leaf, BarChart3 } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16" style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%)" }}>
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              Eco-Tech Education Platform
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Belajar Energi, Sampah, dan Iklim{" "}
              <span className="text-emerald-600">dari Ulubelu</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
              GeoVerse membantu anak muda memahami energi panas bumi, mencatat aksi pilah sampah, dan membangun kebiasaan hijau berbasis komunitas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-1 duration-300"
              >
                Mulai Belajar
              </Link>
              <Link
                href="/login"
                className="bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-200 px-8 py-3.5 rounded-xl font-semibold text-base transition-all hover:-translate-y-1 duration-300"
              >
                Catat Green Log
              </Link>
            </div>
          </div>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 gap-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            {[
              {
                icon: Flame,
                title: "Energi Panas Bumi",
                desc: "Pahami potensi geothermal Ulubelu untuk masa depan energi bersih.",
                color: "bg-orange-50",
                iconColor: "text-orange-500",
              },
              {
                icon: Leaf,
                title: "Green Log Sampah",
                desc: "Catat aksi pilah sampah dan lihat progres kebiasaan hijau dari waktu ke waktu.",
                color: "bg-emerald-50",
                iconColor: "text-emerald-500",
              },
              {
                icon: BarChart3,
                title: "Aksi Iklim Komunitas",
                desc: "Ikuti tantangan dan bangun kebiasaan ramah lingkungan bersama komunitas.",
                color: "bg-blue-50",
                iconColor: "text-blue-500",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100/50 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex items-start gap-4 animate-fade-in-up"
                style={{ animationDelay: `${400 + i * 100}ms` }}
              >
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
