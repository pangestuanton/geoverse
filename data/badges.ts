import type { Badge, BadgeCheckData } from "@/types";

export const badges: Badge[] = [
  {
    id: "pemula-hijau",
    name: "Pemula Hijau",
    description: "Langkah pertamamu dalam aksi lingkungan. Setiap perjalanan dimulai dari satu langkah kecil.",
    icon: "\uD83C\uDF31",
    requirement: "Catat Green Log pertamamu",
    checkUnlock: (data: BadgeCheckData) => data.totalGreenLogs >= 1,
  },
  {
    id: "sahabat-geothermal",
    name: "Sahabat Geothermal",
    description: "Kamu sudah memahami dasar-dasar energi panas bumi. Pengetahuan adalah langkah awal perubahan.",
    icon: "\uD83C\uDF0B",
    requirement: "Selesaikan satu modul energi panas bumi",
    checkUnlock: (data: BadgeCheckData) => {
      const geothermalModules = [
        "apa-itu-energi-panas-bumi",
        "mengapa-ulubelu-penting",
        "energi-bersih-masa-depan",
      ];
      return data.completedModules.some((moduleSlug) => geothermalModules.includes(moduleSlug));
    },
  },
  {
    id: "pejuang-pilah-sampah",
    name: "Pejuang Pilah Sampah",
    description: "Lima kali mencatat aksi pilah sampah. Konsistensi kecil yang mulai membentuk kebiasaan.",
    icon: "\u267B\uFE0F",
    requirement: "Catat setidaknya 5 Green Log",
    checkUnlock: (data: BadgeCheckData) => data.totalGreenLogs >= 5,
  },
  {
    id: "konsisten-7-hari",
    name: "Konsisten 7 Hari",
    description: "Tujuh hari berturut-turut mencatat aksi hijau. Ini bukan soal sempurna, tapi soal bergerak terus.",
    icon: "\uD83D\uDD25",
    requirement: "Catat Green Log selama 7 hari berbeda",
    checkUnlock: (data: BadgeCheckData) => data.greenLogDays >= 7,
  },
  {
    id: "penggerak-komunitas",
    name: "Penggerak Komunitas",
    description: "Kamu sudah menyelesaikan tantangan komunitas. Aksi bersama selalu lebih kuat.",
    icon: "\uD83E\uDD1D",
    requirement: "Selesaikan setidaknya satu tantangan komunitas",
    checkUnlock: (data: BadgeCheckData) => data.completedChallenges >= 1,
  },
];
