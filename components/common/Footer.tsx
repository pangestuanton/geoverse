import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#f0fdf4] border-t border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-emerald-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                GeoVerse
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Platform edukasi digital untuk anak muda Ulubelu. Belajar energi panas bumi, catat aksi pilah sampah, dan bangun kebiasaan hijau.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Navigasi
            </h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-slate-600 hover:text-emerald-600 transition-colors">Beranda</a>
              <a href="#fitur" className="block text-sm text-slate-600 hover:text-emerald-600 transition-colors">Fitur</a>
              <a href="#cara-kerja" className="block text-sm text-slate-600 hover:text-emerald-600 transition-colors">Cara Kerja</a>
              <Link href="/login" className="block text-sm text-slate-600 hover:text-emerald-600 transition-colors">Masuk</Link>
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Tentang
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              GeoVerse Digital Education Platform
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Private prototype · Eco-Tech Education for Ulubelu
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} GeoVerse. Aksi kecil, energi bersih, bumi lebih baik.
          </p>
          <p className="text-xs text-emerald-600 font-medium">
            🌱 Eco-Tech Education Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
