import { LogIn, BookOpen, ClipboardList, TrendingUp } from "lucide-react";

const steps = [
  { icon: LogIn, title: "Masuk dengan Google", description: "Satu klik langsung mulai, tanpa ribet." },
  { icon: BookOpen, title: "Pelajari modul singkat", description: "Baca materi, pahami konsep, lalu jawab kuis." },
  { icon: ClipboardList, title: "Catat aksi pilah sampah", description: "Gunakan Green Log setiap hari untuk mencatat kebiasaan." },
  { icon: TrendingUp, title: "Pantau progres & dampak", description: "Lihat poin, badge, dan kebiasaan hijau yang terus tumbuh." },
];

export default function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="py-20 sm:py-28 bg-surface-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-600 mb-4 tracking-tight">
            Cara Kerja GeoVerse
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            Empat langkah sederhana untuk mulai belajar dan bergerak bersama.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-brand-200" />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-2xl shadow-card border border-brand-100 flex items-center justify-center mb-4 relative">
                  <step.icon className="w-8 h-8 text-brand-500" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-bold text-charcoal-500 mb-1">{step.title}</h3>
                <p className="text-sm text-stone-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
