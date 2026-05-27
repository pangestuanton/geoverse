import type { Challenge } from "@/types";

export const challenges: Challenge[] = [
  {
    id: "7-hari-pilah-sampah",
    title: "7 Hari Pilah Sampah dari Kost",
    description:
      "Tantang dirimu untuk memilah sampah setiap hari selama 7 hari berturut-turut. Catat setiap aksi di Green Log dan lihat progresmu tumbuh.",
    duration: "7 hari",
    rewardPoints: 50,
    category: "waste",
    steps: [
      "Siapkan dua wadah terpisah di kost atau rumahmu.",
      "Setiap hari, pisahkan sampah organik dan anorganik.",
      "Catat aksi pemilahan di Green Log setiap hari.",
      "Setelah 7 hari, lihat kembali catatan dan refleksikan kebiasaanmu.",
    ],
  },
  {
    id: "bebas-plastik-3-hari",
    title: "Bebas Plastik Sekali Pakai Selama 3 Hari",
    description:
      "Coba jalani 3 hari tanpa menggunakan plastik sekali pakai. Bawa botol minum, tas belanja, dan wadah makanan sendiri.",
    duration: "3 hari",
    rewardPoints: 30,
    category: "climate",
    steps: [
      "Siapkan botol minum dan tas belanja yang bisa dipakai ulang.",
      "Hindari membeli makanan atau minuman dengan kemasan plastik sekali pakai.",
      "Catat setiap hari di Green Log jika berhasil menghindari plastik.",
      "Setelah 3 hari, evaluasi tantangan mana yang paling sulit.",
    ],
  },
  {
    id: "ajak-3-teman-geothermal",
    title: "Ajak 3 Teman Memahami Geothermal",
    description:
      "Bagikan pengetahuan tentang energi panas bumi kepada setidaknya 3 teman. Bisa secara langsung atau melalui media sosial.",
    duration: "7 hari",
    rewardPoints: 40,
    category: "geothermal",
    steps: [
      "Pelajari setidaknya satu modul geothermal di GeoVerse.",
      "Ceritakan apa yang kamu pelajari kepada 3 teman.",
      "Catat di Green Log setiap kali kamu melakukan edukasi.",
      "Ajak temanmu untuk mencoba GeoVerse juga.",
    ],
  },
  {
    id: "audit-sampah-harian",
    title: "Audit Sampah Harian",
    description:
      "Selama 3 hari, catat semua jenis sampah yang kamu hasilkan. Kenali pola konsumsimu dan cari cara untuk menguranginya.",
    duration: "3 hari",
    rewardPoints: 35,
    category: "waste",
    steps: [
      "Siapkan catatan atau gunakan Green Log.",
      "Setiap hari, catat semua sampah yang kamu hasilkan beserta jenisnya.",
      "Di akhir hari ketiga, analisis pola sampahmu.",
      "Tentukan satu jenis sampah yang bisa kamu kurangi minggu depan.",
    ],
  },
];
