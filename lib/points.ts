import type { BadgeCheckData } from "@/types";

export function calculateGreenLogPoints(data: {
  estimatedKg: number;
}): number {
  let points = 10; // Base points for submitting
  if (data.estimatedKg >= 1) {
    points += 5; // Bonus for >= 1kg
  }
  return points;
}

export function calculateModulePoints(score: number): number {
  let points = 20; // Base points for completing module
  if (score >= 80) {
    points += 10; // Bonus for high quiz score
  }
  return points;
}

export function checkBadgeUnlock(data: BadgeCheckData): {
  newBadges: string[];
} {
  const newBadges: string[] = [];

  // Pemula Hijau - first green log
  if (data.totalGreenLogs >= 1) {
    newBadges.push("pemula-hijau");
  }

  // Sahabat Geothermal - complete one geothermal module
  const geothermalModules = [
    "apa-itu-energi-panas-bumi",
    "mengapa-ulubelu-penting",
    "energi-bersih-masa-depan",
  ];
  if (data.completedModules.some((m) => geothermalModules.includes(m))) {
    newBadges.push("sahabat-geothermal");
  }

  // Pejuang Pilah Sampah - 5 green logs
  if (data.totalGreenLogs >= 5) {
    newBadges.push("pejuang-pilah-sampah");
  }

  // Konsisten 7 Hari - 7 different days
  if (data.greenLogDays >= 7) {
    newBadges.push("konsisten-7-hari");
  }

  // Penggerak Komunitas - complete a challenge
  if (data.completedChallenges >= 1) {
    newBadges.push("penggerak-komunitas");
  }

  return { newBadges };
}
