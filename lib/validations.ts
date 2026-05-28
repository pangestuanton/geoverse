import { z } from "zod";

// ===== Green Log =====
export const greenLogSchema = z.object({
  actionDate: z.string().min(1, "Tanggal aksi wajib diisi."),
  actionType: z.string().min(1, "Pilih jenis aksi terlebih dahulu."),
  wasteCategory: z.string().min(1, "Pilih kategori sampah terlebih dahulu."),
  estimatedKg: z
    .number({ error: "Estimasi berat harus berupa angka." })
    .min(0, "Estimasi berat tidak boleh bernilai negatif."),
  location: z.string().min(1, "Pilih lokasi terlebih dahulu."),
  note: z.string().max(250, "Catatan maksimal 250 karakter."),
});

export type GreenLogFormData = z.infer<typeof greenLogSchema>;

// ===== Display Name / Custom Name =====
export const displayNameSchema = z
  .string()
  .min(3, "Nama minimal 3 karakter.")
  .max(30, "Nama maksimal 30 karakter.")
  .trim()
  .refine((val) => val.trim().length > 0, "Nama tidak boleh kosong atau hanya spasi.")
  .refine(
    (val) => !/[<>\"'&;{}()\[\]\\\/]/.test(val),
    "Nama mengandung karakter yang tidak diperbolehkan."
  );

export const setupProfileSchema = z.object({
  displayName: displayNameSchema,
});

export type SetupProfileFormData = z.infer<typeof setupProfileSchema>;

// ===== Auth Email+Password =====
const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .refine(
    (val) => /[a-zA-Z]/.test(val) && /[0-9]/.test(val),
    "Password harus mengandung huruf dan angka."
  );

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email("Format email tidak valid."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ===== Module (Admin CRUD) =====
export const moduleSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug wajib diisi.")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda -"),
  title: z.string().min(3, "Judul minimal 3 karakter.").max(100, "Judul maksimal 100 karakter."),
  description: z.string().min(10, "Deskripsi minimal 10 karakter.").max(500, "Deskripsi maksimal 500 karakter."),
  category: z.string().min(1, "Kategori wajib diisi."),
  categoryLabel: z.string().min(1, "Label kategori wajib diisi."),
  readingTime: z.string().min(1, "Durasi baca wajib diisi."),
  difficulty: z.enum(["Pemula", "Menengah", "Lanjutan"]),
  reflection: z.string().max(1000, "Refleksi maksimal 1000 karakter."),
  status: z.enum(["draft", "published"]),
  sortOrder: z.number().int().min(0),
  content: z.array(z.string()).min(1, "Konten modul wajib diisi."),
  keyPoints: z.array(z.string()).min(1, "Minimal 1 poin kunci."),
});

export type ModuleFormData = z.infer<typeof moduleSchema>;

// ===== Quiz Question (Admin CRUD) =====
export const quizQuestionSchema = z
  .object({
    question: z.string().min(5, "Pertanyaan minimal 5 karakter."),
    options: z
      .array(z.string().min(1, "Opsi tidak boleh kosong."))
      .min(2, "Minimal 2 opsi jawaban.")
      .max(6, "Maksimal 6 opsi jawaban."),
    correctAnswer: z.number().int().min(0),
    explanation: z.string().max(500, "Penjelasan maksimal 500 karakter."),
    points: z.number().int().min(0).max(100),
  })
  .refine(
    (data) => data.correctAnswer < data.options.length,
    "Jawaban benar harus merujuk ke opsi yang valid."
  );

export type QuizQuestionFormData = z.infer<typeof quizQuestionSchema>;

// ===== Badge (Admin CRUD) =====
export const badgeSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug wajib diisi.")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda -"),
  name: z.string().min(2, "Nama badge minimal 2 karakter.").max(50, "Nama badge maksimal 50 karakter."),
  description: z.string().min(5, "Deskripsi minimal 5 karakter.").max(300, "Deskripsi maksimal 300 karakter."),
  icon: z.string().min(1, "Icon wajib diisi (emoji atau URL)."),
  category: z.string().min(1, "Kategori wajib diisi."),
});

export type BadgeFormData = z.infer<typeof badgeSchema>;

// ===== Award Badge to User =====
export const awardBadgeSchema = z.object({
  userId: z.string().min(1, "Pilih pengguna terlebih dahulu."),
  badgeId: z.string().min(1, "Pilih badge terlebih dahulu."),
  note: z.string().max(200, "Catatan maksimal 200 karakter.").optional(),
});

export type AwardBadgeFormData = z.infer<typeof awardBadgeSchema>;

// ===== Green Log Rejection =====
export const rejectGreenLogSchema = z.object({
  rejectionReason: z.string().min(5, "Alasan penolakan minimal 5 karakter.").max(300, "Alasan maksimal 300 karakter."),
});

export type RejectGreenLogFormData = z.infer<typeof rejectGreenLogSchema>;
