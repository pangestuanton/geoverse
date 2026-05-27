// GeoVerse Type Definitions

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GreenLog {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  actionDate: string;
  actionType: string;
  wasteCategory: string;
  estimatedKg: number;
  location: string;
  note: string;
  points: number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Module {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  readingTime: string;
  difficulty: "Pemula" | "Menengah" | "Lanjutan";
  content: string[];
  keyPoints: string[];
  reflection: string;
  quiz: QuizQuestion[];
}

export interface UserProgress {
  moduleId: string;
  completed: boolean;
  score: number;
  completedAt: Date | null;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  checkUnlock: (data: BadgeCheckData) => boolean;
}

export interface UserBadge {
  badgeId: string;
  unlocked: boolean;
  unlockedAt: Date | null;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: string;
  rewardPoints: number;
  category: string;
  steps: string[];
}

export interface BadgeCheckData {
  totalGreenLogs: number;
  completedModules: string[];
  greenLogDays: number;
  completedChallenges: number;
}

export type GreenLogStatus = "pending" | "approved" | "rejected";

export const STATUS_LABELS: Record<GreenLogStatus, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export const ACTION_TYPES = [
  "Pilah sampah organik",
  "Pilah sampah anorganik",
  "Mengurangi plastik sekali pakai",
  "Membawa botol minum sendiri",
  "Mengumpulkan sampah daur ulang",
  "Edukasi teman/keluarga",
] as const;

export const WASTE_CATEGORIES = [
  "Organik",
  "Plastik",
  "Kertas",
  "Logam",
  "Kaca",
  "Residu",
] as const;

export const LOCATIONS = [
  "Kost",
  "Rumah",
  "Sekolah",
  "Kampus",
  "Komunitas",
  "Lainnya",
] as const;
