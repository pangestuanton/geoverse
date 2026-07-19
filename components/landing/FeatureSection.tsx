import { Flame, Leaf, Target, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Flame,
    title: "Belajar Geothermal",
    description: "Pahami energi panas bumi dengan bahasa sederhana dan contoh nyata dari potensi PLTP Ulubelu.",
    color: "bg-earth-50",
    iconColor: "text-earth-500",
  },
  {
    icon: Leaf,
    title: "Green Log Sampah",
    description: "Catat aksi pilah sampah harian — dari rumah, kost, sekolah, sampai lingkungan komunitas.",
    color: "bg-brand-50",
    iconColor: "text-brand-500",
  },
  {
    icon: Target,
    title: "Tantangan Komunitas",
    description: "Ikuti tantangan kecil yang membangun kebiasaan ramah lingkungan secara konsisten dan terukur.",
    color: "bg-sky-50",
    iconColor: "text-sky-500",
  },
  {
    icon: BarChart3,
    title: "Pantau Dampakmu",
    description: "Lihat perkembangan belajar, poin hijau, dan dampak aksi lingkungan melalui dashboard interaktif.",
    color: "bg-teal-50",
    iconColor: "text-teal-500",
  },
];

export default function FeatureSection() {
  return (
    <section id="fitur" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-600 mb-4 tracking-tight">
            Fitur Utama GeoVerse
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Platform edukasi lengkap yang menghubungkan literasi energi bersih dengan kebiasaan lingkungan sehari-hari.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="bg-surface rounded-2xl p-6 border border-stone-100 hover:border-brand-200 hover:shadow-card-hover transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-charcoal-500 mb-2">{feature.title}</h3>
              <p className="text-sm text-stone-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
