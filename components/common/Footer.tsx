import Link from "next/link";
import Logo from "./Logo";

const navGroups = [
  {
    title: "Navigasi",
    links: [
      { label: "Beranda", href: "#" },
      { label: "Fitur", href: "#fitur" },
      { label: "Cara Kerja", href: "#cara-kerja" },
      { label: "Masuk", href: "/login" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal-700 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Logo variant="wordmark" size="md" href="/" />
            <p className="text-sm text-stone-400 leading-relaxed mt-4 max-w-xs">
              Platform edukasi digital untuk anak muda Ulubelu. Belajar energi panas bumi, catat aksi pilah sampah, dan bangun kebiasaan hijau.
            </p>
          </div>

          {navGroups.map((group) => (
            <div key={group.title}>
              <h4 className="font-semibold text-white mb-4">{group.title}</h4>
              <div className="space-y-2.5">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-stone-400 hover:text-leaf-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h4 className="font-semibold text-white mb-4">Tentang</h4>
            <p className="text-sm text-stone-400 leading-relaxed">
              GeoVerse Digital Education Platform &mdash; dibangun untuk mendukung literasi lingkungan dan energi bersih berbasis komunitas.
            </p>
            <p className="text-xs text-stone-500 mt-2">
              Private prototype &middot; Eco-Tech Education for Ulubelu
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-charcoal-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">
            &copy; {new Date().getFullYear()} GeoVerse. Aksi kecil, energi bersih, bumi lebih baik.
          </p>
          <p className="text-xs text-leaf-300 font-medium">
            Eco-Tech Education Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
