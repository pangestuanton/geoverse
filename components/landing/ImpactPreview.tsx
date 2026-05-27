"use client";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Leaf, Recycle, Star } from "lucide-react";

function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

const metrics = [
  { icon: Leaf, value: 128, label: "aksi hijau tercatat", color: "text-emerald-500", bg: "bg-emerald-50" },
  { icon: Recycle, value: 46, label: "kg sampah terpilah", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: Star, value: 320, label: "poin komunitas terkumpul", color: "text-amber-500", bg: "bg-amber-50" },
];

export default function ImpactPreview() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Dampak Komunitas GeoVerse
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Angka-angka ini adalah gambaran dari aksi kecil yang dilakukan bersama.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 text-center border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all"
            >
              <div className={`w-16 h-16 ${metric.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
              </div>
              <p className="text-4xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <AnimatedCounter target={metric.value} />
              </p>
              <p className="text-sm text-slate-500">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Closing CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl p-12 border border-emerald-100"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Mulai dari aksi kecil, bangun kebiasaan hijau yang lebih besar.
          </h3>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">
            Bergabung dengan GeoVerse dan jadikan kebiasaan harian sebagai langkah nyata untuk lingkungan.
          </p>
          <Link
            href="/login"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-xl font-semibold text-base transition-all hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5"
          >
            Masuk ke GeoVerse
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
