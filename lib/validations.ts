import { z } from "zod";

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
